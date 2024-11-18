import { api } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

class UserService {
  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await api.put('/api/users/profile', data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async updatePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.put('/api/users/password', data);
  }
}

export const userService = new UserService();