import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketSelection, TicketType } from '../types/event';
import { api } from '../../.././src/services/api';
import toast from 'react-hot-toast';

interface UseBookingReturn {
  selectedTickets: TicketSelection;
  loading: boolean;
  error: string | null;
  handleQuantityChange: (ticketId: string, quantity: number) => void;
  calculateTotals: () => {
    subtotal: number;
    processingFee: number;
    total: number;
  };
  proceedToCheckout: () => Promise<void>;
}

export function useBooking(
  eventId: string,
  ticketTypes: TicketType[],
  currency: string
): UseBookingReturn {
  const navigate = useNavigate();
  const [selectedTickets, setSelectedTickets] = useState<TicketSelection>(
    ticketTypes.reduce((acc, ticket) => ({ ...acc, [ticket.id]: 0 }), {})
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuantityChange = (ticketId: string, quantity: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: quantity
    }));
    setError(null);
  };

  const calculateTotals = () => {
    const subtotal = ticketTypes.reduce((total, ticket) => {
      return total + (ticket.price * selectedTickets[ticket.id]);
    }, 0);
    const processingFee = subtotal * 0.02;
    return {
      subtotal,
      processingFee,
      total: subtotal + processingFee
    };
  };

  const proceedToCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate ticket availability
      const response = await api.post('/tickets/validate', {
        eventId,
        tickets: selectedTickets
      });

      if (!response.data.available) {
        throw new Error('Some tickets are no longer available');
      }

      const { subtotal, processingFee, total } = calculateTotals();

      navigate('/checkout', {
        state: {
          eventId,
          tickets: selectedTickets,
          subtotal,
          processingFee,
          total,
          currency
        }
      });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to proceed to checkout';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedTickets,
    loading,
    error,
    handleQuantityChange,
    calculateTotals,
    proceedToCheckout
  };
}