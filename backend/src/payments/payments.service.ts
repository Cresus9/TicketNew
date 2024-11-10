// src/payments/payments.service.ts

import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PaymentMethod } from './dto/payment.dto';
import { CardPaymentDetailsDto } from './dto/card-payment-details.dto';
import { MobileMoneyDetailsDto } from './dto/mobile-money-details.dto';
import { PaymentProcessorService } from './services/payment-processor.service';
import { PaymentValidationService } from './services/payment-validation.service';
import { PaymentNotificationService } from './services/payment-notification.service';
import { PaymentLoggingService } from './services/payment-logging.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly paymentProcessor: PaymentProcessorService,
    private readonly paymentValidation: PaymentValidationService,
    private readonly paymentNotification: PaymentNotificationService,
    private readonly paymentLogging: PaymentLoggingService,
  ) {}

  /**
   * Processes a payment based on the provided payment details.
   * @param userId - The ID of the user initiating the payment.
   * @param data - The payment data containing the method and details.
   * @returns The result of the payment processing.
   */
  async processPayment(userId: string, data: ProcessPaymentDto): Promise<any> {
    // Validate amount separately
    if (data.amount <= 0) {
      this.logger.warn(`Payment amount must be greater than zero for orderId: ${data.orderId}`);
      throw new BadRequestException('Amount must be greater than zero.');
    }

    let paymentResult: any;

    switch (data.method) {
      case PaymentMethod.CARD:
        const cardDetails = data.details as CardPaymentDetailsDto;

        // Validate card payment details
        const cardValidation = this.paymentValidation.validateCardPaymentDetails(cardDetails);
        if (!cardValidation.valid) {
          this.logger.warn(`Card payment validation failed: ${cardValidation.error}`);
          throw new BadRequestException(cardValidation.error);
        }

        // Process card payment
        paymentResult = await this.paymentProcessor.processCardPayment(cardDetails);
        this.logger.log(`Card payment processed for orderId: ${data.orderId} by userId: ${userId}`);

        // Optional: Log the payment
        // this.paymentLogging.logPayment(userId, data.orderId, PaymentMethod.CARD, paymentResult);

        // Optional: Notify user
        // this.paymentNotification.notifyUser(userId, paymentResult);

        break;

      case PaymentMethod.MOBILE_MONEY:
        const mobileMoneyDetails = data.details as MobileMoneyDetailsDto;

        // Validate mobile money payment details
        const mobileMoneyValidation = this.paymentValidation.validateMobileMoneyDetails(mobileMoneyDetails);
        if (!mobileMoneyValidation.valid) {
          this.logger.warn(`Mobile money payment validation failed: ${mobileMoneyValidation.error}`);
          throw new BadRequestException(mobileMoneyValidation.error);
        }

        // Process mobile money payment
        paymentResult = await this.paymentProcessor.processMobileMoneyPayment(mobileMoneyDetails);
        this.logger.log(`Mobile money payment processed for orderId: ${data.orderId} by userId: ${userId}`);

        // Optional: Log the payment
        // this.paymentLogging.logPayment(userId, data.orderId, PaymentMethod.MOBILE_MONEY, paymentResult);

        // Optional: Notify user
        // this.paymentNotification.notifyUser(userId, paymentResult);

        break;

      default:
        this.logger.error(`Unsupported payment method: ${data.method}`);
        throw new BadRequestException('Unsupported payment method');
    }

    return paymentResult;
  }
}
