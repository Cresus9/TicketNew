import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CreditCard, 
  Users,
  ChevronRight,
  Bell,
  Star,
  Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { bookingService } from '../services/bookingService';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

interface DashboardStats {
  upcomingEvents: number;
  totalTickets: number;
  savedEvents: number;
  totalSpent: number;
}

interface Activity {
  id: string;
  type: 'ticket_purchase' | 'event_reminder' | 'event_saved';
  event: string;
  date: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's bookings
        const bookings = await bookingService.getUserBookings();
        
        // Calculate stats
        const upcomingBookings = bookings.filter(booking => 
          new Date(booking.date) > new Date()
        );
        
        const totalSpent = bookings.reduce((sum, booking) => sum + booking.price, 0);
        
        setStats({
          upcomingEvents: upcomingBookings.length,
          totalTickets: bookings.length,
          savedEvents: 0, // This will be implemented when we add favorites feature
          totalSpent
        });

        // Get upcoming events
        const events = await eventService.getEvents({
          status: 'PUBLISHED',
          featured: true
        });
        setUpcomingEvents(events.slice(0, 3));

        // Generate recent activities from bookings
        const activities = bookings
          .slice(0, 5)
          .map(booking => ({
            id: booking.id,
            type: 'ticket_purchase' as const,
            event: booking.eventName,
            date: new Date(booking.createdAt).toLocaleDateString()
          }));
        setRecentActivities(activities);

        setError(null);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader className="h-6 w-6 animate-spin text-indigo-600" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your events
            </p>
          </div>
          <Link
            to="/events"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            Browse Events
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Ticket className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTickets}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Saved Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.savedEvents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalSpent, 'GHS')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <Link to="/profile/bookings" className="text-indigo-600 hover:text-indigo-700">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {event.time}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/events/${event.id}`}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                >
                  View Details
                </Link>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No upcoming events</p>
                <Link
                  to="/events"
                  className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
                >
                  Browse events
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Ticket className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Purchased tickets for
                  </p>
                  <p className="text-sm text-gray-600">{activity.event}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <p className="text-center text-gray-600">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/profile/bookings"
          className="bg-white rounded-xl shadow-sm p-6 hover:bg-gray-50"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Ticket className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">My Tickets</h3>
              <p className="text-sm text-gray-600">View and manage your tickets</p>
            </div>
          </div>
        </Link>

        <Link
          to="/profile/notifications"
          className="bg-white rounded-xl shadow-sm p-6 hover:bg-gray-50"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Bell className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-600">Manage your preferences</p>
            </div>
          </div>
        </Link>

        <Link
          to="/profile/payments"
          className="bg-white rounded-xl shadow-sm p-6 hover:bg-gray-50"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Payment Methods</h3>
              <p className="text-sm text-gray-600">Manage your payment options</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}