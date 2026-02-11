'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inscricoesService } from '@/lib/api';
import type { UpdateProgressoDTO, SubmitQuizDTO } from '@/lib/api';
import { cursosKeys } from './useCursos';
import { useFirebaseAuth } from './useFirebaseAuth';

// Query keys
export const inscricoesKeys = {
  all: ['inscricoes'] as const,
  minhas: () => [...inscricoesKeys.all, 'minhas'] as const,
  detail: (id: string) => [...inscricoesKeys.all, 'detail', id] as const,
};

/**
 * Hook to get my enrollments
 */
export function useMinhasInscricoes() {
  const { isAuthenticated } = useFirebaseAuth();
  return useQuery({
    queryKey: inscricoesKeys.minhas(),
    queryFn: () => inscricoesService.getMinhas(),
    staleTime: 2 * 60 * 1000,
    enabled: isAuthenticated,
  });
}

/**
 * Hook to get enrollment by ID
 */
export function useInscricao(id: string) {
  return useQuery({
    queryKey: inscricoesKeys.detail(id),
    queryFn: () => inscricoesService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to enroll in a course
 */
export function useEnroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cursoId: string) => inscricoesService.enroll(cursoId),
    onSuccess: (_, cursoId) => {
      queryClient.invalidateQueries({ queryKey: inscricoesKeys.minhas() });
      queryClient.invalidateQueries({ queryKey: cursosKeys.detail(cursoId) });
    },
  });
}

/**
 * Hook to update progress
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProgressoDTO }) =>
      inscricoesService.updateProgress(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: inscricoesKeys.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: inscricoesKeys.minhas() });
    },
  });
}

/**
 * Hook to submit quiz
 */
export function useSubmitQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubmitQuizDTO }) =>
      inscricoesService.submitQuiz(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: inscricoesKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: inscricoesKeys.minhas() });
    },
  });
}

/**
 * Hook to cancel enrollment
 */
export function useCancelInscricao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inscricoesService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inscricoesKeys.all });
    },
  });
}
