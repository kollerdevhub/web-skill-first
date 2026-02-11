'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  useCurso,
  useInscricao,
  useMinhasInscricoes,
  useTouchInscricaoAccess,
  useUpdateProgress,
} from '@/hooks';
import { useResumeSkillsUpdater } from '@/hooks/useResumeSkillsUpdater';
import { type Modulo, modulosService } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
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

function splitSectionAndLessonTitle(title: string) {
  const parts = title.split('::').map((p) => p.trim());
  if (parts.length >= 2 && parts[0]) {
    return { section: parts[0], lesson: parts.slice(1).join(' :: ').trim() };
  }
  return { section: 'Geral', lesson: title };
}

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
  const lastTouchedAccessRef = useRef<string | null>(null);

  const {
    data: course,
    isLoading: loadingCourse,
    error: courseError,
  } = useCurso(courseId);
  const { data: inscricoes } = useMinhasInscricoes();
  const updateProgressMutation = useUpdateProgress();
  const { mutate: touchInscricaoAccess } = useTouchInscricaoAccess();
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

  useEffect(() => {
    if (!inscricaoAtual?.id || !selectedModule?.id) return;
    const accessKey = `${inscricaoAtual.id}:${selectedModule.id}`;
    if (lastTouchedAccessRef.current === accessKey) return;
    lastTouchedAccessRef.current = accessKey;
    touchInscricaoAccess({
      id: inscricaoAtual.id,
      moduloId: selectedModule.id,
    });
  }, [inscricaoAtual?.id, selectedModule?.id, touchInscricaoAccess]);

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
  const selectedLessonNumber = selectedIndex >= 0 ? selectedIndex + 1 : 0;
  const totalLessons = sortedModules.length;
  const completedLessons = completedModuleIds.size;
  const remainingLessons = Math.max(totalLessons - completedLessons, 0);
  const progressRounded = Math.round(progressPercent);

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

      const newCompletedCount = (result.modulosProgresso || []).filter(
        (m) => m.concluido,
      ).length;
      const totalModules = sortedModules.length;
      const isNowCompleted =
        totalModules > 0 && newCompletedCount >= totalModules;

      if (isNowCompleted && course) {
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

  return (
    <div className='space-y-6 pb-10'>
      <Card className='overflow-hidden border-border/70 bg-gradient-to-br from-background via-background to-primary/5 shadow-sm'>
        <CardHeader className='space-y-5'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <Link href='/dashboard/cursos'>
              <Button variant='outline' size='sm'>
                <ArrowLeft className='h-4 w-4 mr-1.5' />
                Voltar para cursos
              </Button>
            </Link>

            <div className='flex flex-wrap items-center gap-2'>
              <Badge variant='secondary' className='capitalize'>
                {course.categoria}
              </Badge>
              <Badge variant='outline' className='capitalize'>
                {course.nivel}
              </Badge>
              <Badge variant='outline'>
                <Clock className='h-3.5 w-3.5 mr-1' />
                {course.cargaHoraria}h
              </Badge>
            </div>
          </div>

          <div className='grid gap-4 lg:grid-cols-[1fr_280px] lg:items-end'>
            <div className='space-y-2'>
              <CardTitle className='text-2xl md:text-3xl'>
                {course.titulo}
              </CardTitle>
              <CardDescription className='text-sm leading-relaxed'>
                {course.descricao ||
                  'Continue seu aprendizado no seu ritmo e acompanhe o progresso por aula.'}
              </CardDescription>
            </div>

            <div className='rounded-lg border border-border/70 bg-card p-4 space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='font-medium text-muted-foreground'>
                  Progresso
                </span>
                <span className='font-semibold text-primary'>
                  {progressRounded}%
                </span>
              </div>
              <Progress value={progressPercent} className='h-2.5' />
              <div className='flex items-center justify-between text-xs text-muted-foreground'>
                <span>{completedLessons} concluídas</span>
                <span>{remainingLessons} restantes</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {progressError && (
        <Card className='border-destructive/30 bg-destructive/10 shadow-none'>
          <CardContent className='p-4 flex items-start gap-2 text-sm text-destructive'>
            <AlertCircle className='h-4 w-4 mt-0.5 shrink-0' />
            {progressError}
          </CardContent>
        </Card>
      )}

      {progressMessage && (
        <Card className='border-emerald-200 bg-emerald-50 shadow-none'>
          <CardContent className='p-4 flex items-start gap-2 text-sm text-emerald-700'>
            <CheckCircle2 className='h-4 w-4 mt-0.5 shrink-0' />
            {progressMessage}
          </CardContent>
        </Card>
      )}

      {skillsStatus !== 'idle' && (
        <Card
          className={cn(
            'shadow-none',
            skillsStatus === 'done'
              ? 'border-purple-200 bg-purple-50'
              : skillsStatus === 'error'
                ? 'border-red-200 bg-red-50'
                : 'border-blue-200 bg-blue-50',
          )}
        >
          <CardContent
            className={cn(
              'p-4 text-sm flex items-center gap-2',
              skillsStatus === 'done'
                ? 'text-purple-700'
                : skillsStatus === 'error'
                  ? 'text-red-700'
                  : 'text-blue-700',
            )}
          >
            {skillsStatus === 'done' ? (
              <Sparkles className='h-4 w-4 shrink-0' />
            ) : skillsStatus === 'error' ? (
              <AlertCircle className='h-4 w-4 shrink-0' />
            ) : (
              <Loader2 className='h-4 w-4 shrink-0 animate-spin' />
            )}
            {skillsProgress}
          </CardContent>
        </Card>
      )}

      <div className='grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]'>
        <div className='space-y-5'>
          <Card className='overflow-hidden border-border/70 shadow-sm'>
            <CardContent className='p-0'>
              <div className='aspect-video bg-black overflow-hidden'>
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

              {selectedModule && (
                <div className='space-y-4 p-5'>
                  <div className='flex flex-wrap items-start justify-between gap-3'>
                    <div className='space-y-1.5'>
                      <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                        <span className='font-semibold uppercase tracking-wide'>
                          Aula {selectedLessonNumber} de {totalLessons || 1}
                        </span>
                        <span className='text-muted-foreground/60'>•</span>
                        <span>
                          {splitSectionAndLessonTitle(selectedModule.titulo).section}
                        </span>
                      </div>

                      <h2 className='text-xl font-semibold text-foreground'>
                        {splitSectionAndLessonTitle(selectedModule.titulo).lesson}
                      </h2>

                      {selectedModule.descricao && (
                        <p className='text-sm text-muted-foreground leading-relaxed'>
                          {selectedModule.descricao}
                        </p>
                      )}
                    </div>

                    <div className='flex flex-wrap items-center gap-2'>
                      <Badge variant='outline' className='capitalize'>
                        {selectedModule.tipoConteudo}
                      </Badge>
                      <Badge variant='secondary'>
                        <Clock className='h-3.5 w-3.5 mr-1.5' />
                        {selectedModule.duracaoEstimada || 0} min
                      </Badge>
                      {hasCompletedSelected ? (
                        <Badge className='bg-emerald-600 text-white hover:bg-emerald-600'>
                          <CheckCircle2 className='h-3.5 w-3.5 mr-1.5' />
                          Concluída
                        </Badge>
                      ) : (
                        <Badge variant='outline'>Pendente</Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={isFirstLesson}
                        onClick={goToPrevModule}
                        className='gap-1'
                      >
                        <ChevronLeft className='h-4 w-4' />
                        Anterior
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        disabled={isLastLesson}
                        onClick={goToNextModule}
                        className='gap-1'
                      >
                        {isLastLesson ? 'Fim da trilha' : 'Próxima'}
                        <ChevronRight className='h-4 w-4' />
                      </Button>
                    </div>

                    {inscricaoAtual && (
                      <Button
                        onClick={() => void handleMarkAsCompleted(selectedModule)}
                        disabled={
                          hasCompletedSelected ||
                          markingCompleteId === selectedModule.id
                        }
                        className={cn(
                          'min-w-[220px]',
                          hasCompletedSelected
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200 shadow-none'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20',
                        )}
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
                            Aula concluída
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className='h-4 w-4 mr-1.5' />
                            Marcar aula como concluída
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className='space-y-4 xl:sticky xl:top-6 xl:self-start'>
          <Card className='border-border/70 shadow-sm'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>Resumo da jornada</CardTitle>
              <CardDescription>
                {completedLessons} de {totalLessons} aulas concluídas
              </CardDescription>
            </CardHeader>

            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Andamento geral</span>
                  <span className='font-semibold text-primary'>
                    {progressRounded}%
                  </span>
                </div>
                <Progress value={progressPercent} className='h-2.5' />
              </div>

              <div className='grid grid-cols-3 gap-2'>
                <div className='rounded-md border border-border/70 bg-muted/30 px-2 py-2 text-center'>
                  <p className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                    Total
                  </p>
                  <p className='text-sm font-semibold'>{totalLessons}</p>
                </div>
                <div className='rounded-md border border-emerald-200 bg-emerald-50 px-2 py-2 text-center'>
                  <p className='text-[10px] uppercase tracking-wide text-emerald-700/70'>
                    Feitas
                  </p>
                  <p className='text-sm font-semibold text-emerald-700'>
                    {completedLessons}
                  </p>
                </div>
                <div className='rounded-md border border-amber-200 bg-amber-50 px-2 py-2 text-center'>
                  <p className='text-[10px] uppercase tracking-wide text-amber-700/70'>
                    Restam
                  </p>
                  <p className='text-sm font-semibold text-amber-700'>
                    {remainingLessons}
                  </p>
                </div>
              </div>

              {selectedModule && (
                <div className='rounded-md border border-border/70 bg-muted/20 px-3 py-2.5'>
                  <p className='text-xs text-muted-foreground mb-1'>
                    Aula atual
                  </p>
                  <p className='text-sm font-medium leading-snug'>
                    {splitSectionAndLessonTitle(selectedModule.titulo).lesson}
                  </p>
                </div>
              )}

              {progressPercent >= 100 && (
                <div className='space-y-3'>
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

          <Card className='overflow-hidden border-border/70 shadow-sm'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>Trilha de aulas</CardTitle>
              <CardDescription>
                Escolha uma aula para continuar o curso.
              </CardDescription>
            </CardHeader>
            <Separator />
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
                <ScrollArea className='max-h-[60vh]'>
                  <div className='divide-y divide-border'>
                    {groupedModules.map((group, gIdx) => (
                      <div key={group.section}>
                        <div className='px-4 py-2.5 bg-muted/40 border-b border-border'>
                          <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>
                            MÓDULO {gIdx + 1}
                          </p>
                          <p className='text-sm font-semibold text-foreground'>
                            {group.section}
                          </p>
                        </div>

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
                                className={cn(
                                  'w-full text-left flex items-start gap-3 px-4 py-3 text-sm transition-colors relative border-l-2',
                                  isSelected
                                    ? 'bg-primary/5 border-l-primary'
                                    : 'hover:bg-muted/50 border-l-transparent',
                                )}
                              >
                                <div
                                  className={cn(
                                    'mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                                    isCompleted
                                      ? 'bg-emerald-500 text-white'
                                      : isSelected
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground',
                                  )}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className='h-3.5 w-3.5' />
                                  ) : (
                                    <span className='text-[10px] font-bold'>
                                      {modulo.ordem}
                                    </span>
                                  )}
                                </div>

                                <div className='flex-1 min-w-0'>
                                  <p
                                    className={cn(
                                      'font-medium leading-snug',
                                      isCompleted
                                        ? 'text-muted-foreground line-through'
                                        : isSelected
                                          ? 'text-primary'
                                          : 'text-foreground',
                                    )}
                                  >
                                    {lessonTitle}
                                  </p>
                                  <div className='mt-0.5 flex items-center justify-between gap-2'>
                                    <span className='text-[11px] text-muted-foreground'>
                                      {modulo.duracaoEstimada || 0} min
                                    </span>
                                    {isSelected && (
                                      <span className='text-[10px] font-semibold uppercase tracking-wide text-primary'>
                                        Atual
                                      </span>
                                    )}
                                  </div>
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
