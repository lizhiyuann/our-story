import { create } from 'zustand';
import type { User } from '../types';
import * as api from '../services/api.client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  login: async (username, password) => {
    const res = await api.post<User>('/auth/login', { username, password });
    set({ user: res.data! });
  },

  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null });
  },

  fetchUser: async () => {
    try {
      const res = await api.get<User>('/auth/me');
      set({ user: res.data ?? null, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
