import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Address } from '../types';
import { authApi, customerApi } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, phone?: string, address?: Address) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const checkAuth = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.user) {
        setUser(res.user);
        showToast(res.message || `Welcome back, ${res.user.name}!`, 'success', 'Signed In');
        return true;
      } else {
        showToast(res.error || 'Invalid credentials', 'error', 'Login Failed');
        return false;
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error', 'Error');
      return false;
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    address?: Address
  ): Promise<boolean> => {
    try {
      const res = await authApi.signup({ name, email, password, phone, address });
      if (res.success && res.user) {
        setUser(res.user);
        showToast(res.message || 'Account created successfully!', 'success', 'Welcome');
        return true;
      } else {
        showToast(res.error || 'Failed to create account', 'error', 'Registration Failed');
        return false;
      }
    } catch (err: any) {
      showToast(err.message || 'Signup failed', 'error', 'Error');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
      setUser(null);
      showToast('You have been signed out.', 'info', 'Signed Out');
    } catch (err: any) {
      setUser(null);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const res = await customerApi.getProfile();
      if (res.success && res.profile) {
        setUser(res.profile);
      }
    } catch (err) {
      console.error('Failed to refresh profile', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin' || (user as any)?.isAdmin === true,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
