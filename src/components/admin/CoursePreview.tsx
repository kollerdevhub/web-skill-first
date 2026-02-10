import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { ScrollArea } from '@/components/ui/scroll-area';
import {
  PlayCircle,
  FileText,
  CheckCircle2,
  Lock,
  Download,
  Clock,
  ChevronRight,
  MonitorPlay,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { CreateModuloDTO, Curso, Modulo, TipoConteudo } from '@/lib/api/types';

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

interface CoursePreviewProps {
  course: Curso;
  modules: Modulo[];
}

export function CoursePreview({ course, modules }: CoursePreviewProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    modules[0]?.id || null,
  );

  const selectedModule = modules.find((m) => m.id === selectedModuleId);

  // Group modules by section
  const modulesBySection = useMemo(() => {
    const sections: Record<string, Modulo[]> = {};
    modules.forEach((mod) => {
      const { section } = splitSectionAndLessonTitle(mod.titulo);
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push(mod);
    });
    return sections;
  }, [modules]);

  const getIconForType = (type: TipoConteudo) => {
    switch (type) {
      case 'video':
        return <PlayCircle className='h-4 w-4' />;
      case 'texto':
        return <FileText className='h-4 w-4' />;
      default:
        return <FileText className='h-4 w-4' />;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' className='gap-2'>
          <MonitorPlay className='h-4 w-4' />
          Ver como Aluno
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-6xl h-[90vh] p-0 overflow-hidden flex flex-col bg-slate-50'>
        <DialogHeader className='p-4 border-b bg-white shrink-0'>
          <DialogTitle className='flex items-center gap-2'>
            <span className='bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full'>
              Modo Visualização
            </span>
            {course.titulo}
          </DialogTitle>
        </DialogHeader>

        <div className='flex-1 flex overflow-hidden'>
          {/* Main Content Area */}
          <div className='flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200'>
            <div className='max-w-4xl mx-auto space-y-6'>
              {/* Video Player / Content Viewer */}
              <div className='aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/10'>
                {selectedModule?.videoUrl ? (
                  <video
                    src={selectedModule.videoUrl}
                    controls
                    className='w-full h-full'
                    poster={course.thumbnailUrl || undefined}
                  />
                ) : selectedModule?.conteudoTexto ? (
                  <div className='w-full h-full bg-white p-8 overflow-auto prose prose-slate max-w-none'>
                    <h3 className='text-xl font-bold mb-4'>
                      {splitSectionAndLessonTitle(selectedModule.titulo).lesson}
                    </h3>
                    <div className='whitespace-pre-wrap'>
                      {selectedModule.conteudoTexto}
                    </div>
                  </div>
                ) : (
                  <div className='w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400'>
                    <PlayCircle className='h-16 w-16 mb-4 opacity-50' />
                    <p>Selecione uma aula para visualizar</p>
                  </div>
                )}
              </div>

              {/* Lesson Details */}
              <div className='space-y-4'>
                <div className='flex items-start justify-between'>
                  <div>
                    <h2 className='text-xl font-bold text-slate-900'>
                      {selectedModule
                        ? splitSectionAndLessonTitle(selectedModule.titulo)
                            .lesson
                        : 'Selecione uma aula'}
                    </h2>
                    <p className='text-slate-500 mt-1'>
                      {selectedModule?.descricao || course.descricao}
                    </p>
                  </div>
                  {selectedModule && (
                    <Button className='shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white'>
                      <CheckCircle2 className='h-4 w-4 mr-2' />
                      Marcar como Concluído
                    </Button>
                  )}
                </div>

                {/* Attachments */}
                {(selectedModule?.attachments?.length || 0) > 0 && (
                  <Card>
                    <CardHeader className='py-3'>
                      <CardTitle className='text-sm font-medium flex items-center gap-2'>
                        <Download className='h-4 w-4' /> Materiais de Apoio
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='py-0 pb-3'>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                        {selectedModule?.attachments?.map((att, i) => (
                          <div
                            key={i}
                            className='flex items-center p-2 rounded-md border bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer'
                          >
                            <FileText className='h-4 w-4 text-blue-500 mr-2' />
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm font-medium truncate'>
                                {att.name}
                              </p>
                              <span className='text-xs text-slate-400 uppercase'>
                                {att.type}
                              </span>
                            </div>
                            <Download className='h-3 w-3 text-slate-400' />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Playlist */}
          <div className='w-80 bg-white border-l shrink-0 flex flex-col'>
            <div className='p-4 border-b bg-slate-50'>
              <h3 className='font-semibold text-slate-900'>
                Conteúdo do Curso
              </h3>
              <div className='flex items-center gap-2 text-xs text-slate-500 mt-1'>
                <Clock className='h-3 w-3' />
                <span>{course.cargaHoraria}h total</span>
                <span>•</span>
                <span>{modules.length} aulas</span>
              </div>
            </div>

            <ScrollArea className='flex-1'>
              <div className='p-4 space-y-4'>
                {Object.entries(modulesBySection).map(
                  ([sectionTitle, lessons], idx) => (
                    <div key={idx} className='space-y-2'>
                      <h4 className='text-xs font-bold text-slate-900 uppercase tracking-wider px-2'>
                        {sectionTitle}
                      </h4>
                      <div className='space-y-1'>
                        {lessons.map((module) => {
                          const { lesson } = splitSectionAndLessonTitle(
                            module.titulo,
                          );
                          return (
                            <button
                              key={module.id}
                              onClick={() => setSelectedModuleId(module.id)}
                              className={`w-full flex items-start text-left gap-3 p-2 rounded-lg text-sm transition-all ${
                                selectedModuleId === module.id
                                  ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                  : 'hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              <div
                                className={`mt-0.5 shrink-0 ${selectedModuleId === module.id ? 'text-blue-600' : 'text-slate-400'}`}
                              >
                                {getIconForType(module.tipoConteudo)}
                              </div>
                              <div className='min-w-0'>
                                <p className='font-medium leading-snug'>
                                  {lesson}
                                </p>
                                <p className='text-xs opacity-70 mt-0.5'>
                                  {module.duracaoEstimada} min
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
