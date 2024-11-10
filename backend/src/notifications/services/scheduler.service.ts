// src/notifications/services/scheduler.service.ts

import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationType } from '@prisma/client'; // Correctly imported enum
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  /**
   * Handles sending scheduled notifications at defined intervals.
   * This method runs every minute as defined by the Cron decorator.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledNotifications() {
    const now = new Date();
    const scheduledNotifications = await this.prisma.scheduledNotification.findMany({
      where: {
        scheduledFor: {
          lte: now
        },
        sent: false
      }
    });

    this.logger.log(`Found ${scheduledNotifications.length} scheduled notifications to send.`);

    for (const notification of scheduledNotifications) {
      try {
        // Validate and convert type to enum
        const typeEnum = this.convertToNotificationType(notification.type);
        if (!typeEnum) {
          throw new BadRequestException(`Invalid notification type: ${notification.type}`);
        }

        // Prepare DTO
        const createNotificationDto: CreateNotificationDto = {
          userId: notification.userId,
          type: typeEnum,
          metadata: (notification.metadata as Record<string, any>) ?? {},
          sendEmail: notification.sendEmail ?? true, // Default to true if undefined
          sendPush: notification.sendPush ?? true,   // Default to true if undefined
          title: notification.title,
          message: notification.message
        };

        // Create and send notification
        await this.notificationsService.create(createNotificationDto);

        // Update scheduled notification as sent
        await this.prisma.scheduledNotification.update({
          where: { id: notification.id },
          data: { sent: true }
        });

        this.logger.log(`Notification ${notification.id} sent and marked as sent.`);
      } catch (error: any) {
        this.logger.error(`Failed to send scheduled notification ${notification.id}:`, error.stack);
        // Optionally, implement retry logic or mark the notification for manual review
      }
    }
  }

  /**
   * Schedules a new notification to be sent at a future time.
   * @param data - Data required to schedule a notification.
   * @returns The created scheduled notification.
   */
  async scheduleNotification(data: {
    scheduledFor: Date;
    title: string;
    message: string;
    type: NotificationType;
    userId: string;
    metadata?: Prisma.InputJsonValue | null;
    sendEmail?: boolean;
    sendPush?: boolean;
  }) {
    try {
      // Validate type
      const typeEnum = this.convertToNotificationType(data.type);
      if (!typeEnum) {
        throw new BadRequestException(`Invalid notification type: ${data.type}`);
      }

      // Create scheduled notification
      const scheduledNotification = await this.prisma.scheduledNotification.create({
        data: {
          scheduledFor: data.scheduledFor,
          title: data.title,
          message: data.message,
          type: typeEnum,
          userId: data.userId,
          metadata: data.metadata ?? {}, // Default to empty object if null or undefined
          sendEmail: data.sendEmail ?? true, // Default to true if undefined
          sendPush: data.sendPush ?? true    // Default to true if undefined
        }
      });

      this.logger.log(`Scheduled notification created with ID: ${scheduledNotification.id}`);

      return scheduledNotification;
    } catch (error: any) {
      this.logger.error('Error scheduling notification:', error.stack);
      throw new InternalServerErrorException('Failed to schedule notification.');
    }
  }

  /**
   * Cancels a scheduled notification.
   * @param id - The ID of the scheduled notification to cancel.
   */
  async cancelScheduledNotification(id: string): Promise<void> {
    try {
      await this.prisma.scheduledNotification.delete({
        where: { id }
      });
      this.logger.log(`Scheduled notification ${id} has been canceled.`);
    } catch (error: any) {
      this.logger.error(`Error canceling scheduled notification ${id}:`, error.stack);
      throw new InternalServerErrorException('Failed to cancel scheduled notification.');
    }
  }

  /**
   * Helper method to convert a string to the NotificationType enum.
   * @param type - The notification type as a string.
   * @returns The corresponding NotificationType enum or null if invalid.
   */
  private convertToNotificationType(type: string): NotificationType | null {
    const upperType = type.toUpperCase();
    if (Object.values(NotificationType).includes(upperType as NotificationType)) {
      return upperType as NotificationType;
    }
    return null;
  }
}
