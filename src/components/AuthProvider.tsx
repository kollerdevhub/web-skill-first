'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthChanged } from '@/lib/firebase-auth';
import {
  doc,
  getDoc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore';
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

import { useSession } from 'next-auth/react';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: session } = useSession();
  // Sync NextAuth session with Firebase Auth
  useEffect(() => {
    if (session?.firebaseToken) {
      signInWithCustomToken(auth, session.firebaseToken as string).catch(
        (error) => console.error('Error signing in with custom token:', error),
      );
    } else if (session === null) {
      if (auth.currentUser) {
        signOut(auth);
      }
    }
  }, [session]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Sync user to Firestore
        try {
          const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            // Prioritize Firebase data, fallback to Session data
            displayName:
              firebaseUser.displayName || session?.user?.name || null,
            photoURL: firebaseUser.photoURL || session?.user?.image || null,
            lastLogin: new Date().toISOString(),
          };

          if (!userSnap.exists()) {
            await setDoc(userRef, {
              ...userData,
              createdAt: new Date().toISOString(),
              role: 'candidato',
            });
            setIsAdmin(false);
          } else {
            await setDoc(userRef, userData, { merge: true });
            const currentData = userSnap.data();
            setIsAdmin(
              currentData?.role === 'admin' ||
                firebaseUser.email === 'williamkoller30@gmail.com',
            );
          }
        } catch (error) {
          console.error('Error syncing user to Firestore:', error);
          setIsAdmin(firebaseUser.email === 'williamkoller30@gmail.com');
        }
      } else {
        setIsAdmin(false);
      }

      // Construct a user object that includes the profile data from session if missing in Firebase
      if (firebaseUser) {
        const mergedUser = {
          ...firebaseUser,
          displayName: firebaseUser.displayName || session?.user?.name || null,
          photoURL: firebaseUser.photoURL || session?.user?.image || null,
        } as User;
        setUser(mergedUser);
      } else if (session?.user) {
        // Fallback: If Firebase auth fails (e.g. no service account), use Session data
        // This ensures the UI at least shows the user is logged in
        const fallbackUser = {
          uid: (session.user as any).id || session.user.email || 'unknown',
          email: session.user.email,
          displayName: session.user.name,
          photoURL: session.user.image,
          emailVerified: true,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => '',
          getIdTokenResult: async () => ({}) as any,
          reload: async () => {},
          toJSON: () => ({}),
          phoneNumber: null,
          providerId: 'google.com',
        } as unknown as User;
        setUser(fallbackUser);

        // Fetch user role from Firestore for fallback user
        const fetchUserRole = async () => {
          try {
            const email = session.user?.email;
            if (!email) {
              setLoading(false);
              return;
            }

            // First try finding by ID if possible (though NextAuth ID and Firebase UID might differ)
            // But relying on email query is safer for migration validation
            const q = query(
              collection(db, COLLECTIONS.USERS),
              where('email', '==', email),
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const userData = querySnapshot.docs[0].data();

              setIsAdmin(userData.role === 'admin');

              // Also update the local user object with correct UID from Firestore if needed
              if (querySnapshot.docs[0].id) {
                setUser((prev) =>
                  prev
                    ? ({ ...prev, uid: querySnapshot.docs[0].id } as User)
                    : null,
                );
              }
            } else {
              console.log('User document not found in Firestore by email');
              setIsAdmin(false);
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
            setIsAdmin(false);
          } finally {
            setLoading(false);
          }
        };

        await fetchUserRole();
      } else {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [session]); // Add session as dependency to re-run if session loads late

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
