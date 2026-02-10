'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empresasService } from '@/lib/api';
import type { Empresa, CreateEmpresaDTO, UpdateEmpresaDTO } from '@/lib/api';

// Query keys
export const empresasKeys = {
  all: ['empresas'] as const,
  list: () => [...empresasKeys.all, 'list'] as const,
  detail: (id: string) => [...empresasKeys.all, 'detail', id] as const,
  vagasCount: (id: string) => [...empresasKeys.all, 'vagasCount', id] as const,
};

/**
 * Hook to list all companies
 */
export function useEmpresas() {
  return useQuery({
    queryKey: empresasKeys.list(),
    queryFn: () => empresasService.list(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get company by ID
 */
export function useEmpresa(id: string) {
  return useQuery({
    queryKey: empresasKeys.detail(id),
    queryFn: () => empresasService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create company
 */
export function useCreateEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmpresaDTO) => empresasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: empresasKeys.list() });
    },
  });
}

/**
 * Hook to update company
 */
export function useUpdateEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmpresaDTO }) =>
      empresasService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(empresasKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: empresasKeys.list() });
    },
  });
}

/**
 * Hook to upload company logo
 */
export function useUploadEmpresaLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      empresasService.uploadLogo(id, file),
    onSuccess: (data, variables) => {
      queryClient.setQueryData<Empresa | undefined>(
        empresasKeys.detail(variables.id),
        (old) => (old ? { ...old, logoUrl: data.logoUrl } : undefined),
      );
      queryClient.invalidateQueries({ queryKey: empresasKeys.list() });
    },
  });
}

/**
 * Hook to deactivate company
 */
export function useDeactivateEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => empresasService.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: empresasKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: empresasKeys.list() });
    },
  });
}

/**
 * Hook to activate company
 */
export function useActivateEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => empresasService.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: empresasKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: empresasKeys.list() });
    },
  });
}

/**
 * Hook to get company jobs count
 */
export function useEmpresaVagasCount(id: string) {
  return useQuery({
    queryKey: empresasKeys.vagasCount(id),
    queryFn: () => empresasService.getVagasCount(id),
    enabled: !!id,
  });
}
