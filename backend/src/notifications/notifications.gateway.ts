// src/notifications/notifications.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/guards/ws-auth.guard';
import { Notification } from '@prisma/client';

@WebSocketGateway({
  
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})

@UseGuards(WsAuthGuard)
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Handles new client connections.
   * Authenticates the client using JWT and assigns the socket to the user's room.
   * @param client - The connected socket client.
   */
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }

      // Using Non-Null Assertion Operator to assure TypeScript that the Set exists
      this.userSockets.get(userId)!.add(client.id);

      client.join(`user:${userId}`);
    } catch (error) {
      client.disconnect();
    }
  }

  /**
   * Handles client disconnections.
   * Removes the socket from the user's set of sockets and deletes the user from the map if no sockets remain.
   * @param client - The disconnected socket client.
   */
  handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  /**
   * Sends a notification to a specific user.
   * @param userId - The ID of the user to send the notification to.
   * @param notification - The notification object to send.
   */
  sendNotification(userId: string, notification: Notification) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  /**
   * Handles the 'markAsRead' event from the client.
   * Syncs the read status of a notification across all of the user's connected devices.
   * @param client - The socket client that sent the event.
   * @param notificationId - The ID of the notification to mark as read.
   */
  @SubscribeMessage('markAsRead')
  handleMarkAsRead(client: Socket, notificationId: string) {
    // Sync read status across devices
    const rooms = Array.from(client.rooms);
    const userRoom = rooms.find(room => room.startsWith('user:'));
    if (userRoom) {
      this.server.to(userRoom).emit('notificationRead', notificationId);
    }
  }

  /**
   * Checks if a user is currently online.
   * @param userId - The ID of the user.
   * @returns True if the user is online, false otherwise.
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Gets the number of active socket connections a user has.
   * @param userId - The ID of the user.
   * @returns The count of active sockets.
   */
  getUserSocketCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }
}
