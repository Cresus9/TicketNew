import React, { useState } from 'react';
import { Calendar, MapPin, DollarSign, Image, Tag, Clock, Info, Plus, Minus } from 'lucide-react';
import { eventService } from '../../../services/eventService';
import toast from 'react-hot-toast';

interface EventFormProps {
  event?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EventForm({ event, onSuccess, onCancel }: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date?.split('T')[0] || new Date().toISOString().split('T')[0],
    time: event?.time || '18:00',
    location: event?.location || '',
    imageUrl: event?.imageUrl || '',
    price: event?.price || 0,
    currency: event?.currency || 'GHS',
    capacity: event?.capacity || 0,
    categories: event?.categories || [],
    ticketTypes: event?.ticketTypes || [
      {
        name: 'Regular',
        description: 'Standard admission ticket',
        price: 0,
        quantity: 0,
        maxPerOrder: 4
      }
    ]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (event) {
        await eventService.updateEvent(event.id, formData);
        toast.success('Event updated successfully');
      } else {
        await eventService.createEvent(formData);
        toast.success('Event created successfully');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTicketTypeChange = (index: number, field: string, value: any) => {
    const updatedTicketTypes = [...formData.ticketTypes];
    updatedTicketTypes[index] = {
      ...updatedTicketTypes[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, ticketTypes: updatedTicketTypes }));
  };

  const addTicketType = () => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: [
        ...prev.ticketTypes,
        {
          name: '',
          description: '',
          price: 0,
          quantity: 0,
          maxPerOrder: 4
        }
      ]
    }));
  };

  const removeTicketType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <div className="relative">
            <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.categories.join(', ')}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                categories: e.target.value.split(',').map(cat => cat.trim()).filter(Boolean)
              }))}
              placeholder="Music, Festival, Concert"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Capacity
          </label>
          <input
            type="number"
            min="0"
            value={formData.capacity}
            onChange={(e) => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      {/* Ticket Types */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Ticket Types</h3>
          <button
            type="button"
            onClick={addTicketType}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
          >
            Add Ticket Type
          </button>
        </div>

        <div className="space-y-4">
          {formData.ticketTypes.map((ticket, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ticket Name
                  </label>
                  <input
                    type="text"
                    value={ticket.name}
                    onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      value={ticket.price}
                      onChange={(e) => handleTicketTypeChange(index, 'price', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity Available
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={ticket.quantity}
                    onChange={(e) => handleTicketTypeChange(index, 'quantity', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Per Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={ticket.maxPerOrder}
                    onChange={(e) => handleTicketTypeChange(index, 'maxPerOrder', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={ticket.description}
                    onChange={(e) => handleTicketTypeChange(index, 'description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                    required
                  />
                </div>
              </div>

              {formData.ticketTypes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTicketType(index)}
                  className="mt-4 text-sm text-red-600 hover:text-red-700"
                >
                  Remove Ticket Type
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? (event ? 'Updating Event...' : 'Creating Event...') : (event ? 'Update Event' : 'Create Event')}
        </button>
      </div>
    </form>
  );
}