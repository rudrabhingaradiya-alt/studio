
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(!!currentUser || !!Cookies.get('isGuest'));
    });
    
    // Also check for guest cookie on initial load
    if (Cookies.get('isGuest')) {
        setIsLoggedIn(true);
    }

    return () => unsubscribe();
  }, [auth]);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      Cookies.remove('isGuest');
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      throw error;
    }
  };

  const loginAsGuest = () => {
    logout(); // Clear any existing auth state
    setIsLoggedIn(true);
    Cookies.set('isGuest', 'true', { expires: 1 }); // Guest session for 1 day
  };

  const logout = () => {
    auth.signOut();
    Cookies.remove('isGuest');
    setIsLoggedIn(false);
  };

  const value = {
    user,
    isLoggedIn,
    loginWithGoogle,
    loginAsGuest,
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
