import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Categories from './pages/Categories';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import BookingConfirmation from './pages/BookingConfirmation';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import EventManagement from './pages/admin/EventManagement';
import UserManagement from './pages/admin/UserManagement';
import OrderManagement from './pages/admin/OrderManagement';
import Analytics from './pages/admin/Analytics';
import ContentManagement from './pages/admin/ContentManagement';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes */}
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/booking/confirmation/:bookingId" element={
              <ProtectedRoute>
                <BookingConfirmation />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile/*" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminLayout>
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="events/*" element={<EventManagement />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="orders" element={<OrderManagement />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="content" element={<ContentManagement />} />
                  </Routes>
                </AdminLayout>
              </AdminRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;