import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MonitoringService {
  constructor(
    @InjectMetric('http_request_duration_seconds')
    private readonly requestDuration: Histogram,
    @InjectMetric('http_requests_total')
    private readonly requestsTotal: Counter,
    @InjectMetric('active_users_total')
    private readonly activeUsers: Gauge,
    @InjectMetric('ticket_sales_total')
    private readonly ticketSales: Counter,
    @InjectMetric('event_capacity_usage')
    private readonly eventCapacity: Gauge
  ) {}

  // Method to record request duration
  recordRequestDuration(method: string, path: string, statusCode: number, duration: number) {
    this.requestDuration.observe(
      { method, path, status_code: statusCode.toString() },
      duration
    );
  }

  // Method to increment request count
  incrementRequestCount(method: string, path: string, statusCode: number) {
    this.requestsTotal.inc({ method, path, status_code: statusCode.toString() });
  }

  // Method to set active users
  setActiveUsers(count: number) {
    this.activeUsers.set(count);
  }

  // Method to record ticket sale
  recordTicketSale(eventId: string, ticketType: string, quantity: number) {
    this.ticketSales.inc({ event_id: eventId, ticket_type: ticketType }, quantity);
  }

  // Method to update event capacity usage
  updateEventCapacity(eventId: string, usedCapacity: number, totalCapacity: number) {
    const usage = (usedCapacity / totalCapacity) * 100;
    this.eventCapacity.set({ event_id: eventId }, usage);
  }
}
