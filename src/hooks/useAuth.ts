'use client';

import { useFirebaseAuth } from './useFirebaseAuth';
import { signOutUser } from '@/lib/firebase-auth';
import { useRouter } from 'next/navigation';

/**
 * Hook to get current authenticated user
 * Maintains compatibility with previous useQuery structure where possible
 */
export function useMe() {
  const { user, loading, isAdmin, isAuthenticated } = useFirebaseAuth();

  return {
    data: user ? { ...user, role: isAdmin ? 'admin' : 'candidate' } : null,
    isLoading: loading,
    isAuthenticated,
    isAdmin,
  };
}

/**
 * Hook to logout
 */
export function useLogout() {
  const router = useRouter();

  return {
    mutate: async () => {
      await signOutUser();
      router.push('/login');
    },
    isLoading: false,
  };
}

/**
 * Hook to register LGPD consent (placeholder for now)
 */
export function useConsent() {
  return {
    mutate: async () => {
      // TODO: Implement consent logic in Firestore
      console.log('Consent registered');
    },
    isLoading: false,
  };
}
