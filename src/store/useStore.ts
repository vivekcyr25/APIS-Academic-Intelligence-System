import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  regNo: string;
}

interface Mark {
  id: string;
  subject: string;
  ca1: number;
  ca2: number;
  mte: number;
  ete: number;
  total: number;
  grade: string;
  updatedAt: any;
}

interface AppState {
  user: User | null;
  marks: Mark[];
  loading: boolean;
  setUser: (user: User | null) => void;
  setMarks: (marks: Mark[]) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      marks: [],
      loading: false,
      setUser: (user) => set({ user }),
      setMarks: (marks) => set({ marks }),
      setLoading: (loading) => set({ loading }),
      logout: () => {
        set({ user: null, marks: [] });
        localStorage.removeItem('user-storage');
      },
    }),
    {
      name: 'user-storage',
    }
  )
);
