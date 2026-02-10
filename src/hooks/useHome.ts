'use client';

import { useQuery } from '@tanstack/react-query';
import { homeService } from '@/lib/api';

// Query keys
export const homeKeys = {
  all: ['home'] as const,
  data: () => [...homeKeys.all, 'data'] as const,
};

/**
 * Hook to get landing page data
 */
export function useHomeData() {
  return useQuery({
    queryKey: homeKeys.data(),
    queryFn: () => homeService.getData(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
