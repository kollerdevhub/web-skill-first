'use client';

import { useQuery } from '@tanstack/react-query';
import { certificadosService } from '@/lib/api';
import { useFirebaseAuth } from './useFirebaseAuth';

// Query keys
export const certificadosKeys = {
  all: ['certificados'] as const,
  meus: () => [...certificadosKeys.all, 'meus'] as const,
  detail: (id: string) => [...certificadosKeys.all, 'detail', id] as const,
  validate: (codigo: string) =>
    [...certificadosKeys.all, 'validate', codigo] as const,
};

/**
 * Hook to get my certificates
 */
export function useMeusCertificados() {
  const { isAuthenticated } = useFirebaseAuth();
  return useQuery({
    queryKey: certificadosKeys.meus(),
    queryFn: () => certificadosService.getMeus(),
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
  });
}

/**
 * Hook to get certificate by ID
 */
export function useCertificado(id: string) {
  return useQuery({
    queryKey: certificadosKeys.detail(id),
    queryFn: () => certificadosService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to validate certificate by code
 */
export function useValidateCertificado(codigo: string) {
  return useQuery({
    queryKey: certificadosKeys.validate(codigo),
    queryFn: () => certificadosService.validate(codigo),
    enabled: !!codigo,
  });
}
