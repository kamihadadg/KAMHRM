'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  employeeId: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'PERSONNEL' | 'MIDDLEMANAGER' | 'HRADMIN' | 'SUPERADMIN';
  profileImageUrl?: string; // URL عکس پروفایل
  position?: {
    id: string;
    title: string;
  };
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  subordinates?: User[];
  createdAt?: string;
  lastLoginAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Check for existing token on mount - only on client side
  useEffect(() => {
    const initAuth = () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
          try {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } catch (error) {
            // Clear corrupted data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
          }
        }
      }
      setIsHydrated(true);
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.112:8081'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در ورود');
      }

      const data = await response.json();

      setToken(data.access_token);
      setUser(data.user);

      // Store in localStorage - only on client side
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }
    } catch (error) {
      throw error;
    }
  };


  const logout = () => {
    setUser(null);
    setToken(null);
    // Clear localStorage - only on client side
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) {
      throw new Error('لطفاً ابتدا وارد شوید');
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.112:8081'}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در تغییر رمز عبور');
      }
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    changePassword,
    isAuthenticated: isHydrated && !!user && !!token,
  };

  // Show loading until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
