import { api } from './api';

export interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalRevenue: number;
  ticketsSold: number;
  recentOrders: Array<{
    id: string;
    user: {
      name: string;
      email: string;
    };
    event: {
      title: string;
    };
    total: number;
    status: string;
  }>;
  userGrowth: Array<{
    date: string;
    value: number;
  }>;
  salesByCategory: Array<{
    category: string;
    total: number;
  }>;
  topEvents: Array<{
    id: string;
    title: string;
    ticketsSold: number;
    revenue: number;
    occupancy: number;
  }>;
}

class AnalyticsService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/api/analytics/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return mock data for development
      return {
        totalUsers: 2543,
        totalEvents: 45,
        totalRevenue: 125430,
        ticketsSold: 1234,
        recentOrders: [
          {
            id: 'ORD-001',
            user: { name: 'John Doe', email: 'john@example.com' },
            event: { title: 'Afro Nation Ghana 2024' },
            total: 500,
            status: 'completed'
          },
          {
            id: 'ORD-002',
            user: { name: 'Jane Smith', email: 'jane@example.com' },
            event: { title: 'Lagos Jazz Festival' },
            total: 300,
            status: 'pending'
          }
        ],
        userGrowth: [
          { date: '2024-01', value: 150 },
          { date: '2024-02', value: 280 },
          { date: '2024-03', value: 420 }
        ],
        salesByCategory: [
          { category: 'Music', total: 45000 },
          { category: 'Sports', total: 35000 },
          { category: 'Cultural', total: 25000 }
        ],
        topEvents: [
          {
            id: 'EVT-001',
            title: 'Afro Nation Ghana 2024',
            ticketsSold: 1200,
            revenue: 60000,
            occupancy: 80
          },
          {
            id: 'EVT-002',
            title: 'Lagos Jazz Festival',
            ticketsSold: 800,
            revenue: 40000,
            occupancy: 65
          }
        ]
      };
    }
  }

  async getEventAnalytics(eventId: string) {
    const response = await api.get(`/api/analytics/events/${eventId}`);
    return response.data;
  }

  async getRevenueAnalytics(period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
    const response = await api.get('/api/analytics/revenue', {
      params: { period }
    });
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();