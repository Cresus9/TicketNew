// src/events/dto/update-event.dto.ts

import { IsString, IsOptional, IsBoolean, IsEnum, ValidateNested, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from '@prisma/client'; // Adjust import based on your setup

export class UpdateTicketTypeDto {
  @IsOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  maxPerOrder?: number;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Add other event-specific fields as needed

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTicketTypeDto)
  ticketTypes?: UpdateTicketTypeDto[];
}
