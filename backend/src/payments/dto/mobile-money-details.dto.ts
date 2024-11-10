// src/payments/dto/mobile-money-details.dto.ts

import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MobileMoneyDetailsDto {
  @ApiProperty({
    description: 'Mobile money provider (e.g., M-Pesa, Airtel Money)',
    example: 'M-Pesa',
  })
  @IsString()
  provider: string;

  @ApiProperty({
    description: 'User phone number associated with mobile money',
    example: '+1234567890',
  })
  @IsString()
  phone: string;
}
