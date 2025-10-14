
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithRedirect, User, signOut } from 'firebase/auth';
import { useFirebase, useUser } from '@/firebase';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isGuest, setIsGuest] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    setIsMounted(true);
    const guestStatus = Cookies.get('isGuest') === 'true';
    setIsGuest(guestStatus);
  }, []);

  useEffect(() => {
    if (user) {
        Cookies.remove('isGuest');
        setIsGuest(false);
    }
  }, [user]);

  const isLoggedIn = !!user || isGuest;

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
      // The redirect will cause the page to reload, and the onAuthStateChanged
      // listener will handle the user state.
    } catch (error) {
      console.error("Error during Google sign-in redirect:", error);
      throw error;
    }
  };

  const loginAsGuest = () => {
    if (user) {
      signOut(auth);
    }
    setIsGuest(true);
    Cookies.set('isGuest', 'true', { expires: 1 }); // Guest session for 1 day
  };

  const logout = () => {
    if (user) {
      signOut(auth);
    }
    Cookies.remove('isGuest');
    setIsGuest(false);
    // Redirect to home to reflect logged-out state
    router.push('/');
  };

  const value = {
    user,
    isLoggedIn,
    loginWithGoogle,
    loginAsGuest,
    logout,
  };

  if (!isMounted || isUserLoading) {
    return null; // or a loading spinner
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
