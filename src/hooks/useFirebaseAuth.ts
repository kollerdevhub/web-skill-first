import { useAuthContext } from '@/components/AuthProvider';

export function useFirebaseAuth() {
  const { user, loading, isAdmin } = useAuthContext();

  return {
    user,
    loading,
    isAdmin,
    isAuthenticated: !!user,
  };
}
