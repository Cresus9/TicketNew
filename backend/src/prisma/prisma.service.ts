// src/prisma/prisma.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    // this.enableShutdownHooks();
    this.logger.log('Prisma Client connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma Client disconnected');
  }

  // private enableShutdownHooks() {
  //   this.$on('beforeExit', async () => {
  //     // Perform any necessary cleanup before exiting
  //     this.logger.log('Prisma Client is shutting down');
  //   });
  // }
  // async enableShutdownHooksApp(app: INestApplication) {
  //   this.$on('beforeExit', async () => {
  //     await app.close();
  //     this.logger.log('Prisma Client is shutting down and NestJS application is closed.');
  //   });
  // }
}
