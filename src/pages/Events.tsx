import React, { useState } from 'react';
import { Search, Calendar, MapPin, Users, Edit2, Trash2 } from 'lucide-react';
import EventCard from '../components/EventCard';

export default function Events() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock events data - in a real app, this would come from an API
  const events = [
    {
      id: '1',
      title: 'Afro Nation Ghana 2024',
      date: 'Dec 15, 2024',
      time: '18:00',
      location: 'Accra Sports Stadium',
      imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
      price: 150,
      currency: 'GHS'
    },
    {
      id: '2',
      title: 'Lagos Jazz Festival',
      date: 'Nov 20, 2024',
      time: '19:30',
      location: 'Eko Hotel & Suites',
      imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae',
      price: 200,
      currency: 'GHS'
    },
    {
      id: '3',
      title: 'African Athletics Championship',
      date: 'Sep 10, 2024',
      time: '09:00',
      location: 'National Stadium, Nairobi',
      imageUrl: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff',
      price: 100,
      currency: 'GHS'
    }
  ];

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
}