import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { LoginDto, RegisterDto, AuthResponse } from '@c2c/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<boolean>;
  register: (data: RegisterDto) => Promise<boolean>;
  logout: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [user, setUser] = useState<AuthResponse['user'] | null>(
    localStorage.getItem('auth_user') ? JSON.parse(localStorage.getItem('auth_user')!) : null
  );
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isAuthenticated = !!token;

  const login = async (data: LoginDto) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result: AuthResponse = await res.json();
        setToken(result.access_token);
        setUser(result.user);
        localStorage.setItem('auth_token', result.access_token);
        localStorage.setItem('auth_user', JSON.stringify(result.user));
        setShowLoginModal(false);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const register = async (data: RegisterDto) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result: AuthResponse = await res.json();
        setToken(result.access_token);
        setUser(result.user);
        localStorage.setItem('auth_token', result.access_token);
        localStorage.setItem('auth_user', JSON.stringify(result.user));
        setShowLoginModal(false);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      login,
      register,
      logout,
      showLoginModal,
      setShowLoginModal
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

