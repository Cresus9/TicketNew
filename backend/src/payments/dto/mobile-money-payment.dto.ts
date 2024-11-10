// src/payments/dto/mobile-money-payment.dto.ts

import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MobileMoneyPaymentDto {
  @ApiProperty({
    description: 'Amount to be charged',
    example: 50,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Currency code (e.g., USD, EUR)',
    example: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'Mobile money provider (e.g., M-Pesa, Airtel Money)',
    example: 'M-Pesa',
  })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({
    description: 'User phone number associated with mobile money',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
