'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidaturasService } from '@/lib/api';
import type {
  UpdateCandidaturaStatusDTO,
  ConvidarEntrevistaDTO,
} from '@/lib/api';
import { vagasKeys } from './useVagas';
import { useFirebaseAuth } from './useFirebaseAuth';

// Query keys
export const candidaturasKeys = {
  all: ['candidaturas'] as const,
  minhas: () => [...candidaturasKeys.all, 'minhas'] as const,
  byVaga: (vagaId: string) =>
    [...candidaturasKeys.all, 'vaga', vagaId] as const,
  ranking: (vagaId: string) =>
    [...candidaturasKeys.all, 'ranking', vagaId] as const,
  detail: (id: string) => [...candidaturasKeys.all, 'detail', id] as const,
};

/**
 * Hook to get my applications (candidate)
 */
export function useMinhasCandidaturas() {
  const { user, isAuthenticated } = useFirebaseAuth();
  return useQuery({
    queryKey: candidaturasKeys.minhas(),
    queryFn: () => candidaturasService.getMinhas(user?.uid),
    staleTime: 2 * 60 * 1000,
    enabled: isAuthenticated && !!user?.uid,
  });
}

/**
 * Hook to get applications by job (recruiter)
 */
export function useCandidaturasByVaga(vagaId: string) {
  return useQuery({
    queryKey: candidaturasKeys.byVaga(vagaId),
    queryFn: () => candidaturasService.getByVaga(vagaId),
    enabled: !!vagaId,
  });
}

/**
 * Hook to get candidate ranking for a job
 */
export function useCandidaturaRanking(vagaId: string) {
  return useQuery({
    queryKey: candidaturasKeys.ranking(vagaId),
    queryFn: () => candidaturasService.getRanking(vagaId),
    enabled: !!vagaId,
  });
}

/**
 * Hook to get application by ID
 */
export function useCandidatura(id: string) {
  return useQuery({
    queryKey: candidaturasKeys.detail(id),
    queryFn: () => candidaturasService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to apply to a job
 */
export function useApply() {
  const queryClient = useQueryClient();
  const { user } = useFirebaseAuth();

  return useMutation({
    mutationFn: (vagaId: string) =>
      candidaturasService.apply(vagaId, user?.uid),
    onSuccess: (_, vagaId) => {
      queryClient.invalidateQueries({ queryKey: candidaturasKeys.minhas() });
      queryClient.invalidateQueries({
        queryKey: vagasKeys.candidaturasCount(vagaId),
      });
    },
  });
}

/**
 * Hook to cancel application
 */
export function useCancelCandidatura() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => candidaturasService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidaturasKeys.all });
    },
  });
}

/**
 * Hook to update application status
 */
export function useUpdateCandidaturaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCandidaturaStatusDTO;
    }) => candidaturasService.updateStatus(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(candidaturasKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: candidaturasKeys.all });
    },
  });
}

/**
 * Hook to send feedback
 */
export function useSendFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, mensagem }: { id: string; mensagem: string }) =>
      candidaturasService.sendFeedback(id, mensagem),
    onSuccess: (data) => {
      queryClient.setQueryData(candidaturasKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook to invite to interview
 */
export function useInviteToInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConvidarEntrevistaDTO }) =>
      candidaturasService.inviteToInterview(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: candidaturasKeys.detail(variables.id),
      });
    },
  });
}
