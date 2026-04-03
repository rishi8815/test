import { api } from '../lib/api';

type User = {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'reseller';
};

type AuthResponse = {
  token: string;
  user: User;
};

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post('/auth/login', { email, password });
    return res.data?.data;
  },

  async signup(name: string, email: string, password: string): Promise<{ message: string; otp?: string; email: string }> {
    const res = await api.post('/auth/signup', { name, email, password });
    return res.data;
  },

  async verifySignup(email: string, otp: string): Promise<AuthResponse> {
    const res = await api.post('/auth/verify-signup', { email, otp });
    return res.data?.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data?.data;
  },
};
