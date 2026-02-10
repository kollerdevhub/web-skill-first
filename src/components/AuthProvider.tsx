'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthChanged } from '@/lib/firebase-auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firebase/collections';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Sync user to Firestore 'users' collection
        try {
          const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            lastLogin: new Date().toISOString(),
          };

          if (!userSnap.exists()) {
            // Creative new user document
            await setDoc(userRef, {
              ...userData,
              createdAt: new Date().toISOString(),
              role: 'candidato', // Default role
            });
            setIsAdmin(false);
          } else {
            // Update existing user document
            await setDoc(userRef, userData, { merge: true });

            // Check role from Firestore, fallback to email check if not set
            const currentData = userSnap.data();
            setIsAdmin(
              currentData?.role === 'admin' ||
                firebaseUser.email === 'williamkoller30@gmail.com',
            );
          }
        } catch (error) {
          console.error('Error syncing user to Firestore:', error);
          // Fallback admin check
          setIsAdmin(firebaseUser.email === 'williamkoller30@gmail.com');
        }
      } else {
        setIsAdmin(false);
      }

      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
