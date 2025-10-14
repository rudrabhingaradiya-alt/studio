
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

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
    const storedAuth = Cookies.get('isLoggedIn');
    if (storedAuth) {
      setIsLoggedIn(JSON.parse(storedAuth));
    }
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    Cookies.set('isLoggedIn', 'true', { expires: 7 }); // expires in 7 days
  };

  const logout = () => {
    setIsLoggedIn(false);
    Cookies.remove('isLoggedIn');
  };

  const value = {
    isLoggedIn,
    login,
    logout,
  };
  
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
