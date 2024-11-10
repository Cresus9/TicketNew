// src/payments/payment-validation.service.ts

import { Injectable } from '@nestjs/common';
import { CardPaymentDetailsDto } from '../dto/card-payment-details.dto';
import { MobileMoneyDetailsDto } from '../dto/mobile-money-details.dto'; 

@Injectable()
export class PaymentValidationService {
  /**
   * Validates card payment details.
   * @param details - The card payment details to validate.
   * @returns An object indicating whether the validation passed and any error messages.
   */
  validateCardPaymentDetails(details: CardPaymentDetailsDto): { valid: boolean; error?: string } {
    // Example validation logic
    // if (details.amount <= 0) {
    //   return { valid: false, error: 'Amount must be greater than zero.' };
    // }

    // Add more validations as needed (e.g., regex for card number)
    const cardNumberRegex = /^\d{16}$/;
    if (!cardNumberRegex.test(details.cardNumber)) {
      return { valid: false, error: 'Invalid card number format.' };
    }

    // Validate expiry month
    const month = parseInt(details.expiryMonth, 10);
    if (isNaN(month) || month < 1 || month > 12) {
      return { valid: false, error: 'Invalid expiry month.' };
    }

    // Validate expiry year
    const year = parseInt(details.expiryYear, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < currentYear) {
      return { valid: false, error: 'Invalid expiry year.' };
    }

    // Validate CVV
    const cvvRegex = /^\d{3,4}$/;
    if (!cvvRegex.test(details.cvv)) {
      return { valid: false, error: 'Invalid CVV format.' };
    }

    return { valid: true };
  }

  /**
   * Validates mobile money payment details.
   * @param details - The mobile money payment details to validate.
   * @returns An object indicating whether the validation passed and any error messages.
   */
  validateMobileMoneyDetails(details: MobileMoneyDetailsDto): { valid: boolean; error?: string } {
    // Example validation logic
    // if (details.amount <= 0) {
    //   return { valid: false, error: 'Amount must be greater than zero.' };
    // }

    // Validate phone number (basic example)
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(details.phone)) {
      return { valid: false, error: 'Invalid phone number format.' };
    }

    // Validate provider (ensure it's one of the supported providers)
    const supportedProviders = ['M-Pesa', 'Airtel Money', 'Vodafone Cash'];
    if (!supportedProviders.includes(details.provider)) {
      return { valid: false, error: 'Unsupported mobile money provider.' };
    }

    return { valid: true };
  }
}
