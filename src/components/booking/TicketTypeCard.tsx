import React from 'react';
import { TicketType } from '../../.././backend/src/types/event'
import TicketCounter from '../tickets/TicketCounter';
import TicketAvailabilityIndicator from '../tickets/TicketAvailabilityIndicator';

interface TicketTypeCardProps {
  eventId: string;
  ticket: TicketType;
  quantity: number;
  currency: string;
  onQuantityChange: (quantity: number) => void;
}

export default function TicketTypeCard({
  eventId,
  ticket,
  quantity,
  currency,
  onQuantityChange
}: TicketTypeCardProps) {
  const isAvailable = ticket.status === 'available' || ticket.status === 'limited';
  const isSoldOut = ticket.status === 'soldout';
  const isUpcoming = ticket.status === 'upcoming';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{ticket.name}</h3>
          <p className="text-gray-600">{ticket.description}</p>
          
          {/* Benefits */}
          {ticket.benefits.length > 0 && (
            <ul className="mt-2 space-y-1">
              {ticket.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-2" />
                  {benefit}
                </li>
              ))}
            </ul>
          )}

          <p className="text-lg font-bold text-gray-900 mt-2">
            {currency} {ticket.price}
          </p>
        </div>

        {isAvailable ? (
          <TicketCounter
            available={ticket.available}
            quantity={quantity}
            maxPerOrder={ticket.maxPerOrder}
            onChange={onQuantityChange}
          />
        ) : (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isSoldOut ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isSoldOut ? 'Sold Out' : 'Coming Soon'}
          </span>
        )}
      </div>

      {isAvailable && (
        <TicketAvailabilityIndicator
          eventId={eventId}
          ticketType={ticket.id}
          initialAvailable={ticket.available}
          totalCapacity={ticket.available + ticket.maxPerOrder}
        />
      )}

      {/* Sales Period */}
      <div className="mt-4 text-sm text-gray-500">
        {isUpcoming ? (
          <p>Sales start: {new Date(ticket.salesStart).toLocaleDateString()}</p>
        ) : (
          <p>Sales end: {new Date(ticket.salesEnd).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
}