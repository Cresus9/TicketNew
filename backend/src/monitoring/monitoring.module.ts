import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { MetricsController } from './metrics.controller';
import {
  PrometheusModule,
  makeCounterProvider,
  makeGaugeProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrometheusModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        path: '/metrics',
        defaultMetrics: {
          enabled: true,
        },
        defaultLabels: {
          app: 'afritix',
          env: config.get('NODE_ENV'),
        },
      }),
    }),
  ],
  controllers: [MetricsController],
  providers: [
    MonitoringService,
    // Register the missing histogram provider
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'path', 'status_code'],
    }),
    // Existing metric providers
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status_code'],
    }),
    makeGaugeProvider({
      name: 'active_users_total',
      help: 'Total number of active users',
    }),
    makeCounterProvider({
      name: 'ticket_sales_total',
      help: 'Total number of ticket sales',
      labelNames: ['event_id', 'ticket_type'],
    }),
    makeGaugeProvider({
      name: 'event_capacity_usage',
      help: 'Event capacity usage percentage',
      labelNames: ['event_id'],
    }),
  ],
  exports: [MonitoringService],
})
export class MonitoringModule {}
