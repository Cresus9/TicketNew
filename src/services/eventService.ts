import { api } from './api';
import { Event } from '../../backend/src/types/event'

export const eventService = {
  getAll: async (): Promise<Event[]> => {
    const response = await api.get('/api/events');
    return response.data;
  },

  getById: async (id: string): Promise<Event> => {
    const response = await api.get(`/api/events/${id}`);
    return response.data;
  },

  getFeatured: async (): Promise<Event[]> => {
    const response = await api.get('/api/events/featured');
    return response.data;
  },

  search: async (params: {
    query?: string;
    category?: string;
    location?: string;
    date?: string;
    page?: number;
    limit?: number;
  }): Promise<{ events: Event[]; total: number; page: number; totalPages: number }> => {
    const response = await api.get('/api/events/search', { params });
    return response.data;
  }
};