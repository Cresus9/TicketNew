// src/payments/dto/card-payment-details.dto.ts

import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CardPaymentDetailsDto {
  @ApiProperty({
    description: 'Card number',
    example: '4242424242424242',
  })
  @IsString()
  @Length(16, 16, { message: 'Card number must be 16 digits' })
  cardNumber: string;

  @ApiProperty({
    description: 'Expiry month (MM)',
    example: '12',
  })
  @IsString()
  @Length(2, 2, { message: 'Expiry month must be 2 digits' })
  expiryMonth: string;

  @ApiProperty({
    description: 'Expiry year (YYYY)',
    example: '2025',
  })
  @IsString()
  @Length(4, 4, { message: 'Expiry year must be 4 digits' })
  expiryYear: string;

  @ApiProperty({
    description: 'CVV code',
    example: '123',
  })
  @IsString()
  @Length(3, 4, { message: 'CVV must be 3 or 4 digits' })
  cvv: string;
}
