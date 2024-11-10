// src/search/search.service.ts

import { Injectable, Inject, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SearchEventsDto } from './dto/search-events.dto';
import { EventStatus, Prisma } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Searches for events based on provided parameters.
   * Utilizes caching to optimize performance.
   * @param params - The search parameters.
   * @returns An object containing search results, total count, current page, and total pages.
   */
  async searchEvents(params: SearchEventsDto) {
    const cacheKey = `search:${JSON.stringify(params)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // Initialize an array to hold all AND filters
    const andFilters: Prisma.EventWhereInput[] = [];

    // Full-text search on title and description
    if (params.query) {
      andFilters.push({
        OR: [
          { title: { contains: params.query, mode: 'insensitive' } },
          { description: { contains: params.query, mode: 'insensitive' } },
        ],
      });
    }

    // Date range filter
    if (params.startDate || params.endDate) {
      andFilters.push({
        date: {
          gte: params.startDate ? new Date(params.startDate) : undefined,
          lte: params.endDate ? new Date(params.endDate) : undefined,
        },
      });
    }

    // Location filter
    if (params.location) {
      andFilters.push({
        location: { contains: params.location, mode: 'insensitive' },
      });
    }

    // Category filter
    if (params.category) {
      andFilters.push({
        categories: { has: params.category },
      });
    }

    // Price range filter
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      andFilters.push({
        price: {
          gte: params.minPrice,
          lte: params.maxPrice,
        },
      });
    }

    // Base where clause with status
    const where: Prisma.EventWhereInput = {
      status: EventStatus.PUBLISHED,
      ...(andFilters.length > 0 && { AND: andFilters }),
    };

    try {
      // Execute the Prisma query with the constructed where clause
      const [results, total] = await Promise.all([
        this.prisma.event.findMany({
          where,
          include: {
            ticketTypes: true,
            _count: {
              select: {
                tickets: true,
                orders: true,
              },
            },
          },
          orderBy: this.getOrderBy(params.sortBy),
          skip: (params.page - 1) * params.limit,
          take: params.limit,
        }),
        this.prisma.event.count({ where }),
      ]);

      const response = {
        results,
        total,
        page: params.page,
        totalPages: Math.ceil(total / params.limit),
      };

      // Cache the response for 5 minutes (300 seconds)
      await this.cacheManager.set(cacheKey, response,  300 );
      return response;
    } catch (error) {
      // Log the error if logging service is available
      // For now, throw an internal server error
      throw new InternalServerErrorException('Failed to search events.');
    }
  }

  /**
   * Retrieves search suggestions based on a query string.
   * Utilizes caching to optimize performance.
   * @param query - The query string for which to get suggestions.
   * @returns An array of suggestion objects containing title and location.
   */
  async getSuggestions(query: string) {
    const cacheKey = `suggestions:${query}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const suggestions = await this.prisma.event.findMany({
        where: {
          status: EventStatus.PUBLISHED,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          title: true,
          location: true,
        },
        take: 5,
      });

      // Cache the suggestions for 5 minutes (300 seconds)
      await this.cacheManager.set(cacheKey, suggestions,  300 );
      return suggestions;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve suggestions.');
    }
  }

  /**
   * Retrieves the top 10 most popular search queries.
   * Utilizes caching to optimize performance.
   * @returns An array of search log objects containing the query and its count.
   */
  async getPopularSearches() {
    const cacheKey = 'popular-searches';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const searches = await this.prisma.searchLog.groupBy({
        by: ['query'],
        _count: {
          query: true,
        },
        orderBy: {
          _count: {
            query: 'desc',
          },
        },
        take: 10,
      });

      // Cache the popular searches for 1 hour (3600 seconds)
      await this.cacheManager.set(cacheKey, searches,  3600 );
      return searches;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve popular searches.');
    }
  }

  /**
   * Logs a user's search query.
   * @param query - The search query string.
   * @param userId - (Optional) The ID of the user performing the search.
   */
  async logSearch(query: string, userId?: string) {
    try {
      await this.prisma.searchLog.create({
        data: {
          query,
          userId,
        },
      });
    } catch (error) {
      // Optionally handle the error, e.g., log it
      // For now, we'll silently fail to avoid disrupting the user experience
    }
  }

  /**
   * Determines the ordering of search results based on the sortBy parameter.
   * @param sortBy - The sorting criteria.
   * @returns An object defining the order by clause for Prisma.
   */
  private getOrderBy(sortBy?: string): Prisma.EventOrderByWithRelationInput {
    switch (sortBy) {
      case 'price_asc':
        return { price: 'asc' };
      case 'price_desc':
        return { price: 'desc' };
      case 'date_asc':
        return { date: 'asc' };
      case 'date_desc':
        return { date: 'desc' };
      case 'popularity':
        return { ticketsSold: 'desc' };
      default:
        return { date: 'asc' };
    }
  }
}
