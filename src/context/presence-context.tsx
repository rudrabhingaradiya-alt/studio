
'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './auth-context';
import { usePresence } from '@/hooks/use-presence';

const PresenceContext = createContext<undefined>(undefined);

export const PresenceProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  usePresence(user?.uid);

  return (
    <PresenceContext.Provider value={undefined}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresenceContext = () => {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error('usePresenceContext must be used within a PresenceProvider');
  }
  return context;
};
