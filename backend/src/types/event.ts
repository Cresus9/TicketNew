export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  ticketTypes: TicketType[];
  currency: string;
  organizer: {
    id: string;
    name: string;
    logo?: string;
  };
  categories: string[];
  status: 'upcoming' | 'ongoing' | 'past' | 'cancelled';
  venue: {
    name: string;
    address: string;
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  features: string[];
  ageRestriction?: string;
  termsAndConditions: string;
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  available: number;
  maxPerOrder: number;
  benefits: string[];
  salesStart: string;
  salesEnd: string;
  status: 'available' | 'limited' | 'soldout' | 'upcoming';
}

export interface TicketSelection {
  [key: string]: number;
}

export interface BookingDetails {
  eventId: string;
  tickets: TicketSelection;
  subtotal: number;
  processingFee: number;
  total: number;
  currency: string;
}