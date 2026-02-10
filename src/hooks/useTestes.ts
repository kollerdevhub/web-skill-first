'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testesService } from '@/lib/api';
import type {
  CreateTesteDTO,
  UpdateTesteDTO,
  SubmeterTesteDTO,
} from '@/lib/api';

// Query keys
export const testesKeys = {
  all: ['testes'] as const,
  detail: (id: string) => [...testesKeys.all, 'detail', id] as const,
  byVaga: (vagaId: string) => [...testesKeys.all, 'vaga', vagaId] as const,
  forCandidate: (id: string) => [...testesKeys.all, 'realizar', id] as const,
};

/**
 * Hook to get test by ID (recruiter - with answers)
 */
export function useTeste(id: string) {
  return useQuery({
    queryKey: testesKeys.detail(id),
    queryFn: () => testesService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to get test by job ID
 */
export function useTesteByVaga(vagaId: string) {
  return useQuery({
    queryKey: testesKeys.byVaga(vagaId),
    queryFn: () => testesService.getByVaga(vagaId),
    enabled: !!vagaId,
  });
}

/**
 * Hook to get test for candidate (no answers)
 */
export function useTesteForCandidate(id: string) {
  return useQuery({
    queryKey: testesKeys.forCandidate(id),
    queryFn: () => testesService.getForCandidate(id),
    enabled: !!id,
  });
}

/**
 * Hook to create test
 */
export function useCreateTeste() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTesteDTO) => testesService.create(data),
    onSuccess: (data) => {
      queryClient.setQueryData(testesKeys.byVaga(data.vagaId), data);
    },
  });
}

/**
 * Hook to update test
 */
export function useUpdateTeste() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTesteDTO }) =>
      testesService.update(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(testesKeys.detail(data.id), data);
      queryClient.invalidateQueries({
        queryKey: testesKeys.byVaga(data.vagaId),
      });
    },
  });
}

/**
 * Hook to delete test
 */
export function useDeleteTeste() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testesService.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: testesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: testesKeys.all });
    },
  });
}

/**
 * Hook to submit test answers (candidate)
 */
export function useSubmitTeste() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmeterTesteDTO) => testesService.submit(data),
    onSuccess: () => {
      // Invalidate candidaturas to refresh test scores
      queryClient.invalidateQueries({ queryKey: ['candidaturas'] });
    },
  });
}
