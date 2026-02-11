'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { cursosService } from '@/lib/api/services/cursos.service';
import { modulosService } from '@/lib/api/services/modulos.service';
import {
  CreateCursoDTO,
  CursoCategoria,
  CursoNivel,
  CreateModuloDTO,
} from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  courseSchema,
  type CourseFormValues,
} from '@/lib/validations/course-schemas';

// ============================================================================
// Types
// ============================================================================

interface LessonDraft {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  supplementary: string;
}

interface ModuleDraft {
  id: string;
  title: string;
  lessons: LessonDraft[];
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className='text-xs text-destructive mt-1'>{message}</p>;
}

// ============================================================================
// Page Component
// ============================================================================

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);

  // -- Form (react-hook-form + zod) --
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      categoria: 'tecnico',
      nivel: 'basico',
      cargaHoraria: 0,
      slug: '',
      language: 'pt-BR',
      tags: [],
      status: 'draft',
    },
  });

  const courseValues = watch();

  // -- Thumbnail --
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // -- Modules --
  const [modules, setModules] = useState<ModuleDraft[]>([]);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);

  // -- Lesson dialog --
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: 0,
    supplementary: '',
  });

  // -- Instructor name --
  const [instructorName, setInstructorName] = useState('');

  // -- Actions --
  const handleThumbnailChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setThumbnailFile(file);
    setThumbnailPreview(url);
  };

  const handleAddModule = () => {
    const title = newModuleTitle.trim();
    if (!title) return;
    setModules((prev) => [
      ...prev,
      { id: `mod-${Date.now()}`, title, lessons: [] },
    ]);
    setNewModuleTitle('');
    setActiveModuleIdx(modules.length); // jump to the new module
  };

  const handleRemoveModule = (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
    setActiveModuleIdx((prev) => Math.max(0, prev - 1));
  };

  const handleOpenLessonDialog = () => {
    setLessonForm({
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      supplementary: '',
    });
    setLessonDialogOpen(true);
  };

  const handleCreateLesson = () => {
    if (!lessonForm.title.trim()) return;

    const newLesson: LessonDraft = {
      id: `less-${Date.now()}`,
      title: lessonForm.title,
      description: lessonForm.description,
      videoUrl: lessonForm.videoUrl,
      duration: lessonForm.duration,
      supplementary: lessonForm.supplementary,
    };

    setModules((prev) =>
      prev.map((m, idx) =>
        idx === activeModuleIdx
          ? { ...m, lessons: [...m.lessons, newLesson] }
          : m,
      ),
    );
    setLessonDialogOpen(false);
  };

  const handleRemoveLesson = (moduleIdx: number, lessonId: string) => {
    setModules((prev) =>
      prev.map((m, idx) =>
        idx === moduleIdx
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m,
      ),
    );
  };

  const handleCreateCourse = async () => {
    const valid = await trigger([
      'titulo',
      'descricao',
      'categoria',
      'nivel',
      'cargaHoraria',
    ]);
    if (!valid) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Corrija os erros antes de continuar.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const payload: CreateCursoDTO = {
        titulo: courseValues.titulo,
        descricao: courseValues.descricao,
        categoria: courseValues.categoria,
        nivel: courseValues.nivel,
        cargaHoraria: courseValues.cargaHoraria,
        ...(courseValues.slug ? { slug: courseValues.slug } : {}),
        status: courseValues.status || 'draft',
        language: courseValues.language || null,
        habilidadesDesenvolvidas: courseValues.tags || [],
      };

      let id = createdCourseId;
      if (!id) {
        const created = await cursosService.create(payload);
        id = created.id;
        setCreatedCourseId(id);
      } else {
        await cursosService.update(id, payload);
      }

      if (thumbnailFile) {
        await cursosService.uploadThumbnail(id, thumbnailFile);
        setThumbnailFile(null);
      }

      // Create modules and lessons
      let globalOrder = 1;
      for (const mod of modules) {
        for (const lesson of mod.lessons) {
          const modulePayload: CreateModuloDTO = {
            titulo: `${mod.title} :: ${lesson.title}`,
            ordem: globalOrder++,
            tipoConteudo: lesson.videoUrl ? 'video' : 'texto',
            duracaoEstimada: lesson.duration,
            obrigatorio: true,
            ...(lesson.videoUrl ? { videoUrl: lesson.videoUrl } : {}),
            ...(lesson.supplementary
              ? { conteudoTexto: lesson.supplementary }
              : {}),
          };
          await modulosService.create(id, modulePayload);
        }
      }

      toast({
        title: 'Curso criado!',
        description: 'O curso foi criado com sucesso.',
      });
      router.push(`/admin/cursos/${id}?created=1`);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erro ao criar curso',
        description: 'Não foi possível criar o curso. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const activeModule = modules[activeModuleIdx] || null;
  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <div className='max-w-3xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => router.push('/admin/cursos')}
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <h1 className='text-2xl font-bold text-foreground'>Novo Curso</h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='details'>
        <TabsList className='w-full'>
          <TabsTrigger value='details' className='flex-1'>
            <BookOpen className='h-4 w-4 mr-2' />
            Detalhes do Curso
          </TabsTrigger>
          <TabsTrigger value='modules' className='flex-1'>
            <GripVertical className='h-4 w-4 mr-2' />
            Módulos e Aulas
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: Details ===== */}
        <TabsContent value='details'>
          <Card>
            <CardContent className='p-6 space-y-6'>
              <div>
                <h2 className='text-xl font-bold text-foreground'>
                  Novo Curso
                </h2>
                <p className='text-sm text-muted-foreground'>
                  Preencha os dados para criar um novo curso
                </p>
              </div>

              {/* Cover Image */}
              <div className='space-y-2'>
                <Label>Capa do Curso</Label>
                <div className='relative aspect-[16/7] rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer'>
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      className='w-full h-full object-cover'
                      alt='Capa do curso'
                    />
                  ) : (
                    <div className='absolute inset-0 flex flex-col items-center justify-center text-muted-foreground'>
                      <ImageIcon className='h-10 w-10 mb-2 opacity-40' />
                      <span className='text-sm'>
                        Clique para adicionar uma capa
                      </span>
                    </div>
                  )}
                  <input
                    type='file'
                    className='absolute inset-0 opacity-0 cursor-pointer'
                    accept='image/*'
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleThumbnailChange(e.target.files[0])
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Title */}
              <div className='space-y-2'>
                <Label htmlFor='titulo'>Título do Curso *</Label>
                <Input
                  id='titulo'
                  placeholder='Ex: Intro Kubernetes'
                  {...register('titulo')}
                  className={cn(
                    errors.titulo &&
                      'border-destructive focus-visible:ring-destructive',
                  )}
                />
                <FieldError message={errors.titulo?.message} />
              </div>

              {/* Description */}
              <div className='space-y-2'>
                <Label htmlFor='descricao'>Descrição *</Label>
                <Textarea
                  id='descricao'
                  placeholder='Descreva o que os alunos irão aprender...'
                  className={cn(
                    'min-h-[100px]',
                    errors.descricao &&
                      'border-destructive focus-visible:ring-destructive',
                  )}
                  {...register('descricao')}
                />
                <FieldError message={errors.descricao?.message} />
              </div>

              {/* Category + Status */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Categoria *</Label>
                  <Select
                    value={courseValues.categoria}
                    onValueChange={(v) =>
                      setValue('categoria', v as CursoCategoria, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger
                      className={cn(errors.categoria && 'border-destructive')}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='tecnico'>Técnico</SelectItem>
                      <SelectItem value='gestao'>Gestão</SelectItem>
                      <SelectItem value='comportamental'>
                        Comportamental
                      </SelectItem>
                      <SelectItem value='idiomas'>Idiomas</SelectItem>
                      <SelectItem value='outros'>Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.categoria?.message} />
                </div>

                <div className='space-y-2'>
                  <Label>Status</Label>
                  <Select
                    value={courseValues.status || 'draft'}
                    onValueChange={(v) =>
                      setValue('status', v as 'draft' | 'published')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='draft'>Rascunho</SelectItem>
                      <SelectItem value='published'>Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Duration + Instructor */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='cargaHoraria'>Duração (horas)</Label>
                  <Input
                    id='cargaHoraria'
                    type='number'
                    placeholder='12'
                    {...register('cargaHoraria', { valueAsNumber: true })}
                    className={cn(
                      errors.cargaHoraria &&
                        'border-destructive focus-visible:ring-destructive',
                    )}
                  />
                  <FieldError message={errors.cargaHoraria?.message} />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='instructor'>Nome do Instrutor</Label>
                  <Input
                    id='instructor'
                    placeholder='Nome do instrutor'
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                  />
                </div>
              </div>

              {/* Level */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Nível *</Label>
                  <Select
                    value={courseValues.nivel}
                    onValueChange={(v) =>
                      setValue('nivel', v as CursoNivel, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger
                      className={cn(errors.nivel && 'border-destructive')}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='basico'>Básico</SelectItem>
                      <SelectItem value='intermediario'>
                        Intermediário
                      </SelectItem>
                      <SelectItem value='avancado'>Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.nivel?.message} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 2: Modules & Lessons ===== */}
        <TabsContent value='modules'>
          <Card>
            <CardContent className='p-6 space-y-6'>
              <div className='flex items-center justify-between'>
                <h2 className='text-xl font-bold text-foreground'>
                  Módulos do Curso
                </h2>
                <span className='text-sm text-muted-foreground'>
                  {modules.length} módulo(s)
                </span>
              </div>

              {/* Add module */}
              <div className='flex gap-2'>
                <Input
                  placeholder='Nome do novo módulo...'
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddModule();
                    }
                  }}
                  className='flex-1'
                />
                <Button
                  size='icon'
                  onClick={handleAddModule}
                  disabled={!newModuleTitle.trim()}
                >
                  <Plus className='h-4 w-4' />
                </Button>
              </div>

              <Separator />

              {/* Module navigation */}
              {modules.length === 0 ? (
                <div className='text-center py-10'>
                  <p className='text-muted-foreground'>
                    Nenhum módulo criado ainda
                  </p>
                  <p className='text-sm text-muted-foreground/70'>
                    Adicione o primeiro módulo acima
                  </p>
                </div>
              ) : (
                <>
                  {/* Module tabs with < > navigation */}
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='icon'
                      className='shrink-0'
                      disabled={activeModuleIdx === 0}
                      onClick={() =>
                        setActiveModuleIdx((p) => Math.max(0, p - 1))
                      }
                    >
                      <ChevronLeft className='h-4 w-4' />
                    </Button>

                    <div className='flex-1 flex gap-2 overflow-x-auto py-1'>
                      {modules.map((mod, idx) => (
                        <button
                          key={mod.id}
                          type='button'
                          onClick={() => setActiveModuleIdx(idx)}
                          className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border',
                            idx === activeModuleIdx
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-background text-muted-foreground border-border hover:bg-muted',
                          )}
                        >
                          {mod.title}
                        </button>
                      ))}
                    </div>

                    <Button
                      variant='outline'
                      size='icon'
                      className='shrink-0'
                      disabled={activeModuleIdx >= modules.length - 1}
                      onClick={() =>
                        setActiveModuleIdx((p) =>
                          Math.min(modules.length - 1, p + 1),
                        )
                      }
                    >
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>

                  {/* Active module content */}
                  {activeModule && (
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <h3 className='font-semibold text-foreground'>
                            {activeModule.title}
                          </h3>
                          <span className='text-xs text-muted-foreground'>
                            {activeModule.lessons.length} aula(s)
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <Button size='sm' onClick={handleOpenLessonDialog}>
                            <Plus className='h-3.5 w-3.5 mr-1.5' />
                            Adicionar Aula
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-muted-foreground hover:text-destructive'
                            onClick={() => handleRemoveModule(activeModule.id)}
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                          </Button>
                        </div>
                      </div>

                      {activeModule.lessons.length === 0 ? (
                        <div className='text-center py-8 border rounded-lg border-dashed'>
                          <p className='text-muted-foreground'>
                            Nenhuma aula criada ainda
                          </p>
                          <p className='text-sm text-muted-foreground/70'>
                            Clique em "Adicionar Aula" para começar
                          </p>
                        </div>
                      ) : (
                        <div className='space-y-2'>
                          {activeModule.lessons.map((lesson, lIdx) => (
                            <div
                              key={lesson.id}
                              className='flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors group'
                            >
                              <div className='w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0'>
                                {lIdx + 1}
                              </div>
                              <div className='flex-1 min-w-0'>
                                <p className='font-medium text-foreground truncate'>
                                  {lesson.title}
                                </p>
                                <p className='text-xs text-muted-foreground'>
                                  {lesson.duration > 0
                                    ? `${lesson.duration} min`
                                    : 'Sem duração'}
                                  {lesson.videoUrl && ' • Vídeo'}
                                </p>
                              </div>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() =>
                                  handleRemoveLesson(activeModuleIdx, lesson.id)
                                }
                                className='opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Button */}
      <div className='flex justify-end'>
        <Button size='lg' onClick={handleCreateCourse} disabled={loading}>
          {loading && <Loader2 className='h-4 w-4 animate-spin mr-2' />}
          Criar Curso
        </Button>
      </div>

      {/* ===== New Lesson Dialog ===== */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Nova Aula</DialogTitle>
          </DialogHeader>

          <div className='space-y-5 pt-2'>
            {/* Title */}
            <div className='space-y-2'>
              <Label htmlFor='lesson-title'>Título da Aula *</Label>
              <Input
                id='lesson-title'
                placeholder='Intro kubernetes'
                value={lessonForm.title}
                onChange={(e) =>
                  setLessonForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>

            {/* Description */}
            <div className='space-y-2'>
              <Label htmlFor='lesson-desc'>Descrição</Label>
              <Textarea
                id='lesson-desc'
                placeholder='Breve descrição da aula...'
                className='min-h-[60px]'
                value={lessonForm.description}
                onChange={(e) =>
                  setLessonForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            {/* Video */}
            <div className='space-y-2'>
              <Label htmlFor='lesson-video'>Vídeo</Label>
              <div className='flex gap-2'>
                <Input
                  id='lesson-video'
                  placeholder='URL do vídeo ou faça upload'
                  value={lessonForm.videoUrl}
                  onChange={(e) =>
                    setLessonForm((f) => ({
                      ...f,
                      videoUrl: e.target.value,
                    }))
                  }
                  className='flex-1'
                />
                <Button variant='outline' size='icon' type='button'>
                  <RefreshCw className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {/* Duration */}
            <div className='space-y-2'>
              <Label htmlFor='lesson-duration'>Duração (minutos)</Label>
              <Input
                id='lesson-duration'
                type='number'
                placeholder='Ex: 15'
                value={lessonForm.duration || ''}
                onChange={(e) =>
                  setLessonForm((f) => ({
                    ...f,
                    duration: Number(e.target.value) || 0,
                  }))
                }
                className='w-32'
              />
            </div>

            {/* Supplementary Content */}
            <div className='space-y-2'>
              <Label htmlFor='lesson-supplementary'>
                Conteúdo Complementar
              </Label>
              <Textarea
                id='lesson-supplementary'
                placeholder='Material de apoio, links, anotações...'
                className='min-h-[60px]'
                value={lessonForm.supplementary}
                onChange={(e) =>
                  setLessonForm((f) => ({
                    ...f,
                    supplementary: e.target.value,
                  }))
                }
              />
            </div>

            {/* Actions */}
            <div className='flex justify-end gap-2 pt-2'>
              <Button
                variant='outline'
                onClick={() => setLessonDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateLesson}
                disabled={!lessonForm.title.trim()}
              >
                Criar Aula
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
