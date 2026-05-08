import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '../services/auth/authService.ts';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      setUser: (user) => set({ user, loading: false }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'apis-auth-storage',
    }
  )
);
