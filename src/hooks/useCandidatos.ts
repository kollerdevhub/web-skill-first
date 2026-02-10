'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidatosService } from '@/lib/api';
import type {
  Candidato,
  CreateCandidatoDTO,
  UpdateCandidatoDTO,
} from '@/lib/api';

// Query keys
export const candidatosKeys = {
  all: ['candidatos'] as const,
  myProfile: () => [...candidatosKeys.all, 'me'] as const,
  detail: (id: string) => [...candidatosKeys.all, 'detail', id] as const,
};

/**
 * Hook to get my candidate profile
 */
export function useMyProfile() {
  return useQuery({
    queryKey: candidatosKeys.myProfile(),
    queryFn: () => candidatosService.getMyProfile(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/**
 * Hook to create candidate profile
 */
export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCandidatoDTO) =>
      candidatosService.createProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(candidatosKeys.myProfile(), data);
    },
  });
}

/**
 * Hook to update candidate profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCandidatoDTO) =>
      candidatosService.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(candidatosKeys.myProfile(), data);
    },
  });
}

/**
 * Hook to upload curriculum
 */
export function useUploadCurriculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => candidatosService.uploadCurriculo(file),
    onSuccess: (data) => {
      queryClient.setQueryData<Candidato | undefined>(
        candidatosKeys.myProfile(),
        (old) =>
          old ? { ...old, curriculoUrl: data.curriculoUrl } : undefined,
      );
    },
  });
}

/**
 * Hook to delete curriculum
 */
export function useDeleteCurriculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => candidatosService.deleteCurriculo(),
    onSuccess: () => {
      queryClient.setQueryData<Candidato | undefined>(
        candidatosKeys.myProfile(),
        (old) => (old ? { ...old, curriculoUrl: undefined } : undefined),
      );
    },
  });
}

/**
 * Hook to get candidate by ID (recruiter/admin)
 */
export function useCandidato(id: string) {
  return useQuery({
    queryKey: candidatosKeys.detail(id),
    queryFn: () => candidatosService.getById(id),
    enabled: !!id,
  });
}
