import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app) {
    app.enableShutdownHooks();
    const shutdown = async () => {
      await this.$disconnect();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'development') {
      const models = Reflect.ownKeys(this).filter(key => key[0] !== '_');
      
      return Promise.all(
        models.map(modelKey => (this as any)[modelKey].deleteMany())
      );
    }
  }
}