import { api } from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'USER' | 'ADMIN';
  adminCode?: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  access_token: string;
}

class AuthService {
  private readonly AUTH_ENDPOINTS = {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile'
  };

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post(this.AUTH_ENDPOINTS.LOGIN, credentials);
      if (response.data.access_token) {
        this.setToken(response.data.access_token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post(this.AUTH_ENDPOINTS.REGISTER, data);
      if (response.data.access_token) {
        this.setToken(response.data.access_token);
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async getProfile(): Promise<AuthResponse['user']> {
    try {
      const response = await api.get(this.AUTH_ENDPOINTS.PROFILE);
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }

  removeToken() {
    localStorage.removeItem('token');
    delete api.defaults.headers.Authorization;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();