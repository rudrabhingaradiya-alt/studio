
'use client';

import { useEffect } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';
import { onDisconnect, ref, set } from 'firebase/database';
import { getDatabase } from 'firebase/database';

export const usePresence = (userId?: string) => {
  const { firestore } = useFirebase();
  const { user } = useUser();

  useEffect(() => {
    if (!userId || !firestore || !user) {
      return;
    }

    const db = getDatabase();
    const presenceRef = doc(firestore, 'presence', userId);
    const rtdbRef = ref(db, `presence/${userId}`);

    const presencePayload = {
      status: 'online' as const,
      last_seen: serverTimestamp(),
      displayName: user.displayName || user.email,
      photoURL: user.photoURL
    };

    const rtdbPayload = {
      status: 'online',
      last_seen: serverTimestamp(),
    };
    
    // Using RTDB for onDisconnect because Firestore doesn't have it
    onDisconnect(rtdbRef).set({ status: 'offline', last_seen: serverTimestamp() }).then(() => {
      set(rtdbRef, rtdbPayload);
      setDoc(presenceRef, presencePayload, { merge: true });
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setDoc(presenceRef, { status: 'offline', last_seen: serverTimestamp() }, { merge: true });
        set(rtdbRef, { status: 'offline', last_seen: serverTimestamp() });
      } else {
        setDoc(presenceRef, { status: 'online', last_seen: serverTimestamp() }, { merge: true });
        set(rtdbRef, { status: 'online', last_seen: serverTimestamp() });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // No need to explicitly set to offline on unmount, onDisconnect handles it.
    };
  }, [userId, firestore, user]);
};
