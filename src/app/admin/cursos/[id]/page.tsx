'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { VideoUploader } from '@/components/admin/VideoUploader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  GripVertical,
  Image as ImageIcon,
  Loader2,
  Pencil,
  PlayCircle,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { cursosService } from '@/lib/api/services/cursos.service';
import { modulosService } from '@/lib/api/services/modulos.service';
import {
  Curso,
  Modulo,
  CursoNivel,
  CursoCategoria,
  TipoConteudo,
  CreateModuloDTO,
} from '@/lib/api/types';
import { CoursePreview } from '@/components/admin/CoursePreview';
import { toast } from '@/hooks/use-toast';

// ============================================================================
// Helpers
// ============================================================================

const levelLabel: Record<CursoNivel | string, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

function minutesToHours(minutes: number): number {
  if (minutes <= 0) return 0;
  return Number((minutes / 60).toFixed(1));
}

function sanitizeDurationMinutes(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

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

export default function AdminCourseDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  // -- Course state --
  const [course, setCourse] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -- Edit form state --
  const [editingCourse, setEditingCourse] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [courseDraft, setCourseDraft] = useState<{
    titulo: string;
    descricao: string;
    categoria: string;
    nivel: string;
  } | null>(null);

  // -- Image --
  const [updatingImage, setUpdatingImage] = useState(false);

  // -- Modules --
  const [modules, setModules] = useState<Modulo[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [creatingModule, setCreatingModule] = useState(false);
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);

  // -- Lesson dialog --
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    sectionTitle: '',
    title: '',
    description: '',
    contentType: 'video' as TipoConteudo,
    duration: 10,
    textContent: '',
    videoUrl: '',
    videoPublicId: '',
  });

  // ============================================================================
  // Data fetching
  // ============================================================================

  const fetchCourse = useCallback(async () => {
    if (!params?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await cursosService.getById(params.id);
      setCourse(data);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : 'Erro desconhecido',
      );
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  const fetchModules = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!params?.id) return;
      if (!options?.silent) setLoadingModules(true);
      try {
        const list = await modulosService.list(params.id);
        setModules(list);
        const recalculatedHours = minutesToHours(
          list.reduce((sum, lesson) => sum + (lesson.duracaoEstimada || 0), 0),
        );
        setCourse((prev) =>
          prev ? { ...prev, cargaHoraria: recalculatedHours } : null,
        );
      } catch {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar módulos.',
          variant: 'destructive',
        });
      } finally {
        setLoadingModules(false);
      }
    },
    [params?.id],
  );

  const sortedModules = useMemo(
    () => [...modules].sort((a, b) => a.ordem - b.ordem),
    [modules],
  );
  const totalLessons = sortedModules.length;
  const totalLessonMinutes = useMemo(
    () =>
      sortedModules.reduce(
        (sum, lesson) => sum + (lesson.duracaoEstimada || 0),
        0,
      ),
    [sortedModules],
  );
  const calculatedCourseHours = useMemo(
    () => minutesToHours(totalLessonMinutes),
    [totalLessonMinutes],
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

  const existingSections = useMemo(() => {
    const sections = new Set<string>();
    modules.forEach((m) => {
      const { section } = splitSectionAndLessonTitle(m.titulo);
      sections.add(section);
    });
    return Array.from(sections);
  }, [modules]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  useEffect(() => {
    if (!course) return;
    setCourseDraft({
      titulo: course.titulo,
      descricao: course.descricao,
      categoria: course.categoria,
      nivel: course.nivel,
    });
  }, [course]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    if (searchParams.get('created') === '1') {
      toast({
        title: 'Curso criado!',
        description: 'Agora você pode editar e montar a trilha.',
      });
    }
    if (searchParams.get('warning') === 'thumbnail') {
      toast({
        title: 'Atenção',
        description: 'A capa não foi aplicada. Faça o upload nesta tela.',
        variant: 'destructive',
      });
    }
  }, [searchParams]);

  // ============================================================================
  // Actions
  // ============================================================================

  async function handleSaveCourse() {
    if (!course || !courseDraft) return;
    setSavingCourse(true);
    try {
      const updated = await cursosService.update(course.id, {
        ...courseDraft,
        nivel: courseDraft.nivel as CursoNivel,
        categoria: courseDraft.categoria as CursoCategoria,
        cargaHoraria: calculatedCourseHours,
      });
      setCourse(updated);
      setEditingCourse(false);
      toast({ title: 'Salvo', description: 'Curso atualizado com sucesso.' });
    } catch (err) {
      toast({
        title: 'Erro',
        description:
          err instanceof Error ? err.message : 'Erro ao salvar curso',
        variant: 'destructive',
      });
    } finally {
      setSavingCourse(false);
    }
  }

  async function handleUploadImage(file: File) {
    if (!course) return;
    setUpdatingImage(true);
    try {
      const { thumbnailUrl } = await cursosService.uploadThumbnail(
        course.id,
        file,
      );
      setCourse((prev) => (prev ? { ...prev, thumbnailUrl } : null));
      toast({ title: 'Capa atualizada!' });
    } catch (err) {
      toast({
        title: 'Erro no upload',
        description:
          err instanceof Error ? err.message : 'Falha ao atualizar imagem',
        variant: 'destructive',
      });
    } finally {
      setUpdatingImage(false);
    }
  }

  function handleOpenLessonDialog(initialSection?: string) {
    setLessonForm({
      sectionTitle: initialSection || '',
      title: '',
      description: '',
      contentType: 'video',
      duration: 10,
      textContent: '',
      videoUrl: '',
      videoPublicId: '',
    });
    setLessonDialogOpen(true);
  }

  async function handleCreateLesson() {
    if (!course) return;
    if (!lessonForm.sectionTitle.trim() || !lessonForm.title.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o nome do módulo e o título da aula.',
        variant: 'destructive',
      });
      return;
    }

    setCreatingModule(true);
    try {
      const sanitizedDuration = sanitizeDurationMinutes(lessonForm.duration);
      const payload: CreateModuloDTO = {
        titulo: `${lessonForm.sectionTitle.trim()} :: ${lessonForm.title.trim()}`,
        descricao: lessonForm.description.trim() || undefined,
        ordem: sortedModules.length + 1,
        tipoConteudo: lessonForm.contentType,
        duracaoEstimada: sanitizedDuration > 0 ? sanitizedDuration : undefined,
        obrigatorio: true,
        ...(lessonForm.contentType === 'texto' && lessonForm.textContent
          ? { conteudoTexto: lessonForm.textContent }
          : {}),
        ...(lessonForm.contentType === 'video' && lessonForm.videoUrl
          ? {
              videoUrl: lessonForm.videoUrl,
              videoPublicId: lessonForm.videoPublicId,
            }
          : {}),
      };

      await modulosService.create(course.id, payload);
      await fetchModules({ silent: true });
      setLessonDialogOpen(false);
      toast({ title: 'Aula criada!', description: 'Adicionada à trilha.' });
    } catch (err) {
      toast({
        title: 'Erro',
        description:
          err instanceof Error ? err.message : 'Falha ao criar módulo',
        variant: 'destructive',
      });
    } finally {
      setCreatingModule(false);
    }
  }

  async function handleDeleteModule(mod: Modulo) {
    if (!confirm(`Excluir "${splitSectionAndLessonTitle(mod.titulo).lesson}"?`))
      return;
    if (!course) return;

    setDeletingModuleId(mod.id);
    try {
      await modulosService.delete(course.id, mod.id);
      await fetchModules({ silent: true });
      toast({ title: 'Aula removida.' });
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Falha ao excluir',
        variant: 'destructive',
      });
    } finally {
      setDeletingModuleId(null);
    }
  }

  // ============================================================================
  // Loading / Error
  // ============================================================================

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[50vh]'>
        <Loader2 className='h-6 w-6 animate-spin text-primary' />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className='space-y-6'>
        <Button variant='outline' onClick={() => router.push('/admin/cursos')}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Voltar para cursos
        </Button>
        <Card className='bg-destructive/10 border-destructive/30'>
          <CardContent className='p-6 flex items-center gap-3'>
            <AlertCircle className='h-5 w-5 text-destructive' />
            <p className='text-destructive'>
              {error || 'Curso não encontrado.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => router.push('/admin/cursos')}
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div className='flex items-center gap-2'>
            <h1 className='text-2xl font-bold text-foreground'>
              {course.titulo}
            </h1>
            <Badge
              variant='outline'
              className={
                course.status === 'published'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }
            >
              {course.status === 'published' ? 'Publicado' : 'Rascunho'}
            </Badge>
          </div>
        </div>
        <div className='flex gap-2'>
          <CoursePreview course={course} modules={modules} />
          <Button
            variant='outline'
            onClick={() => setEditingCourse(!editingCourse)}
          >
            <Pencil className='h-4 w-4 mr-2' />
            {editingCourse ? 'Cancelar' : 'Editar Curso'}
          </Button>
        </div>
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
              {/* Cover Image */}
              <div className='space-y-2'>
                <Label>Capa do Curso</Label>
                <div className='relative aspect-[16/7] rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/30 group'>
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.titulo}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='absolute inset-0 flex flex-col items-center justify-center text-muted-foreground'>
                      <ImageIcon className='h-10 w-10 mb-2 opacity-40' />
                      <span className='text-sm'>Sem capa</span>
                    </div>
                  )}
                  {/* Overlay for upload */}
                  <label className='absolute inset-0 flex flex-col items-center justify-center bg-black/0 hover:bg-black/40 transition-all cursor-pointer opacity-0 group-hover:opacity-100'>
                    <input
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadImage(file);
                      }}
                    />
                    {updatingImage ? (
                      <Loader2 className='h-8 w-8 text-white animate-spin' />
                    ) : (
                      <>
                        <Upload className='h-8 w-8 text-white mb-1' />
                        <span className='text-sm text-white font-medium'>
                          Alterar Capa
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <Separator />

              {/* Course fields */}
              {editingCourse && courseDraft ? (
                <div className='space-y-5'>
                  <div className='space-y-2'>
                    <Label htmlFor='titulo'>Título *</Label>
                    <Input
                      id='titulo'
                      value={courseDraft.titulo}
                      onChange={(e) =>
                        setCourseDraft({
                          ...courseDraft,
                          titulo: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='descricao'>Descrição *</Label>
                    <Textarea
                      id='descricao'
                      value={courseDraft.descricao}
                      onChange={(e) =>
                        setCourseDraft({
                          ...courseDraft,
                          descricao: e.target.value,
                        })
                      }
                      className='min-h-[100px]'
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label>Categoria</Label>
                      <Select
                        value={courseDraft.categoria}
                        onValueChange={(v) =>
                          setCourseDraft({ ...courseDraft, categoria: v })
                        }
                      >
                        <SelectTrigger>
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
                    </div>
                    <div className='space-y-2'>
                      <Label>Nível</Label>
                      <Select
                        value={courseDraft.nivel}
                        onValueChange={(v) =>
                          setCourseDraft({ ...courseDraft, nivel: v })
                        }
                      >
                        <SelectTrigger>
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
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='cargaHoraria'>
                      Carga Horária (calculada)
                    </Label>
                    <Input
                      id='cargaHoraria'
                      type='number'
                      value={calculatedCourseHours}
                      readOnly
                      className='w-32 bg-muted/40'
                    />
                    <p className='text-xs text-muted-foreground'>
                      {totalLessonMinutes} min somados das aulas
                    </p>
                  </div>
                  <div className='flex gap-2 pt-2'>
                    <Button onClick={handleSaveCourse} disabled={savingCourse}>
                      {savingCourse ? (
                        <Loader2 className='h-4 w-4 animate-spin mr-2' />
                      ) : (
                        <Save className='h-4 w-4 mr-2' />
                      )}
                      Salvar Alterações
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => setEditingCourse(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Descrição</p>
                    <p className='text-foreground leading-relaxed mt-1'>
                      {course.descricao}
                    </p>
                  </div>
                  <div className='flex flex-wrap gap-3'>
                    <Badge variant='secondary'>{course.categoria}</Badge>
                    <Badge
                      variant='outline'
                      className='bg-emerald-50 text-emerald-700 border-emerald-200'
                    >
                      {levelLabel[course.nivel] || course.nivel}
                    </Badge>
                    <Badge variant='outline'>
                      <Clock className='h-3 w-3 mr-1' />
                      {course.cargaHoraria}h
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 2: Modules & Lessons ===== */}
        <TabsContent value='modules'>
          <Card>
            <CardContent className='p-6 space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-xl font-bold text-foreground'>
                    Módulos e Aulas
                  </h2>
                  <p className='text-sm text-muted-foreground'>
                    {groupedModules.length} módulo(s) • {totalLessons} aula(s) •{' '}
                    {totalLessonMinutes} min ({calculatedCourseHours}h)
                  </p>
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => fetchModules({ silent: true })}
                  >
                    <RefreshCw className='h-3.5 w-3.5 mr-1.5' />
                    Atualizar
                  </Button>
                  <Button size='sm' onClick={() => handleOpenLessonDialog()}>
                    <Plus className='h-3.5 w-3.5 mr-1.5' />
                    Adicionar Aula
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Module list */}
              {loadingModules ? (
                <div className='flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Carregando módulos...
                </div>
              ) : sortedModules.length === 0 ? (
                <div className='text-center py-12'>
                  <BookOpen className='h-12 w-12 text-muted-foreground/30 mx-auto mb-3' />
                  <p className='text-muted-foreground'>
                    Nenhuma aula criada ainda
                  </p>
                  <p className='text-sm text-muted-foreground/70 mb-4'>
                    Clique em &quot;Adicionar Aula&quot; para começar
                  </p>
                  <Button size='sm' onClick={() => handleOpenLessonDialog()}>
                    <Plus className='h-3.5 w-3.5 mr-1.5' />
                    Adicionar Aula
                  </Button>
                </div>
              ) : (
                <div className='space-y-4'>
                  {groupedModules.map((group, gIdx) => (
                    <div
                      key={group.section}
                      className='rounded-lg border border-border overflow-hidden'
                    >
                      {/* Section header */}
                      <div className='px-4 py-3 bg-muted/50 flex items-center justify-between'>
                        <div>
                          <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>
                            MÓDULO {gIdx + 1}
                          </p>
                          <p className='text-sm font-semibold text-foreground'>
                            {group.section}
                          </p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Badge variant='secondary' className='text-xs'>
                            {group.lessons.length} aula(s)
                          </Badge>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-6 w-6 p-0'
                            onClick={() =>
                              handleOpenLessonDialog(group.section)
                            }
                          >
                            <Plus className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>

                      {/* Lessons */}
                      <div className='divide-y divide-border'>
                        {group.lessons.map((lesson) => {
                          const lessonTitle = splitSectionAndLessonTitle(
                            lesson.titulo,
                          ).lesson;
                          const isDeleting = deletingModuleId === lesson.id;

                          return (
                            <div
                              key={lesson.id}
                              className='flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group'
                            >
                              {/* Order number */}
                              <div className='w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0'>
                                {lesson.ordem}
                              </div>

                              {/* Info */}
                              <div className='flex-1 min-w-0'>
                                <p className='font-medium text-foreground truncate'>
                                  {lessonTitle}
                                </p>
                                <div className='flex items-center gap-2 mt-0.5'>
                                  <span className='text-xs text-muted-foreground flex items-center gap-1'>
                                    {lesson.tipoConteudo === 'video' ? (
                                      <PlayCircle className='h-3 w-3' />
                                    ) : (
                                      <FileText className='h-3 w-3' />
                                    )}
                                    {lesson.tipoConteudo}
                                  </span>
                                  <span className='text-xs text-muted-foreground'>
                                    •
                                  </span>
                                  <span className='text-xs text-muted-foreground'>
                                    {lesson.duracaoEstimada || 0} min
                                  </span>
                                  {lesson.videoUrl && (
                                    <>
                                      <span className='text-xs text-muted-foreground'>
                                        •
                                      </span>
                                      <Badge
                                        variant='outline'
                                        className='text-[10px] border-emerald-200 text-emerald-600'
                                      >
                                        Vídeo ✓
                                      </Badge>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                {lesson.tipoConteudo === 'video' && (
                                  <VideoUploader
                                    label=''
                                    currentVideoUrl={lesson.videoUrl}
                                    folder='web-skill-first/videos'
                                    onUploadComplete={(url, publicId) => {
                                      modulosService
                                        .update(course.id, lesson.id, {
                                          videoUrl: url,
                                          videoPublicId: publicId,
                                        })
                                        .then(() =>
                                          fetchModules({ silent: true }),
                                        );
                                    }}
                                  />
                                )}
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => handleDeleteModule(lesson)}
                                  disabled={isDeleting}
                                  className='text-muted-foreground hover:text-destructive'
                                >
                                  {isDeleting ? (
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                  ) : (
                                    <Trash2 className='h-4 w-4' />
                                  )}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== New Lesson Dialog ===== */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Nova Aula</DialogTitle>
          </DialogHeader>

          <div className='space-y-5 pt-2'>
            <div className='space-y-2'>
              <Label>Nome do Módulo (Seção) *</Label>
              <Input
                placeholder='Ex: Módulo 1: Introdução'
                value={lessonForm.sectionTitle}
                onChange={(e) =>
                  setLessonForm((f) => ({
                    ...f,
                    sectionTitle: e.target.value,
                  }))
                }
              />
              {existingSections.length > 0 && (
                <div className='flex flex-wrap gap-2 mt-1'>
                  <span className='text-xs text-muted-foreground w-full'>
                    Sugestões:
                  </span>
                  {existingSections.map((s) => (
                    <Badge
                      key={s}
                      variant='secondary'
                      className='cursor-pointer hover:bg-primary/20 transition-colors'
                      onClick={() =>
                        setLessonForm((f) => ({ ...f, sectionTitle: s }))
                      }
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className='space-y-2'>
              <Label>Título da Aula *</Label>
              <Input
                placeholder='Ex: O que é Kubernetes?'
                value={lessonForm.title}
                onChange={(e) =>
                  setLessonForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label>Descrição</Label>
              <Textarea
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

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Tipo de Conteúdo</Label>
                <Select
                  value={lessonForm.contentType}
                  onValueChange={(v) =>
                    setLessonForm((f) => ({
                      ...f,
                      contentType: v as TipoConteudo,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='video'>Vídeo</SelectItem>
                    <SelectItem value='texto'>Texto</SelectItem>
                    <SelectItem value='quiz'>Quiz</SelectItem>
                    <SelectItem value='avaliacao'>Avaliação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Duração (min)</Label>
                <Input
                  type='number'
                  placeholder='10'
                  value={lessonForm.duration || ''}
                  onChange={(e) =>
                    setLessonForm((f) => ({
                      ...f,
                      duration: sanitizeDurationMinutes(
                        Number(e.target.value) || 0,
                      ),
                    }))
                  }
                />
              </div>
            </div>

            {lessonForm.contentType === 'video' && (
              <div className='space-y-2'>
                <Label>Vídeo da Aula</Label>
                <VideoUploader
                  label=''
                  folder='web-skill-first/videos'
                  currentVideoUrl={lessonForm.videoUrl || undefined}
                  onUploadComplete={(url, publicId) =>
                    setLessonForm((f) => ({
                      ...f,
                      videoUrl: url,
                      videoPublicId: publicId,
                    }))
                  }
                />
              </div>
            )}

            {lessonForm.contentType === 'texto' && (
              <div className='space-y-2'>
                <Label>Conteúdo em Texto</Label>
                <Textarea
                  placeholder='Conteúdo da aula...'
                  className='min-h-[80px]'
                  value={lessonForm.textContent}
                  onChange={(e) =>
                    setLessonForm((f) => ({
                      ...f,
                      textContent: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            <div className='flex justify-end gap-2 pt-2'>
              <Button
                variant='outline'
                onClick={() => setLessonDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateLesson}
                disabled={
                  creatingModule ||
                  !lessonForm.sectionTitle.trim() ||
                  !lessonForm.title.trim()
                }
              >
                {creatingModule && (
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                )}
                Criar Aula
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
