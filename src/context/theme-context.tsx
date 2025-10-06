
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  boardTheme: string;
  setBoardTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [boardTheme, setBoardTheme] = useState('default');
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    const storedDarkMode = localStorage.getItem('isDarkMode');
    const storedBoardTheme = localStorage.getItem('boardTheme');
    
    if (storedDarkMode !== null) {
      setIsDarkMode(JSON.parse(storedDarkMode));
    } else {
      setIsDarkMode(true);
    }
    if (storedBoardTheme !== null) {
      setBoardTheme(storedBoardTheme);
    }
  }, []);

  useEffect(() => {
    if(isMounted) {
      const root = window.document.documentElement;
      if (isDarkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    }
  }, [isDarkMode, isMounted]);

  useEffect(() => {
    if(isMounted) {
      localStorage.setItem('boardTheme', boardTheme);
    }
  }, [boardTheme, isMounted]);

  const value = {
    isDarkMode,
    setIsDarkMode,
    boardTheme,
    setBoardTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
