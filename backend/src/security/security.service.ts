// src/security/security.service.ts

import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto'; // Correctly import randomBytes
import axios from 'axios';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name); // Initialize Logger

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Verifies the reCAPTCHA token.
   * @param token - The reCAPTCHA token to verify.
   * @returns A boolean indicating the success of the verification.
   */
  async verifyRecaptcha(token: string): Promise<boolean> {
    try {
      const secretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY');
      const response = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret: secretKey,
            response: token,
          },
        },
      );
      return response.data.success;
    } catch (error) {
      this.logger.error('reCAPTCHA verification error:', error.stack || error);
      return false;
    }
  }

  /**
   * Logs a security event.
   * @param data - The security event data.
   * @returns The created SecurityLog record.
   */
  async logSecurityEvent(data: {
    action: string;
    ip: string;
    userId?: string;
    details: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }) {
    try {
      return this.prisma.securityLog.create({
        data: {
          action: data.action,
          ip: data.ip,
          userId: data.userId,
          details: data.details,
          severity: data.severity,
          // 'timestamp' is automatically set by Prisma
        },
      });
    } catch (error) {
      this.logger.error('Failed to log security event:', error.stack || error);
      throw new InternalServerErrorException('Failed to log security event.');
    }
  }

  /**
   * Blocks an IP address for a specified duration.
   * @param ip - The IP address to block.
   * @param reason - The reason for blocking.
   * @param duration - Duration in minutes for which the IP is blocked.
   * @returns The created BlockedIP record.
   */
  async blockIP(ip: string, reason: string, duration: number) {
    try {
      const expiresAt = new Date(Date.now() + duration * 60 * 1000); // duration in minutes
      return this.prisma.blockedIP.create({
        data: {
          ip,
          reason,
          expiresAt,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to block IP ${ip}:`, error.stack || error);
      throw new InternalServerErrorException('Failed to block IP.');
    }
  }

  /**
   * Checks if an IP address is currently blocked.
   * @param ip - The IP address to check.
   * @returns A boolean indicating if the IP is blocked.
   */
  async isIPBlocked(ip: string): Promise<boolean> {
    try {
      const blockedIP = await this.prisma.blockedIP.findFirst({
        where: {
          ip,
          expiresAt: {
            gt: new Date(),
          },
        },
      });
      return !!blockedIP;
    } catch (error) {
      this.logger.error(`Failed to check if IP ${ip} is blocked:`, error.stack || error);
      throw new InternalServerErrorException('Failed to check IP block status.');
    }
  }

  /**
   * Retrieves security logs based on provided parameters.
   * @param params - The parameters for filtering and pagination.
   * @returns An array of SecurityLog records.
   */
  async getSecurityLogs(params: {
    skip?: number;
    take?: number;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH';
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      return this.prisma.securityLog.findMany({
        where: {
          severity: params.severity,
          timestamp: { // Changed from 'createdAt' to 'timestamp'
            gte: params.startDate,
            lte: params.endDate,
          },
        },
        skip: params.skip,
        take: params.take,
        orderBy: { timestamp: 'desc' }, // Changed from 'createdAt' to 'timestamp'
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error('Failed to retrieve security logs:', error.stack || error);
      throw new InternalServerErrorException('Failed to retrieve security logs.');
    }
  }

  /**
   * Retrieves currently blocked IPs.
   * @returns An array of BlockedIP records.
   */
  async getBlockedIPs() {
    try {
      return this.prisma.blockedIP.findMany({
        where: {
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error('Failed to retrieve blocked IPs:', error.stack || error);
      throw new InternalServerErrorException('Failed to retrieve blocked IPs.');
    }
  }

  /**
   * Validates a password based on defined security criteria.
   * @param password - The password string to validate.
   * @returns An object indicating validity and any associated errors.
   */
  validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Hashes a token using SHA-256.
   * @param token - The token string to hash.
   * @returns The hashed token as a hex string.
   */
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generates a secure random token.
   * @param length - The length of the token in bytes (default is 32).
   * @returns The generated token as a hex string.
   */
  generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex'); // Correct usage after importing randomBytes
  }
}
