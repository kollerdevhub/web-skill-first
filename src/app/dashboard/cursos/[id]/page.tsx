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
import { type Modulo, modulosService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  PlayCircle,
  Trophy,
} from 'lucide-react';

function splitSectionAndLessonTitle(title: string): {
  section: string;
  lesson: string;
} {
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
  const [markingCompleteId, setMarkingCompleteId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcriptText, setTranscriptText] = useState<string | null>(null);

  const {
    data: course,
    isLoading: loadingCourse,
    error: courseError,
  } = useCurso(courseId);
  const { data: inscricoes } = useMinhasInscricoes();
  const updateProgressMutation = useUpdateProgress();

  const { data: modulos, isLoading: loadingModules } = useQuery({
    queryKey: ['curso-modulos', courseId],
    queryFn: () => modulosService.list(courseId),
    enabled: !!courseId,
  });

  const inscricaoAtual = useMemo(
    () => (inscricoes || []).find((inscricao) => inscricao.cursoId === courseId),
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
      sortedModules.some((module) => module.id === selectedModuleId)
    ) {
      return;
    }

    const lastAccessed = inscricaoAtual?.ultimoModuloAcessado
      ? sortedModules.find(
          (module) => module.id === inscricaoAtual.ultimoModuloAcessado,
        )
      : null;

    setSelectedModuleId((lastAccessed || sortedModules[0]).id);
  }, [inscricaoAtual?.ultimoModuloAcessado, selectedModuleId, sortedModules]);

  const selectedModule = useMemo(
    () =>
      sortedModules.find((module) => module.id === selectedModuleId) ||
      sortedModules[0] ||
      null,
    [selectedModuleId, sortedModules],
  );

  const completedModuleIds = useMemo(() => {
    const progressList = inscricaoDetalhada?.modulosProgresso || [];
    return new Set(
      progressList.filter((item) => item.concluido).map((item) => item.moduloId),
    );
  }, [inscricaoDetalhada?.modulosProgresso]);

  const hasCompletedSelectedModule = selectedModule
    ? completedModuleIds.has(selectedModule.id)
    : false;

  useEffect(() => {
    setShowTranscript(false);
    setTranscriptText(null);
    const url = selectedModule?.transcriptUrl;
    if (!url) return;
    void (async () => {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const text = await res.text();
          setTranscriptText(text);
        }
      } catch {
        // ignore transcript fetch errors
      }
    })();
  }, [selectedModule?.transcriptUrl]);

  async function handlePlaySelectedModule() {
    setProgressMessage(null);
    setProgressError(null);

    if (selectedModule?.videoUrl && videoRef.current) {
      try {
        await videoRef.current.play();
      } catch {
        setProgressError('Não foi possível iniciar a reprodução automática do vídeo.');
      }
    }
  }

  async function handleMarkAsCompleted(modulo: Modulo) {
    if (!inscricaoAtual) {
      setProgressError('Você precisa estar inscrito para registrar progresso.');
      return;
    }

    setMarkingCompleteId(modulo.id);
    setProgressMessage(null);
    setProgressError(null);

    try {
      await updateProgressMutation.mutateAsync({
        id: inscricaoAtual.id,
        data: {
          moduloId: modulo.id,
          concluido: true,
          tempoAssistido: modulo.videoDuracao,
        },
      });
      setProgressMessage('Progresso atualizado com sucesso.');
    } catch (error) {
      setProgressError(
        error instanceof Error ? error.message : 'Erro ao atualizar progresso',
      );
    } finally {
      setMarkingCompleteId(null);
    }
  }

  function goToNextModule(currentId: string) {
    const currentIndex = sortedModules.findIndex((m) => m.id === currentId);
    if (currentIndex >= 0 && currentIndex < sortedModules.length - 1) {
      const next = sortedModules[currentIndex + 1];
      setSelectedModuleId(next.id);
      // autoplay next if video available
      setTimeout(() => {
        if (next.tipoConteudo === 'video' && next.videoUrl && videoRef.current) {
          videoRef.current.play().catch(() => undefined);
        }
      }, 200);
    }
  }

  if (loadingCourse) {
    return (
      <div className='flex items-center justify-center h-[45vh]'>
        <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className='space-y-4'>
        <Link href='/dashboard/cursos'>
          <Button variant='outline' className='border-slate-200'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Voltar para meus cursos
          </Button>
        </Link>
        <Card className='bg-red-50 border-red-200'>
          <CardContent className='p-6 flex items-center gap-2 text-red-700'>
            <AlertCircle className='h-5 w-5' />
            Não foi possível carregar os detalhes do curso.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <Link href='/dashboard/cursos'>
          <Button variant='outline' className='border-slate-200'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>{course.titulo}</h1>
          <p className='text-sm text-slate-500'>Detalhes e módulos do curso</p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <Card className='lg:col-span-2 bg-white border-slate-200 overflow-hidden shadow-sm'>
          <div className='aspect-video bg-slate-100'>
            {selectedModule?.tipoConteudo === 'video' && selectedModule.videoUrl ? (
              <video
                ref={videoRef}
                src={selectedModule.videoUrl}
                controls
                onEnded={() => {
                  void handleMarkAsCompleted(selectedModule);
                  goToNextModule(selectedModule.id);
                }}
                preload='metadata'
                className='w-full h-full bg-black'
              />
            ) : selectedModule?.tipoConteudo === 'texto' &&
              selectedModule.conteudoTexto ? (
              <div className='w-full h-full overflow-auto p-6 text-sm text-slate-700 whitespace-pre-wrap'>
                {selectedModule.conteudoTexto}
              </div>
            ) : course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.titulo}
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center'>
                <BookOpen className='h-12 w-12 text-slate-300' />
              </div>
            )}
          </div>

          <CardContent className='p-6 space-y-4'>
            {progressError && (
              <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
                {progressError}
              </div>
            )}
            {progressMessage && (
              <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700'>
                {progressMessage}
              </div>
            )}

            {selectedModule && (
              <div className='space-y-2'>
                <p className='text-xs font-medium text-slate-500'>
                  {splitSectionAndLessonTitle(selectedModule.titulo).section}
                </p>
                <h2 className='text-xl font-semibold text-slate-900'>
                  {selectedModule.ordem}.{' '}
                  {splitSectionAndLessonTitle(selectedModule.titulo).lesson}
                </h2>
                <div className='flex flex-wrap gap-2'>
                  <span className='px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs border border-blue-100'>
                    {selectedModule.tipoConteudo}
                  </span>
                  <span className='px-2 py-1 rounded-full bg-slate-50 text-slate-600 text-xs border border-slate-200'>
                    {selectedModule.duracaoEstimada || 0} min estimados
                  </span>
                  {selectedModule.obrigatorio && (
                    <span className='px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs border border-emerald-100'>
                      Obrigatório
                    </span>
                  )}
                </div>
                {selectedModule.descricao && (
                  <p className='text-sm text-slate-600'>{selectedModule.descricao}</p>
                )}

                <div className='flex flex-wrap gap-2 pt-1'>
                  <Button
                    type='button'
                    onClick={() => void handlePlaySelectedModule()}
                    disabled={
                      selectedModule.tipoConteudo !== 'video' ||
                      !selectedModule.videoUrl
                    }
                    className='bg-blue-600 hover:bg-blue-700'
                  >
                    <PlayCircle className='h-4 w-4 mr-2' />
                    Dar play
                  </Button>

                  {inscricaoAtual && (
                    <Button
                      type='button'
                      variant={hasCompletedSelectedModule ? 'outline' : 'default'}
                      onClick={() => void handleMarkAsCompleted(selectedModule)}
                      disabled={
                        hasCompletedSelectedModule ||
                        markingCompleteId === selectedModule.id ||
                        inscricaoAtual.status === 'concluido'
                      }
                      className={
                        hasCompletedSelectedModule
                          ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }
                    >
                      {markingCompleteId === selectedModule.id ? (
                        <>
                          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                          Salvando...
                        </>
                      ) : hasCompletedSelectedModule ? (
                        <>
                          <CheckCircle2 className='h-4 w-4 mr-2' />
                          Módulo concluído
                        </>
                      ) : (
                        <>
                          <Trophy className='h-4 w-4 mr-2' />
                          Marcar como concluído
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {selectedModule && (
              <div className='space-y-3 rounded-lg border border-slate-200 p-3'>
                <div className='flex flex-wrap gap-2 items-center text-sm'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setShowTranscript((v) => !v)}
                    disabled={!transcriptText}
                    className='border-slate-200 text-slate-600'
                  >
                    <FileText className='h-4 w-4 mr-2' />
                    {showTranscript ? 'Esconder transcrição' : 'Ver transcrição'}
                  </Button>
                  {selectedModule.subtitleUrl && (
                    <a
                      href={selectedModule.subtitleUrl}
                      target='_blank'
                      rel='noreferrer'
                      className='text-blue-600 text-sm hover:underline'
                    >
                      Baixar legenda
                    </a>
                  )}
                </div>
                {showTranscript && transcriptText && (
                  <div className='max-h-60 overflow-auto text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded'>
                    {transcriptText}
                  </div>
                )}

                <div className='space-y-2'>
                  <p className='text-xs font-semibold text-slate-700 flex items-center gap-1'>
                    <Download className='h-3.5 w-3.5' />
                    Downloads
                  </p>
                  <div className='space-y-1 text-xs'>
                    {(selectedModule.attachments || []).map((att, idx) => (
                      <a
                        key={`${att.url}-${idx}`}
                        href={att.url}
                        target='_blank'
                        rel='noreferrer'
                        className='flex items-center gap-2 text-blue-600 hover:underline break-all'
                      >
                        <FileText className='h-3.5 w-3.5' />
                        {att.name || 'arquivo'} ({att.type || 'file'})
                      </a>
                    ))}
                    {(course.attachments || []).map((att, idx) => (
                      <a
                        key={`course-${att.url}-${idx}`}
                        href={att.url}
                        target='_blank'
                        rel='noreferrer'
                        className='flex items-center gap-2 text-blue-600 hover:underline break-all'
                      >
                        <FileText className='h-3.5 w-3.5' />
                        {att.name || 'arquivo'} ({att.type || 'file'})
                      </a>
                    ))}
                    {(!selectedModule.attachments ||
                      selectedModule.attachments.length === 0) &&
                    (!course.attachments || course.attachments.length === 0) ? (
                      <p className='text-slate-500'>Nenhum download disponível.</p>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            <p className='text-slate-600 leading-relaxed'>{course.descricao}</p>
            <div className='flex items-center gap-3 text-sm text-slate-500'>
              <span className='px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100'>
                {course.categoria}
              </span>
              <span className='flex items-center gap-1'>
                <Clock className='h-4 w-4' />
                {course.cargaHoraria}h
              </span>
            </div>

            {inscricaoAtual && (
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-slate-500'>Progresso</span>
                  <span className='text-blue-600 font-medium'>
                    {inscricaoAtual.progressoPercentual}%
                  </span>
                </div>
                <div className='h-2 bg-slate-100 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-gradient-to-r from-blue-500 to-blue-600'
                    style={{ width: `${inscricaoAtual.progressoPercentual}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-slate-900'>Trilha de módulos</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingModules ? (
              <div className='flex items-center gap-2 text-slate-500 text-sm'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Carregando módulos...
              </div>
            ) : sortedModules.length > 0 ? (
              <div className='space-y-3'>
                {groupedModules.map((group) => (
                  <details
                    key={group.section}
                    className='rounded-lg border border-slate-200 bg-slate-50'
                    open
                  >
                    <summary className='cursor-pointer select-none px-3 py-2 text-sm font-semibold text-slate-800'>
                      {group.section}{' '}
                      <span className='text-xs font-normal text-slate-500'>
                        ({group.lessons.length} aulas)
                      </span>
                    </summary>
                    <div className='space-y-2 p-3 pt-1'>
                      {group.lessons.map((modulo) => {
                        const isSelected = modulo.id === selectedModule?.id;
                        const isCompleted = completedModuleIds.has(modulo.id);
                        const lessonTitle = splitSectionAndLessonTitle(
                          modulo.titulo,
                        ).lesson;
                        return (
                          <button
                            key={modulo.id}
                            type='button'
                            onClick={() => setSelectedModuleId(modulo.id)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              isSelected
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-white border-slate-200 hover:border-blue-200'
                            }`}
                          >
                            <p className='text-sm font-medium text-slate-800'>
                              {modulo.ordem}. {lessonTitle}
                            </p>
                            <div className='mt-2 flex items-center gap-3 text-xs text-slate-500'>
                              <span className='flex items-center gap-1'>
                                <PlayCircle className='h-3.5 w-3.5' />
                                {modulo.tipoConteudo}
                              </span>
                              {modulo.obrigatorio && (
                                <span className='flex items-center gap-1 text-emerald-700'>
                                  <CheckCircle2 className='h-3.5 w-3.5' />
                                  Obrigatório
                                </span>
                              )}
                              {isCompleted && (
                                <span className='flex items-center gap-1 text-blue-700'>
                                  <Trophy className='h-3.5 w-3.5' />
                                  Concluído
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <p className='text-sm text-slate-500'>
                Este curso ainda não possui módulos cadastrados.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
