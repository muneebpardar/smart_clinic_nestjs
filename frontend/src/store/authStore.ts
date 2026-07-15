import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const storedUser = localStorage.getItem('user');
  let parsedUser = null;
  try {
    if (storedUser) {
      parsedUser = JSON.parse(storedUser);
    }
  } catch (e) {
    console.error('Failed to parse stored user', e);
  }

  return {
    user: parsedUser,
    token: localStorage.getItem('token'),
    setAuth: (user, token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token });
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
    },
  };
});
