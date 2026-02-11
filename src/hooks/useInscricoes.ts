'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inscricoesService } from '@/lib/api';
import type { Inscricao, UpdateProgressoDTO, SubmitQuizDTO } from '@/lib/api';
import { cursosKeys } from './useCursos';
import { useFirebaseAuth } from './useFirebaseAuth';

// Query keys
export const inscricoesKeys = {
  all: ['inscricoes'] as const,
  minhas: (userId?: string | null) =>
    [...inscricoesKeys.all, 'minhas', userId || 'anonymous'] as const,
  detail: (id: string) => [...inscricoesKeys.all, 'detail', id] as const,
};

/**
 * Hook to get my enrollments
 */
export function useMinhasInscricoes() {
  const { user, isAuthenticated, loading } = useFirebaseAuth();
  return useQuery({
    queryKey: inscricoesKeys.minhas(user?.uid),
    queryFn: () => inscricoesService.getMinhas(user?.uid),
    staleTime: 2 * 60 * 1000,
    enabled: !loading && isAuthenticated && !!user?.uid,
    refetchOnMount: 'always',
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
  const { user } = useFirebaseAuth();

  return useMutation({
    mutationFn: (cursoId: string) =>
      inscricoesService.enroll(cursoId, user?.uid),
    onSuccess: (inscricao, cursoId) => {
      if (user?.uid) {
        queryClient.setQueryData<Inscricao[]>(
          inscricoesKeys.minhas(user.uid),
          (current) => {
            if (!current) return [inscricao];
            const alreadyExists = current.some((item) => item.id === inscricao.id);
            if (alreadyExists) return current;
            return [inscricao, ...current];
          },
        );
      }
      queryClient.invalidateQueries({ queryKey: inscricoesKeys.all });
      queryClient.invalidateQueries({ queryKey: cursosKeys.detail(cursoId) });
      queryClient.invalidateQueries({ queryKey: cursosKeys.all });
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
      queryClient.invalidateQueries({ queryKey: inscricoesKeys.all });
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
      queryClient.invalidateQueries({ queryKey: inscricoesKeys.all });
    },
  });
}

/**
 * Hook to persist last accessed lesson
 */
export function useTouchInscricaoAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, moduloId }: { id: string; moduloId: string }) =>
      inscricoesService.touchLastAccess(id, moduloId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inscricoesKeys.all });
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
