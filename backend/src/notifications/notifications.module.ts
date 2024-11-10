import { Module,forwardRef } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationTemplateService } from './services/template.service';
import { NotificationPreferenceService } from './services/preference.service';
import { NotificationSchedulerService } from './services/scheduler.service';
import { FCMService } from './services/fcm.service';
import { MailModule } from '../mail/mail.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggingModule } from '@/logging/logging.module';
import { WebsocketGateway } from '@/websocket/websocket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { MonitoringModule } from '@/monitoring/monitoring.module';



@Module({
  imports: [
    PrismaModule,
    MailModule,
    ConfigModule,
    LoggingModule,
    forwardRef(() => MonitoringModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60s' }, // Adjust as needed
      }),
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    WebsocketGateway,
    NotificationTemplateService,
    NotificationPreferenceService,
    NotificationSchedulerService,
    FCMService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
