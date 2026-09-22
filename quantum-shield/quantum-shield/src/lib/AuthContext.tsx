import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';
import { useNavigate } from 'react-router-dom';

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  department: string;
  status: string;
  role_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await api.get('/me');
        
        // Map role_id to role_name for UI
        let role_name = 'admin';
        if (userData.role_id === 2) role_name = 'professor';
        if (userData.role_id === 3) role_name = 'centre';
        
        setUser({ ...userData, role_name });
      } catch (err) {
        console.error('Failed to fetch user:', err);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    
    let role_name = 'admin';
    if (userData.role_id === 2) role_name = 'professor';
    if (userData.role_id === 3) role_name = 'centre';
    
    setUser({ ...userData, role_name });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
