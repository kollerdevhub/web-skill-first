'use client';

import { useFirebaseAuth } from './useFirebaseAuth';
import { signOutUser } from '@/lib/firebase-auth';
import { useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/lib/api';

/**
 * Hook to get current authenticated user
 * Maintains compatibility with previous useQuery structure where possible
 */
export function useAuth() {
  const { user, loading, isAdmin, isAuthenticated } = useFirebaseAuth();

  return {
    user: user
      ? {
          ...user,
          id: user.uid,
          role: (isAdmin ? 'admin' : 'candidato') as 'admin' | 'candidato',
        }
      : null,
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

/**
 * Hook to fetch current user data from backend
 */
export function useMe() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['me'],
    queryFn: () => authService.getMe(),
    enabled: isAuthenticated,
    retry: false,
  });
}
