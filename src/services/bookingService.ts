import { api } from './api';
import { BookingDetails } from '../types/event';

export const bookingService = {
  validateTickets: async (eventId: string, tickets: { [key: string]: number }) => {
    try {
      const response = await api.post(`/api/events/${eventId}/tickets/validate`, { tickets });
      return response.data;
    } catch (error) {
      console.error('Error validating tickets:', error);
      // For development, return mock response
      return { available: true };
    }
  },

  createBooking: async (bookingDetails: BookingDetails) => {
    try {
      const response = await api.post('/api/bookings', bookingDetails);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  getBooking: async (bookingId: string) => {
    try {
      const response = await api.get(`/api/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      // For development, return mock data
      return {
        id: bookingId,
        eventName: 'Mock Event',
        date: '2024-03-15',
        time: '19:00',
        location: 'Mock Location',
        status: 'upcoming',
        ticketType: 'VIP',
        price: 100,
        currency: 'GHS',
        ticketId: `TIX-${bookingId}`,
        qrCode: 'data:image/png;base64,mock-qr-code'
      };
    }
  },

  getUserBookings: async () => {
    try {
      const response = await api.get('/api/bookings/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      // For development, return mock data
      return [
        {
          id: '1',
          eventName: 'Afro Nation Ghana 2024',
          date: '2024-12-15',
          time: '18:00',
          location: 'Accra Sports Stadium',
          status: 'upcoming',
          ticketType: 'VIP',
          price: 150,
          currency: 'GHS',
          ticketId: 'TIX-123456',
          qrCode: 'data:image/png;base64,mock-qr-code-1'
        },
        {
          id: '2',
          eventName: 'Lagos Jazz Festival',
          date: '2024-11-20',
          time: '19:30',
          location: 'Eko Hotel & Suites',
          status: 'completed',
          ticketType: 'Regular',
          price: 25000,
          currency: 'NGN',
          ticketId: 'TIX-789012',
          qrCode: 'data:image/png;base64,mock-qr-code-2'
        }
      ];
    }
  }
};