import React from 'react';
import { TicketType } from '../../.././backend/src/types/event'

interface BookingSummaryProps {
  selectedTickets: { [key: string]: number };
  ticketTypes: TicketType[];
  currency: string;
}

export default function BookingSummary({
  selectedTickets,
  ticketTypes,
  currency
}: BookingSummaryProps) {
  const calculateSubtotal = () => {
    return ticketTypes.reduce((total, ticket) => {
      return total + (ticket.price * selectedTickets[ticket.id]);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const processingFee = subtotal * 0.02;
  const total = subtotal + processingFee;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      
      <div className="space-y-4">
        {ticketTypes.map((ticket) => (
          selectedTickets[ticket.id] > 0 && (
            <div key={ticket.id} className="flex justify-between text-gray-600">
              <span>{ticket.name} × {selectedTickets[ticket.id]}</span>
              <span>{currency} {ticket.price * selectedTickets[ticket.id]}</span>
            </div>
          )
        ))}

        <div className="pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{currency} {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Processing Fee (2%)</span>
            <span>{currency} {processingFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>{currency} {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}