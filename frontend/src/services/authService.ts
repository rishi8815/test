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

  async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await api.post('/auth/signup', { name, email, password });
    return res.data?.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data?.data;
  },
};
