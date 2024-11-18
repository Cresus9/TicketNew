import React, { useState, useEffect } from 'react';
import { Download, Calendar, MapPin, Clock, AlertCircle } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { generatePDF } from '../../utils/ticketService';
import toast from 'react-hot-toast';
import LoadingButton from '../common/LoadingButton';
import TicketDisplay from '../booking/TicketDisplay';
import { useAuth } from '../../context/AuthContext';

interface Booking {
  id: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  ticketType: string;
  price: number;
  currency: string;
  ticketId: string;
  qrCode: string;
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingTicket, setDownloadingTicket] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getUserBookings();
      setBookings(data);
      setError(null);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load bookings';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = async (booking: Booking) => {
    try {
      setDownloadingTicket(booking.id);

      // Create a temporary container for the ticket
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      // Render the ticket
      const ticketElement = document.createElement('div');
      ticketElement.innerHTML = `
        <div style="padding: 40px; background: white;">
          <div style="max-width: 800px; margin: 0 auto;">
            ${TicketDisplay({
              bookingId: booking.id,
              eventTitle: booking.eventName,
              eventDate: booking.date,
              eventTime: booking.time,
              eventLocation: booking.location,
              ticketType: booking.ticketType,
              ticketHolder: user?.name || '',
              qrData: booking.qrCode
            }).props.children.innerHTML}
          </div>
        </div>
      `;
      container.appendChild(ticketElement);

      // Generate PDF
      const pdf = await generatePDF(ticketElement);
      
      // Clean up
      document.body.removeChild(container);

      // Download PDF
      const url = URL.createObjectURL(pdf);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${booking.ticketId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Ticket downloaded successfully');
    } catch (err) {
      console.error('Error downloading ticket:', err);
      toast.error('Failed to download ticket');
    } finally {
      setDownloadingTicket(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h2>
        <p className="text-gray-600 mb-4">You haven't made any bookings yet.</p>
        <a
          href="/events"
          className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Browse Events
        </a>
      </div>
    );
  }

  // Sort bookings by date (most recent first)
  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>
      
      <div className="space-y-6">
        {sortedBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {booking.eventName}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {booking.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {booking.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {booking.location}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.status === 'upcoming'
                      ? 'bg-green-100 text-green-700'
                      : booking.status === 'completed'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Ticket Type</p>
                  <p className="font-medium text-gray-900">{booking.ticketType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Ticket ID</p>
                  <p className="font-medium text-gray-900">{booking.ticketId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-medium text-gray-900">
                    {booking.currency} {booking.price}
                  </p>
                </div>
                <LoadingButton
                  onClick={() => handleDownloadTicket(booking)}
                  loading={downloadingTicket === booking.id}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Download Ticket
                </LoadingButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}