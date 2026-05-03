import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user.types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setToken: (token) => set({ token, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      clearAuth: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    { name: 'flatmate-auth' }
  )
);