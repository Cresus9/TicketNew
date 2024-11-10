// src/realtime/realtime.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Server } from 'socket.io';
import { WebSocketServer } from '@nestjs/websockets';
import { ChatUserDto } from './dto/chat-user.dto'; // Import the DTO
import { Role, UserStatus } from '@prisma/client';

@Injectable()
export class RealtimeService {
  @WebSocketServer()
  private server: Server;

  private userConnections = new Map<string, Set<string>>();
  private readonly logger = new Logger(RealtimeService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Retrieves all chat users with selected fields.
   * @returns An array of ChatUserDto objects.
   */
  async getChatUsers(): Promise<ChatUserDto[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true, // Now recognized
      },
    });
  }

  /**
   * Handles user connection by adding their socket ID and updating their online status.
   * @param userId - The ID of the user.
   * @param socketId - The socket ID of the user's connection.
   */
  async handleUserConnect(userId: string, socketId: string) {
    const userSet = this.getUserSet(userId);
    userSet.add(socketId);
    this.logger.log(`User ${userId} connected with socket ${socketId}`);

    await this.prisma.user.update({
      where: { id: userId },
      data: { isOnline: true },
    });
  }

  /**
   * Handles user disconnection by removing their socket ID and updating their online status if necessary.
   * @param userId - The ID of the user.
   * @param socketId - The socket ID of the user's connection.
   */
  async handleUserDisconnect(userId: string, socketId: string) {
    const userSet = this.userConnections.get(userId);
    if (userSet) {
      userSet.delete(socketId);
      this.logger.log(`User ${userId} disconnected from socket ${socketId}`);

      if (userSet.size === 0) {
        this.userConnections.delete(userId);
        await this.prisma.user.update({
          where: { id: userId },
          data: { isOnline: false, lastSeen: new Date() },
        });
        this.logger.log(`User ${userId} is now offline`);
      }
    } else {
      this.logger.warn(`Attempted to disconnect user ${userId} who has no active connections`);
    }
  }

  /**
   * Retrieves all event IDs that a user is attending.
   * @param userId - The ID of the user.
   * @returns An array of event IDs.
   */
  async getUserEvents(userId: string): Promise<string[]> {
    const userEvents = await this.prisma.eventAttendee.findMany({
      where: { userId },
      select: { eventId: true },
    });
    return userEvents.map(event => event.eventId);
  }

  /**
   * Adds a user to an event. If the user is already attending, it does nothing.
   * @param userId - The ID of the user.
   * @param eventId - The ID of the event.
   */
  async addUserToEvent(userId: string, eventId: string) {
    await this.prisma.eventAttendee.upsert({
      where: {
        userId_eventId: { userId, eventId },
      },
      update: {},
      create: { userId, eventId },
    });
    this.logger.log(`User ${userId} added to event ${eventId}`);
  }

  /**
   * Removes a user from an event.
   * @param userId - The ID of the user.
   * @param eventId - The ID of the event.
   */
  async removeUserFromEvent(userId: string, eventId: string) {
    await this.prisma.eventAttendee.delete({
      where: {
        userId_eventId: { userId, eventId },
      },
    });
    this.logger.log(`User ${userId} removed from event ${eventId}`);
  }

  /**
   * Broadcasts an event update to all connected sockets in the event room.
   * @param eventId - The ID of the event.
   * @param update - The update data to broadcast.
   */
  async broadcastEventUpdate(eventId: string, update: any) {
    this.server.to(`event:${eventId}`).emit('eventUpdate', update);
    this.logger.log(`Broadcasted event update to event ${eventId}`);
  }

  /**
   * Broadcasts a ticket update to all connected sockets in the event room.
   * @param eventId - The ID of the event.
   * @param update - The update data to broadcast.
   */
  async broadcastTicketUpdate(eventId: string, update: any) {
    this.server.to(`event:${eventId}`).emit('ticketUpdate', update);
    this.logger.log(`Broadcasted ticket update to event ${eventId}`);
  }

  /**
   * Broadcasts a chat message to all connected sockets in the event room.
   * @param eventId - The ID of the event.
   * @param message - The chat message to broadcast.
   */
  async broadcastEventChat(eventId: string, message: any) {
    this.server.to(`event:${eventId}`).emit('chatMessage', message);
    this.logger.log(`Broadcasted chat message to event ${eventId}`);
  }

  /**
   * Checks if a user is currently online.
   * @param userId - The ID of the user.
   * @returns A boolean indicating if the user is online.
   */
  isUserOnline(userId: string): boolean {
    return this.userConnections.has(userId);
  }

  /**
   * Retrieves the number of active socket connections a user has.
   * @param userId - The ID of the user.
   * @returns The number of active connections.
   */
  getUserSocketCount(userId: string): number {
    return this.userConnections.get(userId)?.size || 0;
  }

  /**
   * Helper method to retrieve or create a Set of socket IDs for a user.
   * @param userId - The ID of the user.
   * @returns The Set of socket IDs.
   */
  private getUserSet(userId: string): Set<string> {
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    return this.userConnections.get(userId)!; // Non-null assertion
  }
}
