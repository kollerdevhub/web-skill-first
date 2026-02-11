'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  useCurso,
  useInscricao,
  useMinhasInscricoes,
  useUpdateProgress,
} from '@/hooks';
import { useResumeSkillsUpdater } from '@/hooks/useResumeSkillsUpdater';
import { type Modulo, modulosService } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  PlayCircle,
  Trophy,
  Sparkles,
} from 'lucide-react';

// ============================================================================
// Helpers
// ============================================================================

function splitSectionAndLessonTitle(title: string) {
  const parts = title.split('::').map((p) => p.trim());
  if (parts.length >= 2 && parts[0]) {
    return { section: parts[0], lesson: parts.slice(1).join(' :: ').trim() };
  }
  return { section: 'Geral', lesson: title };
}

// ============================================================================
// Page
// ============================================================================

export default function CourseDetailsPage() {
  const params = useParams<{ id: string }>();
  const courseId = params?.id || '';
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [markingCompleteId, setMarkingCompleteId] = useState<string | null>(
    null,
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ------ data fetching ------
  const {
    data: course,
    isLoading: loadingCourse,
    error: courseError,
  } = useCurso(courseId);
  const { data: inscricoes } = useMinhasInscricoes();
  const updateProgressMutation = useUpdateProgress();
  const {
    status: skillsStatus,
    progress: skillsProgress,
    updateSkillsFromCourse,
  } = useResumeSkillsUpdater();

  const { data: modulos, isLoading: loadingModules } = useQuery({
    queryKey: ['curso-modulos', courseId],
    queryFn: () => modulosService.list(courseId),
    enabled: !!courseId,
  });

  const inscricaoAtual = useMemo(
    () =>
      (inscricoes || []).find((inscricao) => inscricao.cursoId === courseId),
    [inscricoes, courseId],
  );

  const { data: inscricaoDetalhada } = useInscricao(inscricaoAtual?.id || '');

  // ------ derived data ------
  const sortedModules = useMemo(
    () => [...(modulos || [])].sort((a, b) => a.ordem - b.ordem),
    [modulos],
  );

  const groupedModules = useMemo(() => {
    const groups: Array<{ section: string; lessons: Modulo[] }> = [];
    const map = new Map<string, Modulo[]>();

    for (const m of sortedModules) {
      const { section } = splitSectionAndLessonTitle(m.titulo);
      const list = map.get(section) || [];
      list.push(m);
      map.set(section, list);
    }

    for (const [section, lessons] of map.entries()) {
      groups.push({ section, lessons });
    }

    groups.sort((a, b) => {
      const aIdx = sortedModules.findIndex(
        (m) => splitSectionAndLessonTitle(m.titulo).section === a.section,
      );
      const bIdx = sortedModules.findIndex(
        (m) => splitSectionAndLessonTitle(m.titulo).section === b.section,
      );
      return aIdx - bIdx;
    });

    return groups;
  }, [sortedModules]);

  // ------ selection ------
  useEffect(() => {
    if (sortedModules.length === 0) {
      setSelectedModuleId(null);
      return;
    }

    if (
      selectedModuleId &&
      sortedModules.some((m) => m.id === selectedModuleId)
    ) {
      return;
    }

    const lastAccessed = inscricaoAtual?.ultimoModuloAcessado
      ? sortedModules.find((m) => m.id === inscricaoAtual.ultimoModuloAcessado)
      : null;

    setSelectedModuleId((lastAccessed || sortedModules[0]).id);
  }, [inscricaoAtual?.ultimoModuloAcessado, selectedModuleId, sortedModules]);

  const selectedModule = useMemo(
    () =>
      sortedModules.find((m) => m.id === selectedModuleId) ||
      sortedModules[0] ||
      null,
    [selectedModuleId, sortedModules],
  );

  const completedModuleIds = useMemo(() => {
    const progressList = inscricaoDetalhada?.modulosProgresso || [];
    return new Set(
      progressList
        .filter((item) => item.concluido)
        .map((item) => item.moduloId),
    );
  }, [inscricaoDetalhada?.modulosProgresso]);

  const hasCompletedSelected = selectedModule
    ? completedModuleIds.has(selectedModule.id)
    : false;

  const progressPercent = inscricaoAtual?.progressoPercentual ?? 0;

  const selectedIndex = selectedModule
    ? sortedModules.findIndex((m) => m.id === selectedModule.id)
    : -1;
  const isFirstLesson = selectedIndex <= 0;
  const isLastLesson = selectedIndex >= sortedModules.length - 1;

  // ------ actions ------
  async function handleMarkAsCompleted(modulo: Modulo) {
    if (!inscricaoAtual) {
      setProgressError('Você precisa estar inscrito para registrar progresso.');
      return;
    }

    setMarkingCompleteId(modulo.id);
    setProgressMessage(null);
    setProgressError(null);

    try {
      const result = await updateProgressMutation.mutateAsync({
        id: inscricaoAtual.id,
        data: {
          moduloId: modulo.id,
          concluido: true,
          tempoAssistido: modulo.videoDuracao,
        },
      });
      setProgressMessage('Progresso atualizado com sucesso!');

      // Check if course is now fully completed
      const newCompletedCount = (result.modulosProgresso || []).filter(
        (m) => m.concluido,
      ).length;
      const totalModules = sortedModules.length;
      const isNowCompleted =
        totalModules > 0 && newCompletedCount >= totalModules;

      if (isNowCompleted && course) {
        // Trigger WebLLM skills analysis
        const moduleNames = sortedModules.map((m) => m.titulo);
        updateSkillsFromCourse(
          inscricaoAtual.candidatoId,
          course.titulo,
          course.descricao || '',
          moduleNames,
        );
      }
    } catch (error) {
      setProgressError(
        error instanceof Error ? error.message : 'Erro ao atualizar progresso',
      );
    } finally {
      setMarkingCompleteId(null);
    }
  }

  function goToPrevModule() {
    if (selectedIndex > 0) {
      setSelectedModuleId(sortedModules[selectedIndex - 1].id);
    }
  }

  function goToNextModule() {
    if (selectedIndex < sortedModules.length - 1) {
      setSelectedModuleId(sortedModules[selectedIndex + 1].id);
    }
  }

  // ------ loading / error states ------
  if (loadingCourse) {
    return (
      <div className='flex items-center justify-center h-[45vh]'>
        <Loader2 className='h-6 w-6 animate-spin text-primary' />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className='space-y-4'>
        <Link href='/dashboard/cursos'>
          <Button variant='outline'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Voltar para meus cursos
          </Button>
        </Link>
        <Card className='bg-destructive/10 border-destructive/30'>
          <CardContent className='p-6 flex items-center gap-2 text-destructive'>
            <AlertCircle className='h-5 w-5' />
            Não foi possível carregar os detalhes do curso.
          </CardContent>
        </Card>
      </div>
    );
  }

  // ------ main render ------
  return (
    <div className='space-y-6 pb-10'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Link href='/dashboard/cursos'>
          <Button variant='ghost' size='sm'>
            <ArrowLeft className='h-4 w-4 mr-1' />
            Cursos
          </Button>
        </Link>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>
            {course.titulo}
          </h1>
          <div className='flex gap-2 mt-0.5'>
            <Badge variant='secondary'>{course.categoria}</Badge>
            <Badge variant='outline'>
              <Clock className='h-3 w-3 mr-1' />
              {course.cargaHoraria}h
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      {progressError && (
        <div className='rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
          {progressError}
        </div>
      )}
      {progressMessage && (
        <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700'>
          {progressMessage}
        </div>
      )}
      {skillsStatus !== 'idle' && (
        <div
          className={`rounded-lg border p-3 text-sm flex items-center gap-2 ${
            skillsStatus === 'done'
              ? 'border-purple-200 bg-purple-50 text-purple-700'
              : skillsStatus === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-blue-200 bg-blue-50 text-blue-700'
          }`}
        >
          {skillsStatus === 'done' ? (
            <Sparkles className='h-4 w-4 shrink-0' />
          ) : skillsStatus === 'error' ? (
            <AlertCircle className='h-4 w-4 shrink-0' />
          ) : (
            <Loader2 className='h-4 w-4 shrink-0 animate-spin' />
          )}
          {skillsProgress}
        </div>
      )}

      {/* Two-Column Layout */}
      <div className='grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6'>
        {/* ========== LEFT: Video + Info + Navigation ========== */}
        <div className='space-y-4'>
          {/* Video Player */}
          <div className='aspect-video bg-black rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5'>
            {selectedModule?.tipoConteudo === 'video' &&
            selectedModule.videoUrl ? (
              <video
                ref={videoRef}
                key={selectedModule.id}
                src={selectedModule.videoUrl}
                controls
                autoPlay
                onEnded={() => {
                  void handleMarkAsCompleted(selectedModule);
                  goToNextModule();
                }}
                preload='metadata'
                className='w-full h-full'
              />
            ) : selectedModule?.tipoConteudo === 'texto' &&
              selectedModule.conteudoTexto ? (
              <div className='w-full h-full overflow-auto p-8 bg-white'>
                <div className='prose prose-slate max-w-none'>
                  <h3>
                    {splitSectionAndLessonTitle(selectedModule.titulo).lesson}
                  </h3>
                  <div className='whitespace-pre-wrap'>
                    {selectedModule.conteudoTexto}
                  </div>
                </div>
              </div>
            ) : (
              <div className='w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-neutral-800 to-neutral-900 text-neutral-400'>
                <div className='w-16 h-16 rounded-full border-2 border-neutral-500 flex items-center justify-center mb-4'>
                  <PlayCircle className='h-8 w-8' />
                </div>
                <p className='text-sm font-medium'>
                  Nenhum vídeo disponível para esta aula
                </p>
              </div>
            )}
          </div>

          {/* Lesson Info (minimal: duration + title) */}
          {selectedModule && (
            <div className='space-y-1 px-1'>
              <div className='flex items-center gap-2 text-muted-foreground text-sm'>
                <Clock className='h-3.5 w-3.5' />
                <span>{selectedModule.duracaoEstimada || 0} min</span>
              </div>
              <h2 className='text-lg font-semibold text-foreground'>
                {splitSectionAndLessonTitle(selectedModule.titulo).lesson}
              </h2>
              {selectedModule.descricao && (
                <p className='text-sm text-muted-foreground mt-1'>
                  {selectedModule.descricao}
                </p>
              )}
            </div>
          )}

          {/* Navigation Row */}
          {selectedModule && (
            <div className='flex items-center justify-between border-t border-border pt-4 px-1'>
              <Button
                variant='ghost'
                size='sm'
                disabled={isFirstLesson}
                onClick={goToPrevModule}
                className='gap-1'
              >
                <ChevronLeft className='h-4 w-4' />
                Anterior
              </Button>

              {inscricaoAtual && (
                <Button
                  onClick={() => void handleMarkAsCompleted(selectedModule)}
                  disabled={
                    hasCompletedSelected ||
                    markingCompleteId === selectedModule.id
                  }
                  className={
                    hasCompletedSelected
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200 shadow-none'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                  }
                  size='sm'
                >
                  {markingCompleteId === selectedModule.id ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin mr-1.5' />
                      Salvando...
                    </>
                  ) : hasCompletedSelected ? (
                    <>
                      <CheckCircle2 className='h-4 w-4 mr-1.5' />
                      Concluído
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className='h-4 w-4 mr-1.5' />
                      Marcar como Concluído
                    </>
                  )}
                </Button>
              )}

              <Button
                variant='ghost'
                size='sm'
                disabled={isLastLesson}
                onClick={goToNextModule}
                className='gap-1'
              >
                {isLastLesson ? 'Fim' : 'Próxima'}
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          )}
        </div>

        {/* ========== RIGHT: Sidebar ========== */}
        <div className='space-y-4'>
          {/* Progress Card */}
          <Card className='overflow-hidden'>
            <div className='bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 pb-3'>
              <h3 className='font-bold text-foreground'>Progresso do Curso</h3>
              <p className='text-xs text-muted-foreground'>
                {completedModuleIds.size} de {sortedModules.length} aulas
              </p>
            </div>
            <CardContent className='px-4 pb-4 pt-0 space-y-2'>
              <div className='flex items-center justify-between'>
                <Progress value={progressPercent} className='flex-1 h-2' />
                <span className='text-sm font-bold text-primary ml-3'>
                  {progressPercent}%
                </span>
              </div>
              {progressPercent >= 100 && (
                <div className='flex flex-col gap-3 mt-1'>
                  <div className='flex items-center gap-2 text-emerald-600 text-sm font-medium'>
                    <Trophy className='h-4 w-4' />
                    Curso concluído! 🎉
                  </div>

                  {inscricaoAtual &&
                  !inscricaoAtual.certificadoEmitido &&
                  selectedModule ? (
                    <Button
                      size='sm'
                      onClick={() => void handleMarkAsCompleted(selectedModule)}
                      className='w-full bg-blue-600 hover:bg-blue-700 text-white'
                    >
                      <Trophy className='h-4 w-4 mr-2' />
                      Gerar Certificado
                    </Button>
                  ) : (
                    <Link href='/dashboard/certificados'>
                      <Button
                        size='sm'
                        className='w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
                      >
                        <Trophy className='h-4 w-4 mr-2' />
                        Ver Certificado
                      </Button>
                    </Link>
                  )}

                  {/* Update Resume with AI */}
                  {inscricaoAtual && course && (
                    <Button
                      size='sm'
                      variant={skillsStatus === 'done' ? 'outline' : 'default'}
                      disabled={
                        skillsStatus === 'loading-model' ||
                        skillsStatus === 'analyzing' ||
                        skillsStatus === 'saving'
                      }
                      onClick={() => {
                        const moduleNames = sortedModules.map((m) => m.titulo);
                        updateSkillsFromCourse(
                          inscricaoAtual.candidatoId,
                          course.titulo,
                          course.descricao || '',
                          moduleNames,
                        );
                      }}
                      className={`w-full ${
                        skillsStatus === 'done'
                          ? 'border-purple-200 text-purple-700 hover:bg-purple-50'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20'
                      }`}
                    >
                      {skillsStatus === 'loading-model' ||
                      skillsStatus === 'analyzing' ||
                      skillsStatus === 'saving' ? (
                        <>
                          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                          {skillsProgress}
                        </>
                      ) : skillsStatus === 'done' ? (
                        <>
                          <CheckCircle2 className='h-4 w-4 mr-2' />
                          Currículo Atualizado!
                        </>
                      ) : (
                        <>
                          <Sparkles className='h-4 w-4 mr-2' />
                          Atualizar Currículo com IA
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Module List */}
          <Card className='overflow-hidden'>
            <CardContent className='p-0'>
              {loadingModules ? (
                <div className='flex items-center gap-2 text-muted-foreground text-sm p-4'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Carregando módulos...
                </div>
              ) : sortedModules.length === 0 ? (
                <div className='text-center py-8 px-4'>
                  <BookOpen className='h-10 w-10 text-muted-foreground/20 mx-auto mb-2' />
                  <p className='text-sm text-muted-foreground'>
                    Nenhum módulo disponível.
                  </p>
                </div>
              ) : (
                <ScrollArea className='max-h-[55vh]'>
                  <div className='divide-y divide-border'>
                    {groupedModules.map((group, gIdx) => (
                      <div key={group.section}>
                        {/* Section Header */}
                        <div className='px-4 py-2.5 bg-muted/40 border-b border-border'>
                          <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>
                            MÓDULO {gIdx + 1}
                          </p>
                          <p className='text-sm font-semibold text-foreground'>
                            {group.section}
                          </p>
                        </div>

                        {/* Lessons */}
                        <div>
                          {group.lessons.map((modulo) => {
                            const isSelected = modulo.id === selectedModule?.id;
                            const isCompleted = completedModuleIds.has(
                              modulo.id,
                            );
                            const lessonTitle = splitSectionAndLessonTitle(
                              modulo.titulo,
                            ).lesson;

                            return (
                              <button
                                key={modulo.id}
                                type='button'
                                onClick={() => setSelectedModuleId(modulo.id)}
                                className={`w-full text-left flex items-center gap-3 px-4 py-3 text-sm transition-all relative ${
                                  isSelected
                                    ? 'bg-primary/5'
                                    : 'hover:bg-muted/50'
                                }`}
                              >
                                {/* Active indicator bar */}
                                {isSelected && (
                                  <div className='absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-primary' />
                                )}

                                {/* Status circle */}
                                <div
                                  className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                    isCompleted
                                      ? 'bg-emerald-500 text-white'
                                      : isSelected
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className='h-3.5 w-3.5' />
                                  ) : (
                                    <span className='text-[10px] font-bold'>
                                      {modulo.ordem}
                                    </span>
                                  )}
                                </div>

                                {/* Label */}
                                <div className='flex-1 min-w-0'>
                                  <p
                                    className={`font-medium leading-snug truncate ${
                                      isCompleted
                                        ? 'text-muted-foreground line-through'
                                        : isSelected
                                          ? 'text-primary'
                                          : 'text-foreground'
                                    }`}
                                  >
                                    {lessonTitle}
                                  </p>
                                  <span className='text-[11px] text-muted-foreground'>
                                    {modulo.duracaoEstimada || 0} min
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
