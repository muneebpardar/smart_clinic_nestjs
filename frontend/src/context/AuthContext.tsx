import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, token, setAuth, logout } = useAuthStore();

  useEffect(() => {
    // Optionally: fetch user details on mount if token exists
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
