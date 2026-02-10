'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vagasService } from '@/lib/api';
import type { CreateVagaDTO, UpdateVagaDTO, VagaSearchParams } from '@/lib/api';

// Query keys
export const vagasKeys = {
  all: ['vagas'] as const,
  list: (params: VagaSearchParams) =>
    [...vagasKeys.all, 'list', params] as const,
  detail: (id: string) => [...vagasKeys.all, 'detail', id] as const,
  candidaturas: (id: string) => [...vagasKeys.all, 'candidaturas', id] as const,
  candidaturasCount: (id: string) =>
    [...vagasKeys.all, 'candidaturasCount', id] as const,
};

/**
 * Hook to search/list jobs
 */
export function useVagas(params: VagaSearchParams = {}) {
  return useQuery({
    queryKey: vagasKeys.list(params),
    queryFn: () => vagasService.search(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get job by ID
 */
export function useVaga(id: string) {
  return useQuery({
    queryKey: vagasKeys.detail(id),
    queryFn: () => vagasService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create job
 */
export function useCreateVaga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVagaDTO) => vagasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vagasKeys.all });
    },
  });
}

/**
 * Hook to update job
 */
export function useUpdateVaga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVagaDTO }) =>
      vagasService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(vagasKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: vagasKeys.all });
    },
  });
}

/**
 * Hook to publish job
 */
export function usePublishVaga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vagasService.publish(id),
    onSuccess: (data) => {
      queryClient.setQueryData(vagasKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: vagasKeys.all });
    },
  });
}

/**
 * Hook to pause job
 */
export function usePauseVaga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vagasService.pause(id),
    onSuccess: (data) => {
      queryClient.setQueryData(vagasKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: vagasKeys.all });
    },
  });
}

/**
 * Hook to resume job
 */
export function useResumeVaga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vagasService.resume(id),
    onSuccess: (data) => {
      queryClient.setQueryData(vagasKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: vagasKeys.all });
    },
  });
}

/**
 * Hook to close job
 */
export function useCloseVaga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vagasService.close(id),
    onSuccess: (data) => {
      queryClient.setQueryData(vagasKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: vagasKeys.all });
    },
  });
}

/**
 * Hook to delete job
 */
export function useDeleteVaga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vagasService.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: vagasKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: vagasKeys.all });
    },
  });
}

/**
 * Hook to get job applications
 */
export function useVagaCandidaturas(
  id: string,
  params: { status?: string; orderBy?: string } = {},
) {
  return useQuery({
    queryKey: vagasKeys.candidaturas(id),
    queryFn: () => vagasService.getCandidaturas(id, params),
    enabled: !!id,
  });
}

/**
 * Hook to get job applications count
 */
export function useVagaCandidaturasCount(id: string) {
  return useQuery({
    queryKey: vagasKeys.candidaturasCount(id),
    queryFn: () => vagasService.getCandidaturasCount(id),
    enabled: !!id,
  });
}
