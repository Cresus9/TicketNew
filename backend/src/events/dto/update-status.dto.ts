import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Event, EventStatus, Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithRelationInput;
  }): Promise<Event[]> {
    try {
      const { skip, take, where, orderBy } = params;
      
      // Handle 'all' status filter
      let finalWhere = { ...where };
      if (where?.status === 'all') {
        delete finalWhere.status;
      }

      // Handle 'all' category filter
      if (where?.categories?.has === 'all') {
        delete finalWhere.categories;
      }

      return await this.prisma.event.findMany({
        skip,
        take,
        where: finalWhere,
        orderBy: orderBy || { date: 'asc' },
        include: {
          ticketTypes: true,
          _count: {
            select: {
              tickets: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Event | null> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        ticketTypes: true,
        _count: {
          select: {
            tickets: true
          }
        }
      }
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async create(data: any): Promise<Event> {
    try {
      const { ticketTypes, ...eventData } = data;

      // Parse date string and combine with time
      const dateTime = new Date(eventData.date);
      const [hours, minutes] = eventData.time.split(':');
      dateTime.setHours(parseInt(hours), parseInt(minutes));

      return await this.prisma.event.create({
        data: {
          ...eventData,
          date: dateTime,
          status: EventStatus.DRAFT,
          ticketTypes: {
            create: ticketTypes?.map((ticket: any) => ({
              name: ticket.name,
              description: ticket.description,
              price: ticket.price,
              quantity: ticket.quantity,
              available: ticket.quantity,
              maxPerOrder: ticket.maxPerOrder
            })) || []
          }
        },
        include: {
          ticketTypes: true,
          _count: {
            select: {
              tickets: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async update(id: string, data: any): Promise<Event> {
    try {
      const { ticketTypes, ...eventData } = data;

      // If date and time are provided, combine them
      if (eventData.date && eventData.time) {
        const dateTime = new Date(eventData.date);
        const [hours, minutes] = eventData.time.split(':');
        dateTime.setHours(parseInt(hours), parseInt(minutes));
        eventData.date = dateTime;
      }

      const event = await this.prisma.event.update({
        where: { id },
        data: eventData,
        include: {
          ticketTypes: true,
          _count: {
            select: {
              tickets: true
            }
          }
        }
      });

      if (ticketTypes) {
        // Delete existing ticket types
        await this.prisma.ticketType.deleteMany({
          where: { eventId: id }
        });

        // Create new ticket types
        await this.prisma.ticketType.createMany({
          data: ticketTypes.map((ticket: any) => ({
            eventId: id,
            name: ticket.name,
            description: ticket.description,
            price: ticket.price,
            quantity: ticket.quantity,
            available: ticket.quantity,
            maxPerOrder: ticket.maxPerOrder
          }))
        });

        return this.findOne(id);
      }

      return event;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Event with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async updateStatus(id: string, status: EventStatus): Promise<Event> {
    if (!Object.values(EventStatus).includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    return this.prisma.event.update({
      where: { id },
      data: { status },
      include: {
        ticketTypes: true,
        _count: {
          select: {
            tickets: true
          }
        }
      }
    });
  }

  async toggleFeatured(id: string, featured: boolean): Promise<Event> {
    return this.prisma.event.update({
      where: { id },
      data: { featured },
      include: {
        ticketTypes: true,
        _count: {
          select: {
            tickets: true
          }
        }
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.event.delete({
      where: { id }
    });
  }
}