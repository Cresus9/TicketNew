// src/payments/dto/process-payment.dto.ts

import {
  IsString,
  IsNumber,
  IsUUID,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from './payment.dto';
import { CardPaymentDetailsDto } from './card-payment-details.dto';
import { MobileMoneyDetailsDto } from './mobile-money-details.dto';

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'Unique identifier for the order',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  orderId: string;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
  })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({
    description: 'Amount to be charged',
    example: 100,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Currency code (e.g., USD, EUR)',
    example: 'USD',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Payment details based on the payment method',
    oneOf: [
      { $ref: '#/components/schemas/CardPaymentDetailsDto' },
      { $ref: '#/components/schemas/MobileMoneyDetailsDto' },
    ],
  })
  @ValidateNested()
  @Type(() => {
    // This function dynamically determines the DTO class based on the 'method' field
    return (object: any) => {
      switch (object.method) {
        case PaymentMethod.CARD:
          return CardPaymentDetailsDto;
        case PaymentMethod.MOBILE_MONEY:
          return MobileMoneyDetailsDto;
        default:
          return Object;
      }
    };
  })
  details: CardPaymentDetailsDto | MobileMoneyDetailsDto;
}
