// src/notifications/dto/create-scheduled-notification.dto.ts

import { IsString, IsOptional, IsBoolean, IsDate, IsEnum, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { Prisma } from '@prisma/client';

export class CreateScheduledNotificationDto {
  @ApiProperty({ description: 'User ID associated with the notification' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Type of the notification', enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Metadata for the notification', required: false, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  metadata?: Prisma.InputJsonValue | null;

  @ApiProperty({ description: 'Whether to send an email', default: false })
  @IsBoolean()
  sendEmail: boolean;

  @ApiProperty({ description: 'Whether to send a push notification', default: false })
  @IsBoolean()
  sendPush: boolean;

  @ApiProperty({ description: 'Title of the notification' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Message of the notification' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Scheduled time for the notification' })
  @IsDate()
  @Type(() => Date)
  scheduledFor: Date;
}

export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  sendPush?: boolean;
}
