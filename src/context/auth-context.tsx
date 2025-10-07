
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedAuth = localStorage.getItem('isLoggedIn');
      if (storedAuth) {
        setIsLoggedIn(JSON.parse(storedAuth));
      }
    } catch (error) {
      console.error('Failed to parse auth status from localStorage', error);
    }
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', JSON.stringify(true));
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', JSON.stringify(false));
    }
  };

  const value = {
    isLoggedIn,
    login,
    logout,
  };
  
  // Prevent rendering children until mounted on the client
  if (!isMounted) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
