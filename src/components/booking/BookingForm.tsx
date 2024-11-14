import React, { useState } from 'react';
import { Ticket, AlertCircle } from 'lucide-react';
import { TicketType } from '../../.././backend/src/types/event'
import { useBooking } from '../../.././backend/src/hooks/useBooking';
import TicketTypeCard from './TicketTypeCard';
import BookingSummary from './BookingSummary';
import TicketReviewModal from './TicketReviewModal';
import LoadingButton from '../common/LoadingButton';

interface BookingFormProps {
  eventId: string;
  ticketTypes: TicketType[];
  currency: string;
}

export default function BookingForm({ eventId, ticketTypes, currency }: BookingFormProps) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const {
    selectedTickets,
    loading,
    error,
    handleQuantityChange,
    calculateTotals,
    proceedToCheckout
  } = useBooking(eventId, ticketTypes, currency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0);
    if (totalTickets === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    setIsReviewModalOpen(true);
  };

  const availableTickets = ticketTypes.filter(
    ticket => ticket.status === 'available' || ticket.status === 'limited'
  );

  const hasAvailableTickets = availableTickets.length > 0;

  if (!hasAvailableTickets) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Available</h3>
        <p className="text-gray-600">
          Tickets are currently not available for this event.
          Check back later or contact the organizer for more information.
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {ticketTypes.map((ticket) => (
            <TicketTypeCard
              key={ticket.id}
              eventId={eventId}
              ticket={ticket}
              quantity={selectedTickets[ticket.id]}
              currency={currency}
              onQuantityChange={(quantity) => handleQuantityChange(ticket.id, quantity)}
            />
          ))}
        </div>

        {Object.values(selectedTickets).some(qty => qty > 0) && (
          <BookingSummary
            selectedTickets={selectedTickets}
            ticketTypes={ticketTypes}
            currency={currency}
          />
        )}

        <LoadingButton
          type="submit"
          loading={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Ticket className="h-5 w-5" />
          Review Order
        </LoadingButton>
      </form>

      <TicketReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onConfirm={proceedToCheckout}
        selectedTickets={selectedTickets}
        ticketTypes={ticketTypes}
        currency={currency}
      />
    </>
  );
}