import React, { createContext, useContext, useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import { Event } from '../types/event';
import toast from 'react-hot-toast';

interface EventContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  getEvent: (id: string) => Event | undefined;
  featuredEvents: Event[];
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allEvents, featured] = await Promise.all([
        eventService.getEvents({ status: 'PUBLISHED' }),
        eventService.getEvents({ status: 'PUBLISHED', featured: true })
      ]);
      
      setEvents(allEvents);
      setFeaturedEvents(featured);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch events';
      setError(message);
      toast.error(message);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEvent = (id: string) => {
    return events.find(event => event.id === id);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <EventContext.Provider
      value={{
        events,
        loading,
        error,
        fetchEvents,
        getEvent,
        featuredEvents
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}