import { api } from './api';
import { Event } from '../types/event';

interface EventFilters {
  status?: string;
  featured?: boolean;
  category?: string;
}

class EventService {
  async getEvents(filters: EventFilters = {}): Promise<Event[]> {
    try {
      const response = await api.get('/api/events', { 
        params: {
          ...filters,
          status: filters.status || 'PUBLISHED'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Response error:', error);
      throw error;
    }
  }

  async getEventById(id: string): Promise<Event> {
    const response = await api.get(`/api/events/${id}`);
    return response.data;
  }

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    const response = await api.post('/api/events', eventData);
    return response.data;
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    const response = await api.put(`/api/events/${id}`, eventData);
    return response.data;
  }

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/api/events/${id}`);
  }

  async toggleFeatured(id: string, featured: boolean): Promise<Event> {
    const response = await api.patch(`/api/events/${id}/featured`, { featured });
    return response.data;
  }
}

export const eventService = new EventService();