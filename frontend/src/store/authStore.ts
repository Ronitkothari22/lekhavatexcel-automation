import { create } from 'zustand';
import { User, Tokens } from '@/types/auth';
import { authService } from '@/services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (tokens: Tokens, user: User) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: (tokens, user) => {
    authService.saveAuthData(tokens, user);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  initializeAuth: () => {
    const user = authService.getStoredUser();
    set({ user, isAuthenticated: !!user, isLoading: false });
  },
})); 