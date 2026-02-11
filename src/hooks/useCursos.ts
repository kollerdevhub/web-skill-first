'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cursosService } from '@/lib/api';
import type {
  Curso,
  CreateCursoDTO,
  UpdateCursoDTO,
  CursoSearchParams,
} from '@/lib/api';

// Query keys
export const cursosKeys = {
  all: ['cursos'] as const,
  list: (params: CursoSearchParams) =>
    [...cursosKeys.all, 'list', params] as const,
  destaque: () => [...cursosKeys.all, 'destaque'] as const,
  detail: (id: string) => [...cursosKeys.all, 'detail', id] as const,
  stats: (id: string) => [...cursosKeys.all, 'stats', id] as const,
  report: (id: string) => [...cursosKeys.all, 'report', id] as const,
  conclusionReport: (id: string) =>
    [...cursosKeys.all, 'conclusionReport', id] as const,
};

/**
 * Hook to search/list courses
 */
export function useCursos(params: CursoSearchParams = {}) {
  return useQuery({
    queryKey: cursosKeys.list(params),
    queryFn: () => cursosService.search(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get featured courses
 */
export function useCursosDestaque() {
  return useQuery({
    queryKey: cursosKeys.destaque(),
    queryFn: () => cursosService.getDestaque(),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to get course by ID
 */
export function useCurso(id: string) {
  return useQuery({
    queryKey: cursosKeys.detail(id),
    queryFn: () => cursosService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create course
 */
export function useCreateCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCursoDTO) => cursosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cursosKeys.all });
    },
  });
}

/**
 * Hook to update course
 */
export function useUpdateCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCursoDTO }) =>
      cursosService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(cursosKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: cursosKeys.all });
    },
  });
}

/**
 * Hook to upload course thumbnail
 */
export function useUploadCursoThumbnail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      cursosService.uploadThumbnail(id, file),
    onSuccess: (data, variables) => {
      queryClient.setQueryData<Curso | undefined>(
        cursosKeys.detail(variables.id),
        (old) =>
          old ? { ...old, thumbnailUrl: data.thumbnailUrl } : undefined,
      );
      queryClient.invalidateQueries({ queryKey: cursosKeys.all });
    },
  });
}

/**
 * Hook to publish course
 */
export function usePublishCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cursosService.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: cursosKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: cursosKeys.all });
    },
  });
}

/**
 * Hook to unpublish course
 */
export function useUnpublishCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cursosService.unpublish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: cursosKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: cursosKeys.all });
    },
  });
}

/**
 * Hook to delete course
 */
export function useDeleteCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cursosService.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: cursosKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: cursosKeys.all });
    },
  });
}

/**
 * Hook to get course statistics
 */
export function useCursoStats(id: string) {
  return useQuery({
    queryKey: cursosKeys.stats(id),
    queryFn: () => cursosService.getStats(id),
    enabled: !!id,
  });
}

/**
 * Hook to get detailed course report
 */
export function useCursoReport(id: string) {
  return useQuery({
    queryKey: cursosKeys.report(id),
    queryFn: () => cursosService.getReport(),
    enabled: !!id,
  });
}

/**
 * Hook to get completion report by module
 */
export function useCursoConclusionReport(id: string) {
  return useQuery({
    queryKey: cursosKeys.conclusionReport(id),
    queryFn: () => cursosService.getConclusionReport(),
    enabled: !!id,
  });
}
