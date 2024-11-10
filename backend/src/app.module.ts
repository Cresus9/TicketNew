import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import redisStore from 'cache-manager-redis-yet';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { OrdersModule } from './orders/orders.module';
import { SecurityModule } from './security/security.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { LoggingModule } from './logging/logging.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { APP_GUARD } from '@nestjs/core';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { redisStore as redisStoreFn } from 'cache-manager-redis-yet';




@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      useFactory: async () => ({
        store: await redisStoreFn({
          socket: {
            host: 'localhost',
            port: 6379,
          },
          ttl: 300, // 5 minutes default TTL
          
        }),
      }),
      isGlobal: true,
    }),
    
    ThrottlerModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    EventsModule,
    OrdersModule,
    SecurityModule,
    NotificationsModule,
    SearchModule,
    MonitoringModule,
    LoggingModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Ensure ThrottlerGuard is applied globally
    },
  ],
})
export class AppModule {}