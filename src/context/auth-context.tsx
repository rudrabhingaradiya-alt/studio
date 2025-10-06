
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
    const storedAuth = localStorage.getItem('isLoggedIn');
    if (storedAuth) {
      setIsLoggedIn(JSON.parse(storedAuth));
    }
  }, []);

  const login = () => {
    setIsLoggedIn(true);
     if(isMounted) {
      localStorage.setItem('isLoggedIn', JSON.stringify(true));
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
     if(isMounted) {
      localStorage.setItem('isLoggedIn', JSON.stringify(false));
    }
  };

  const value = {
    isLoggedIn,
    login,
    logout,
  };

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
