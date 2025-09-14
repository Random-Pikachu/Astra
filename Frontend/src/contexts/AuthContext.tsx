import React, { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUserRedux, clearUserRedux } from '../store/userSlice';
import type { UserRedux } from '../store/userSlice';

interface AuthContextType {
  user: UserRedux | null;
  login: (userData: UserRedux) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
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
  const dispatch = useAppDispatch();
  const userRedux = useAppSelector((state) => state.user);

  useEffect(() => {
    // Check for user data in localStorage on app initialization
    const checkAuthStatus = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          dispatch(setUserRedux(JSON.parse(userData)));
        }
      } catch (error) {
        localStorage.removeItem('user'); // Clear invalid data
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  const login = (userData: UserRedux) => {
    dispatch(setUserRedux(userData));
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    dispatch(clearUserRedux());
    localStorage.removeItem('user');
  };

  const value = {
    user: userRedux,
    login,
    logout,
    isAuthenticated: !!userRedux && Object.keys(userRedux).length > 0,
    loading: false, // No loading state in new pattern
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};