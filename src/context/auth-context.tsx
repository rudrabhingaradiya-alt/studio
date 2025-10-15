
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { 
  GoogleAuthProvider, 
  signInWithRedirect, 
  User, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  AuthError
} from 'firebase/auth';
import { useFirebase, useUser } from '@/firebase';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loginWithGoogle: () => Promise<void>;
  signupWithEmail: (email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const formatAuthError = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email address is already in use.';
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.';
    case 'auth/weak-password':
      return 'The password is too weak.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
        return 'Invalid credentials. Please check your email and password.';
    default:
      return 'An unknown authentication error occurred.';
  }
}

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
    } catch (error) {
      console.error("Error during Google sign-in redirect:", error);
      throw error;
    }
  };
  
  const signupWithEmail = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw new Error(formatAuthError(error as AuthError));
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw new Error(formatAuthError(error as AuthError));
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
    router.push('/');
  };

  const value = {
    user,
    isLoggedIn,
    loginWithGoogle,
    signupWithEmail,
    loginWithEmail,
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
