import axios from 'axios';
import toast from 'react-hot-toast';

// Get base URL from environment variable, remove /auth if present
const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:3000')


export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor - Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error);

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(new Error('Network error'));
    }

    // Get error message from response or use default
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   'An unexpected error occurred';
    
    // Handle specific status codes
    switch (error.response.status) {
      case 401:
        localStorage.removeItem('token');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
        break;
      case 403:
        toast.error('You do not have permission to perform this action');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 422:
        toast.error('Invalid input data');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;