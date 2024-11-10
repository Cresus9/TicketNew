// src/tickets/tickets.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTicketTypeDto, UpdateTicketTypeDto } from './dto/ticket-type.dto';
import { CreateTicketDto } from './dto/ticket.dto';
import { Ticket, TicketType, TicketStatus } from '@prisma/client';
import { createHash } from 'crypto';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService,
    private notificationsService: NotificationsService,
  ) {}

  async createTicketType(data: CreateTicketTypeDto): Promise<TicketType> {
    // Verify event exists
    await this.eventsService.findOne(data.eventId);

    return this.prisma.ticketType.create({
      data: {
        ...data,
        available: data.quantity
      }
    });
  }

  async updateTicketType(id: string, data: UpdateTicketTypeDto): Promise<TicketType> {
    const ticketType = await this.prisma.ticketType.findUnique({
      where: { id }
    });

    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    // If increasing quantity, increase available tickets too
    let availableAdjustment = 0;
    if (data.quantity && data.quantity > ticketType.quantity) {
      availableAdjustment = data.quantity - ticketType.quantity;
    }

    return this.prisma.ticketType.update({
      where: { id },
      data: {
        ...data,
        available: {
          increment: availableAdjustment
        }
      }
    });
  }

  async createTicket(data: CreateTicketDto): Promise<Ticket> {
    // Step 1: Create the ticket without qrCode
    const createdTicket = await this.prisma.ticket.create({
      data: {
        ...data,
        qrCode: '', // Temporarily empty; will update later
      },
    });

    // Step 2: Generate QR code using the created ticket's details
    const qrCode = this.generateQRCode(createdTicket.id, createdTicket.eventId, createdTicket.userId);

    // Step 3: Update the ticket with the generated QR code
    const updatedTicket = await this.prisma.ticket.update({
      where: { id: createdTicket.id },
      data: { qrCode },
    });

    return updatedTicket;
  }

  async validateTicket(qrCode: string): Promise<{
    valid: boolean;
    ticket: Ticket | null;
    message: string;
  }> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        event: true,
        ticketType: true
      }
    });

    if (!ticket) {
      return {
        valid: false,
        ticket: null,
        message: 'Ticket not found'
      };
    }

    if (ticket.status === TicketStatus.USED) {
      return {
        valid: false,
        ticket,
        message: 'Ticket has already been used'
      };
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      return {
        valid: false,
        ticket,
        message: 'Ticket has been cancelled'
      };
    }

    const now = new Date();
    if (new Date(ticket.event.date) < now) {
      return {
        valid: false,
        ticket,
        message: 'Event has already passed'
      };
    }

    return {
      valid: true,
      ticket,
      message: 'Ticket is valid'
    };
  }

  async markTicketAsUsed(id: string): Promise<Ticket> {
    // Assuming 'id' here refers to the QR code; adjust if different
    const validation = await this.validateTicket(id);
    
    if (!validation.valid) {
      throw new BadRequestException(validation.message);
    }

    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: { status: TicketStatus.USED }
    });

    // Send notification to ticket owner
    await this.notificationsService.create({
      userId: ticket.userId,
      type: 'TICKET_USED',
      title: 'Ticket Used',
      message: 'Your ticket has been successfully scanned and validated.',
      metadata: {
        ticketId: id,
        eventId: ticket.eventId
      }
    });

    return ticket;
  }

  private generateQRCode(ticketId: string, eventId: string, userId: string): string {
    const payload = {
      ticketId,
      eventId,
      userId,
      timestamp: Date.now()
    };

    return createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex');
  }
}
