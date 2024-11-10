import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event, Prisma, EventStatus } from '@prisma/client';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async create(data: CreateEventDto): Promise<Event> {
    const event = await this.prisma.$transaction(async (prisma) => {
      // Create the event
      const event = await prisma.event.create({
        data: {
          title: data.title,
          description: data.description,
          date: new Date(data.date),
          time: data.time,
          location: data.location,
          imageUrl: data.imageUrl,
          price: data.price,
          currency: data.currency,
          capacity: data.capacity,
          status: data.status || EventStatus.DRAFT,
          categories: data.categories,
        },
      });

      // Create ticket types for the event
      await Promise.all(
        data.ticketTypes.map((ticketType) =>
          prisma.ticketType.create({
            data: {
              ...ticketType,
              eventId: event.id,
              available: ticketType.quantity,
            },
          })
        )
      );

      return event;
    });

    // Invalidate cache
    await this.invalidateCache();

    return event;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithRelationInput;
  }): Promise<Event[]> {
    const cacheKey = this.cacheService.generateKey('events', params);
    
    return this.cacheService.getOrSet(
      cacheKey,
      () => this.prisma.event.findMany({
        ...params,
        include: {
          ticketTypes: true,
          _count: {
            select: {
              orders: true,
              tickets: true
            }
          }
        }
      }),
      3600 // Cache for 1 hour
    );
  }

  async findOne(id: string): Promise<Event> {
    const cacheKey = `event:${id}`;
    
    const event = await this.cacheService.getOrSet(
      cacheKey,
      () => this.prisma.event.findUnique({
        where: { id },
        include: {
          ticketTypes: true,
          _count: {
            select: {
              orders: true,
              tickets: true
            }
          }
        }
      }),
      3600
    );

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  // async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
  //   // Check if the event exists
  //   const existingEvent = await this.prisma.event.findUnique({
  //     where: { id },
  //   });

  //   if (!existingEvent) {
  //     throw new NotFoundException(`Event with ID ${id} not found.`);
  //   }

  //   // Prepare the data for Prisma
  //   const data: Prisma.EventUpdateInput = {
  //     ...updateEventDto, // Spread other fields

  //     // Handle ticketTypes if provided
  //     ...(updateEventDto.ticketTypes && {
  //       ticketTypes: {
  //         // Example strategy: Delete all existing and create new
  //         deleteMany: {},
  //         create: updateEventDto.ticketTypes,
  //       },
  //     }),
  //   };

  //   return this.prisma.event.update({
  //     where: { id },
  //     data,
  //     include: { ticketTypes: true }, // Include related ticketTypes if needed
  //   });
  // }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const existingEvent = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found.`);
    }

    const ticketTypeOperations = {
      update: updateEventDto.ticketTypes
        ?.filter((tt) => tt.id)
        .map((tt) => ({
          where: { id: tt.id },
          data: {
            ...(tt.name && { name: tt.name }),
            ...(tt.description && { description: tt.description }),
            ...(tt.price !== undefined && { price: tt.price }),
            ...(tt.quantity !== undefined && { quantity: tt.quantity }),
            ...(tt.maxPerOrder !== undefined && { maxPerOrder: tt.maxPerOrder }),
          },
        })),
      create: updateEventDto.ticketTypes
        ?.filter((tt) => !tt.id)
        .map((tt) => ({
          name: tt.name as string,
          description: tt.description as string,
          price: tt.price as number,
          quantity: tt.quantity as number,
          maxPerOrder: tt.maxPerOrder as number,
          available: tt.quantity as number,
        })),
    };

    const data: Prisma.EventUpdateInput = {
      ...updateEventDto,
      ticketTypes: ticketTypeOperations,
    };

    return this.prisma.event.update({
      where: { id },
      data,
      include: { ticketTypes: true },
    });
  }


  async delete(id: string): Promise<void> {
    try {
      await this.prisma.event.delete({
        where: { id }
      });

      // Invalidate cache
      await this.invalidateCache(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Event with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async updateTicketInventory(eventId: string, ticketTypeId: string, quantity: number): Promise<void> {
    const ticketType = await this.prisma.ticketType.findUnique({
      where: { id: ticketTypeId }
    });

    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    if (ticketType.available < quantity) {
      throw new BadRequestException('Not enough tickets available');
    }

    await this.prisma.ticketType.update({
      where: { id: ticketTypeId },
      data: {
        available: {
          decrement: quantity
        }
      }
    });

    await this.invalidateCache(eventId);
  }

  private async invalidateCache(id?: string): Promise<void> {
    if (id) {
      await this.cacheService.del(`event:${id}`);
    }
    await this.cacheService.del('events:*');
  }
} 