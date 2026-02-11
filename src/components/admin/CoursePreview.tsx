'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  PlayCircle,
  Volume2,
} from 'lucide-react';
import { Curso, Modulo } from '@/lib/api/types';

interface CoursePreviewProps {
  course: Curso;
  modules: Modulo[];
}

function splitTitle(title: string) {
  const parts = title.split('::').map((p) => p.trim());
  if (parts.length >= 2 && parts[0]) {
    return { section: parts[0], lesson: parts.slice(1).join(' :: ').trim() };
  }
  return { section: 'Geral', lesson: title };
}

export function CoursePreview({ course, modules }: CoursePreviewProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [simProgress, setSimProgress] = useState(0);

  const sorted = useMemo(
    () => [...modules].sort((a, b) => a.ordem - b.ordem),
    [modules],
  );

  const grouped = useMemo(() => {
    const groups: Array<{ section: string; lessons: Modulo[] }> = [];
    const map = new Map<string, Modulo[]>();

    for (const m of sorted) {
      const { section } = splitTitle(m.titulo);
      const list = map.get(section) || [];
      list.push(m);
      map.set(section, list);
    }

    for (const [section, lessons] of map.entries()) {
      groups.push({ section, lessons });
    }

    groups.sort((a, b) => {
      const aIdx = sorted.findIndex(
        (m) => splitTitle(m.titulo).section === a.section,
      );
      const bIdx = sorted.findIndex(
        (m) => splitTitle(m.titulo).section === b.section,
      );
      return aIdx - bIdx;
    });

    return groups;
  }, [sorted]);

  // Select first module when dialog opens
  useEffect(() => {
    if (open && sorted.length > 0 && !selectedId) {
      setSelectedId(sorted[0].id);
      setSimProgress(0);
    }
    if (!open) {
      setSelectedId(null);
      setSimProgress(0);
    }
  }, [open, sorted, selectedId]);

  const selected = useMemo(
    () => sorted.find((m) => m.id === selectedId) || sorted[0] || null,
    [selectedId, sorted],
  );

  const selectedIndex = selected
    ? sorted.findIndex((m) => m.id === selected.id)
    : -1;

  function goNext() {
    if (selectedIndex >= 0 && selectedIndex < sorted.length - 1) {
      const next = sorted[selectedIndex + 1];
      setSelectedId(next.id);
      setSimProgress(Math.round(((selectedIndex + 1) / sorted.length) * 100));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <Eye className='h-4 w-4 mr-2' />
          Ver como Aluno
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-[95vw] w-[1200px] max-h-[90vh] p-0 overflow-hidden'>
        <DialogHeader className='p-5 pb-0'>
          <DialogTitle className='text-lg font-bold'>
            {course.titulo}
            <span className='ml-2 text-xs font-normal text-muted-foreground'>
              — visão do aluno
            </span>
          </DialogTitle>
          <div className='flex gap-2 mt-2'>
            <Badge variant='secondary'>{course.categoria}</Badge>
            <Badge variant='outline'>
              <Clock className='h-3 w-3 mr-1' />
              {course.cargaHoraria}h
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        <div className='grid grid-cols-[1fr_300px] h-[70vh]'>
          {/* ===== LEFT: Video + Info ===== */}
          <div className='flex flex-col overflow-y-auto'>
            {/* Video Area */}
            <div className='aspect-video bg-black shrink-0'>
              {selected?.tipoConteudo === 'video' && selected.videoUrl ? (
                <video
                  key={selected.id}
                  src={selected.videoUrl}
                  controls
                  autoPlay
                  onEnded={goNext}
                  className='w-full h-full'
                />
              ) : selected?.tipoConteudo === 'texto' &&
                selected.conteudoTexto ? (
                <div className='w-full h-full overflow-auto p-8 bg-background'>
                  <div className='prose prose-sm max-w-none'>
                    <h3>{splitTitle(selected.titulo).lesson}</h3>
                    <div className='whitespace-pre-wrap'>
                      {selected.conteudoTexto}
                    </div>
                  </div>
                </div>
              ) : (
                <div className='w-full h-full flex flex-col items-center justify-center text-muted-foreground'>
                  <BookOpen className='h-12 w-12 mb-2 opacity-40' />
                  <p className='text-sm'>
                    {sorted.length === 0
                      ? 'Nenhuma aula cadastrada'
                      : 'Selecione uma aula'}
                  </p>
                </div>
              )}
            </div>

            {/* Lesson Info */}
            {selected && (
              <div className='p-5 space-y-4'>
                <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                  {splitTitle(selected.titulo).section}
                </p>
                <h2 className='text-xl font-bold text-foreground'>
                  {selected.ordem}. {splitTitle(selected.titulo).lesson}
                </h2>
                <div className='flex flex-wrap gap-2'>
                  <Badge variant='secondary'>
                    {selected.tipoConteudo === 'video' ? (
                      <Volume2 className='h-3 w-3 mr-1' />
                    ) : (
                      <FileText className='h-3 w-3 mr-1' />
                    )}
                    {selected.tipoConteudo}
                  </Badge>
                  <Badge variant='outline'>
                    <Clock className='h-3 w-3 mr-1' />
                    {selected.duracaoEstimada || 0} min
                  </Badge>
                </div>
                {selected.descricao && (
                  <p className='text-sm text-muted-foreground'>
                    {selected.descricao}
                  </p>
                )}
                <Separator />
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    onClick={goNext}
                    disabled={selectedIndex >= sorted.length - 1}
                  >
                    Próxima aula
                    <ChevronRight className='h-4 w-4 ml-1' />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ===== RIGHT: Sidebar ===== */}
          <div className='border-l flex flex-col bg-muted/30'>
            {/* Progress */}
            <div className='p-4 space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-semibold'>Progresso</span>
                <span className='text-sm font-bold text-primary'>
                  {simProgress}%
                </span>
              </div>
              <Progress value={simProgress} />
              <p className='text-xs text-muted-foreground'>
                {sorted.length} aulas • simulação
              </p>
            </div>

            <Separator />

            {/* Module List */}
            <ScrollArea className='flex-1'>
              <Accordion
                type='multiple'
                defaultValue={grouped.map((g) => g.section)}
                className='w-full'
              >
                {grouped.map((group) => (
                  <AccordionItem
                    key={group.section}
                    value={group.section}
                    className='border-b last:border-0'
                  >
                    <AccordionTrigger className='px-4 py-3 text-sm font-semibold hover:no-underline'>
                      <div className='flex items-center gap-2 flex-1'>
                        <span className='truncate'>{group.section}</span>
                        <Badge variant='secondary'>
                          {group.lessons.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='pb-0'>
                      <div className='space-y-0.5 px-2 pb-2'>
                        {group.lessons.map((modulo) => {
                          const isSelected = modulo.id === selected?.id;
                          const lessonTitle = splitTitle(modulo.titulo).lesson;

                          return (
                            <button
                              key={modulo.id}
                              type='button'
                              onClick={() => setSelectedId(modulo.id)}
                              className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg text-sm transition-all ${
                                isSelected
                                  ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                                  : 'hover:bg-muted text-foreground'
                              }`}
                            >
                              <div
                                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {modulo.ordem}
                              </div>
                              <div className='flex-1 min-w-0'>
                                <p className='font-medium leading-snug truncate'>
                                  {lessonTitle}
                                </p>
                                <span className='text-xs text-muted-foreground flex items-center gap-1 mt-0.5'>
                                  {modulo.tipoConteudo === 'video' ? (
                                    <PlayCircle className='h-3 w-3' />
                                  ) : (
                                    <FileText className='h-3 w-3' />
                                  )}
                                  {modulo.duracaoEstimada || 0}min
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
