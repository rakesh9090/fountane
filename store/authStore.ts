import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  profileImage?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  restoreSession: (user: User, token: string) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,

      login: (user, token) =>
        set({
          isAuthenticated: true,
          user,
          token,
          loading: false,
          error: null,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
          error: null,
        }),

      setLoading: (loading) =>
        set({
          loading,
        }),

      setError: (error) =>
        set({
          error,
        }),

      restoreSession: (user, token) =>
        set({
          isAuthenticated: true,
          user,
          token,
        }),
    }),
    {
      name: 'auth-storage',

      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);