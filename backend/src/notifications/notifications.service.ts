// src/notifications/services/notifications.service.ts

import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { NotificationType } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { FCMService } from './services/fcm.service';
import { NotificationTemplateService } from './services/template.service';
import { LoggingService } from '@/logging/logging.service'; 
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private websocketGateway: WebsocketGateway,
    private mailService: MailService,
    private fcmService: FCMService,
    private templateService: NotificationTemplateService,
    private loggingService: LoggingService
  ) {}

  /**
   * Creates a new notification based on the provided data.
   * @param data - Data required to create a notification.
   * @returns The created notification.
   */
  async create(data: CreateNotificationDto) {
    try {
      // Get user's notification preferences
      const preferences = await this.prisma.notificationPreference.findUnique({
        where: { userId: data.userId }
      });

      // Check if user wants this type of notification
      if (preferences && !preferences.types.includes(data.type)) {
        return null; // User has opted out of this notification type
      }

      // Optionally, get notification template (if templates are used to override title/message)
      const template = this.templateService.getTemplate(data.type, data.metadata);

      // Create notification record
      const notification = await this.prisma.notification.create({
        data: {
          userId: data.userId,
          title: template ? template.title : data.title, // Use template if available
          message: template ? template.message : data.message, // Use template if available
          type: data.type,
          metadata: data.metadata
        }
      });

      // Send real-time notification
      this.websocketGateway.sendNotification(data.userId, notification);

      // Send email if enabled and user has email preferences enabled
      if (data.sendEmail && preferences?.email) {
        const user = await this.prisma.user.findUnique({
          where: { id: data.userId }
        });
        
        if (user?.email) {
          await this.mailService.sendNotificationEmail(
            user.email,
            notification.title,
            notification.message
          );
        }
      }

      // Send push notification if enabled and user has push preferences enabled
      if (data.sendPush && preferences?.push) {
        const tokens = await this.prisma.pushToken.findMany({
          where: { userId: data.userId }
        });

        if (tokens.length > 0) {
          await this.fcmService.sendMulticast(
            tokens.map(t => t.token),
            {
              title: notification.title,
              body: notification.message,
              data: data.metadata
            }
          );
        }
      }

      // Log notification
      this.loggingService.logAudit('notification_sent', data.userId, {
        notificationId: notification.id,
        type: data.type
      });

      return notification;
    } catch (error) {
      this.loggingService.logError(error);
      throw new InternalServerErrorException('Failed to create notification.');
    }
  }

  /**
   * Marks a specific notification as read for a user.
   * @param id - The ID of the notification.
   * @param userId - The ID of the user.
   * @returns The updated notification.
   */
  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id, userId },
      data: { read: true }
    });
  }

  /**
   * Marks all notifications as read for a user.
   * @param userId - The ID of the user.
   * @returns The result of the update operation.
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
  }

  /**
   * Retrieves notifications for a user based on query parameters.
   * @param userId - The ID of the user.
   * @param query - Query parameters for filtering and pagination.
   * @returns An array of notifications.
   */
  async getUserNotifications(userId: string, query: {
    skip?: number;
    take?: number;
    type?: NotificationType;
    read?: boolean;
  }) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        type: query.type,
        read: query.read
      },
      orderBy: { createdAt: 'desc' },
      skip: query.skip,
      take: query.take
    });
  }

  /**
   * Updates notification preferences for a user.
   * @param userId - The ID of the user.
   * @param preferences - The new notification preferences.
   * @returns The updated or created notification preferences.
   */
  async updatePreferences(userId: string, preferences: {
    email?: boolean;
    push?: boolean;
    types?: NotificationType[];
  }) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences
      }
    });
  }

  /**
   * Saves or updates a push token for a user.
   * @param userId - The ID of the user.
   * @param token - The push token.
   * @param device - (Optional) The device identifier.
   * @returns The upserted push token.
   */
  async savePushToken(userId: string, token: string, device?: string) {
    return this.prisma.pushToken.upsert({
      where: { token },
      update: { userId, device },
      create: { userId, token, device }
    });
  }

  /**
   * Removes a push token.
   * @param token - The push token to remove.
   */
  async removePushToken(token: string) {
    await this.prisma.pushToken.delete({
      where: { token }
    });
  }
}
