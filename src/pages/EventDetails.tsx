import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Share2, Heart } from 'lucide-react';
import BookingForm from '../components/booking/BookingForm';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock event data - in a real app, this would come from an API
  const event = {
    id: id || '1',
    title: 'Afro Nation Ghana 2024',
    description: 'Experience the biggest Afrobeats festival in Africa! Join us for an unforgettable weekend of music, culture, and celebration featuring top artists from across the continent.',
    date: 'Dec 15, 2024',
    time: '18:00',
    location: 'Accra Sports Stadium',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
    ticketTypes: [
      {
        id: 'regular',
        name: 'Regular Ticket',
        description: 'General admission with access to all main stages',
        price: 150,
        available: 1000,
        maxPerOrder: 4
      },
      {
        id: 'vip',
        name: 'VIP Ticket',
        description: 'Premium viewing areas, exclusive lounges, and complimentary drinks',
        price: 300,
        available: 200,
        maxPerOrder: 2
      },
      {
        id: 'vvip',
        name: 'VVIP Ticket',
        description: 'Ultimate experience with backstage access, meet & greet, and premium amenities',
        price: 500,
        available: 50,
        maxPerOrder: 2
      }
    ],
    currency: 'GHS'
  };

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Event not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Event Header */}
      <div className="relative h-[400px] rounded-xl overflow-hidden mb-8">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{event.title}</h1>
              <div className="flex items-center gap-6 text-white/90">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {event.date}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {event.time}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {event.location}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 bg-white/10 rounded-full hover:bg-white/20">
                <Share2 className="h-6 w-6 text-white" />
              </button>
              <button className="p-2 bg-white/10 rounded-full hover:bg-white/20">
                <Heart className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
            <p className="text-gray-600 whitespace-pre-line">{event.description}</p>
          </div>

          {/* Additional event details, lineup, etc. can be added here */}
        </div>

        {/* Booking Form */}
        <div className="lg:sticky lg:top-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <BookingForm
              eventId={event.id}
              ticketTypes={event.ticketTypes}
              currency={event.currency}
            />
          </div>
        </div>
      </div>
    </div>
  );
}