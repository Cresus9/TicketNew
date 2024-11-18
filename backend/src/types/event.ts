export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  price: number;
  currency: string;
  capacity: number;
  ticketsSold: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  categories: string[];
  featured?: boolean;
  ticketTypes: TicketType[];
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  available: number;
  maxPerOrder: number;
  status: 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT' | 'UPCOMING';
  benefits?: string[];
}

export interface BookingDetails {
  eventId: string;
  tickets: {
    [ticketTypeId: string]: number;
  };
  total: number;
  currency: string;
  paymentMethod: string;
}