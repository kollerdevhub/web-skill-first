'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  CldUploadWidget,
  CloudinaryUploadWidgetResults,
} from 'next-cloudinary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Loader2,
  PlayCircle,
  PlusCircle,
  RefreshCw,
  Trash2,
  Upload,
  Users,
  Check,
  Video,
} from 'lucide-react';
import { cursosService } from '@/lib/api/services/cursos.service';
import { modulosService } from '@/lib/api/services/modulos.service';
import {
  Curso,
  Modulo,
  CursoNivel,
  TipoConteudo,
  Attachment,
  CreateModuloDTO,
} from '@/lib/api/types';
import { CoursePreview } from '@/components/admin/CoursePreview';

interface NewModuleForm {
  sectionTitle: string;
  title: string;
  description: string;
  order: number;
  contentType: TipoConteudo;
  textContent: string;
  estimatedDuration: number;
  required: boolean;
  attachments: Attachment[];
  resources: { label: string; url: string }[];
  transcriptUrl: string;
  subtitleUrl: string;
}

const levelLabel: Record<CursoNivel | string, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  // legacy fallbacks
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

const contentTypeLabel: Record<TipoConteudo, string> = {
  video: 'Vídeo',
  texto: 'Texto',
  quiz: 'Quiz',
  avaliacao: 'Avaliação',
};

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

export default function AdminCourseDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [course, setCourse] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [courseMessage, setCourseMessage] = useState<string | null>(null);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [courseDraft, setCourseDraft] = useState<{
    titulo: string;
    descricao: string;
    categoria: string;
    nivel: string;
    cargaHoraria: number;
  } | null>(null);
  const [updatingImage, setUpdatingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageSuccess, setImageSuccess] = useState<string | null>(null);
  const [modules, setModules] = useState<Modulo[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [moduleMessage, setModuleMessage] = useState<string | null>(null);
  const [moduleError, setModuleError] = useState<string | null>(null);
  const [creatingModule, setCreatingModule] = useState(false);
  const [refreshingModules, setRefreshingModules] = useState(false);
  const [uploadingModuleId, setUploadingModuleId] = useState<string | null>(
    null,
  );
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);
  const [deletingVideoModuleId, setDeletingVideoModuleId] = useState<
    string | null
  >(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [newModuleForm, setNewModuleForm] = useState<NewModuleForm>({
    sectionTitle: '',
    title: '',
    description: '',
    order: 1,
    contentType: 'video',
    textContent: '',
    estimatedDuration: 10,
    required: true,
    attachments: [],
    resources: [],
    transcriptUrl: '',
    subtitleUrl: '',
  });

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

      const silent = options?.silent ?? false;
      if (!silent) {
        setLoadingModules(true);
      } else {
        setRefreshingModules(true);
      }
      setModulesError(null);

      try {
        const list = await modulosService.list(params.id);
        setModules(list);
        setNewModuleForm((current) => ({
          ...current,
          order: list.length + 1,
        }));
      } catch (fetchError) {
        setModulesError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Erro desconhecido',
        );
      } finally {
        if (!silent) {
          setLoadingModules(false);
        } else {
          setRefreshingModules(false);
        }
      }
    },
    [params?.id],
  );

  const sortedModules = useMemo(
    () => [...modules].sort((a, b) => a.ordem - b.ordem),
    [modules],
  );

  const groupedModules = useMemo(() => {
    const groups: Array<{
      section: string;
      lessons: Modulo[];
    }> = [];
    const map = new Map<string, Modulo[]>();

    for (const lessonModule of sortedModules) {
      const { section } = splitSectionAndLessonTitle(lessonModule.titulo);
      const list = map.get(section) || [];
      list.push(lessonModule);
      map.set(section, list);
    }

    for (const [section, lessons] of map.entries()) {
      groups.push({ section, lessons });
    }

    // Preserve order by first appearance in sortedModules
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

  const selectedModule = useMemo(() => {
    if (sortedModules.length === 0) return null;

    return (
      sortedModules.find((module) => module.id === selectedModuleId) ||
      sortedModules[0]
    );
  }, [sortedModules, selectedModuleId]);

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
      cargaHoraria: course.cargaHoraria,
    });
  }, [course]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    if (!selectedModuleId && sortedModules.length > 0) {
      setSelectedModuleId(sortedModules[0].id);
      return;
    }

    if (
      selectedModuleId &&
      sortedModules.length > 0 &&
      !sortedModules.some((module) => module.id === selectedModuleId)
    ) {
      setSelectedModuleId(sortedModules[0].id);
    }
  }, [selectedModuleId, sortedModules]);

  useEffect(() => {
    if (searchParams.get('warning') === 'thumbnail') {
      setImageError(
        'O curso foi criado, mas a capa não foi aplicada automaticamente. Faça o upload da capa nesta tela.',
      );
    }

    if (searchParams.get('warning')?.includes('publish')) {
      setCourseError(
        'O curso foi criado, mas não foi possível publicar automaticamente. Tente publicar novamente nesta tela.',
      );
    }

    if (searchParams.get('created') === '1') {
      setCourseMessage(
        'Curso criado. Agora você pode editar e montar a trilha.',
      );
    }
  }, [searchParams]);

  async function handleSaveCourse() {
    if (!course || !courseDraft) return;
    setSavingCourse(true);
    setCourseError(null);
    setCourseMessage(null);
    try {
      // Partial updates
      const updated = await cursosService.update(course.id, {
        ...courseDraft,
        // @ts-ignore
        nivel: courseDraft.nivel,
        // @ts-ignore
        categoria: courseDraft.categoria,
        cargaHoraria: Number(courseDraft.cargaHoraria) || 1,
      });

      setCourse(updated);
      setEditingCourse(false);
      setCourseMessage('Curso atualizado com sucesso.');
    } catch (err) {
      setCourseError(
        err instanceof Error ? err.message : 'Erro ao salvar curso',
      );
    } finally {
      setSavingCourse(false);
    }
  }

  async function handleUploadImageFile(file: File) {
    if (!course) return;

    setUpdatingImage(true);
    setImageError(null);
    setImageSuccess(null);

    try {
      const { thumbnailUrl } = await cursosService.uploadThumbnail(
        course.id,
        file,
      );

      setCourse((prev) => (prev ? { ...prev, thumbnailUrl } : null));
      setImageSuccess('Imagem do curso atualizada com sucesso.');
    } catch (updateError) {
      setImageError(
        updateError instanceof Error
          ? updateError.message
          : 'Falha ao atualizar imagem',
      );
    } finally {
      setUpdatingImage(false);
    }
  }

  async function handleCreateModule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!course) return;

    if (!newModuleForm.sectionTitle.trim()) {
      setModuleError('Informe o nome do módulo (seção).');
      return;
    }

    if (!newModuleForm.title.trim()) {
      setModuleError('Informe o título da aula.');
      return;
    }

    setCreatingModule(true);
    setModuleError(null);
    setModuleMessage(null);

    try {
      const payload: CreateModuloDTO = {
        titulo: `${newModuleForm.sectionTitle.trim()} :: ${newModuleForm.title.trim()}`,
        descricao: newModuleForm.description.trim() || undefined,
        ordem: Math.max(Number(newModuleForm.order) || 1, 1),
        tipoConteudo: newModuleForm.contentType,
        conteudoTexto:
          newModuleForm.contentType === 'texto'
            ? newModuleForm.textContent.trim() || undefined
            : undefined,
        duracaoEstimada:
          newModuleForm.estimatedDuration > 0
            ? newModuleForm.estimatedDuration
            : undefined,
        obrigatorio: newModuleForm.required,
        attachments: newModuleForm.attachments,
        resources: newModuleForm.resources,
        transcriptUrl: newModuleForm.transcriptUrl || undefined,
        subtitleUrl: newModuleForm.subtitleUrl || undefined,
      };

      const createdModule = await modulosService.create(course.id, payload);

      setNewModuleForm((current) => ({
        ...current,
        sectionTitle: current.sectionTitle,
        title: '',
        description: '',
        textContent: '',
        order: current.order + 1,
        estimatedDuration: current.estimatedDuration || 10,
        attachments: [],
        resources: [],
        transcriptUrl: '',
        subtitleUrl: '',
      }));
      setSelectedModuleId(createdModule.id);
      setModuleMessage('Módulo criado com sucesso.');

      await fetchModules({ silent: true });
    } catch (createError) {
      setModuleError(
        createError instanceof Error
          ? createError.message
          : 'Falha ao criar módulo',
      );
    } finally {
      setCreatingModule(false);
    }
  }

  async function handleDeleteModule(moduleToDelete: Modulo) {
    if (
      !confirm(
        `Excluir o módulo "${moduleToDelete.ordem}. ${moduleToDelete.titulo}"?`,
      )
    ) {
      return;
    }

    if (!course) return;

    setDeletingModuleId(moduleToDelete.id);
    setModuleError(null);
    setModuleMessage(null);

    try {
      await modulosService.delete(course.id, moduleToDelete.id);

      setModules((current) =>
        current.filter((module) => module.id !== moduleToDelete.id),
      );
      setModuleMessage('Módulo removido com sucesso.');
    } catch (deleteError) {
      setModuleError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Falha ao excluir módulo',
      );
    } finally {
      setDeletingModuleId(null);
    }
  }

  async function handleUploadModuleVideo(moduleId: string, file: File) {
    if (!course) return;

    setUploadingModuleId(moduleId);
    setModuleError(null);
    setModuleMessage(null);

    try {
      await modulosService.uploadVideo(course.id, moduleId, file);

      await fetchModules({ silent: true });
      setSelectedModuleId(moduleId);
      setModuleMessage('Vídeo enviado com sucesso.');
    } catch (uploadError) {
      setModuleError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Falha no upload do vídeo',
      );
    } finally {
      setUploadingModuleId(null);
    }
  }

  async function handleDeleteModuleVideo(moduleId: string) {
    if (!course) return;
    if (!confirm('Remover o vídeo deste módulo?')) {
      return;
    }

    setDeletingVideoModuleId(moduleId);
    setModuleError(null);
    setModuleMessage(null);

    try {
      await modulosService.deleteVideo(course.id, moduleId);

      await fetchModules({ silent: true });
      setModuleMessage('Vídeo removido com sucesso.');
    } catch (deleteError) {
      setModuleError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Falha ao remover vídeo',
      );
    } finally {
      setDeletingVideoModuleId(null);
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[50vh]'>
        <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className='space-y-6'>
        <Button
          variant='outline'
          onClick={() => router.push('/admin/cursos')}
          className='border-slate-200 text-slate-600'
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Voltar para cursos
        </Button>

        <Card className='bg-red-50 border-red-200'>
          <CardContent className='p-6 flex items-center gap-3'>
            <AlertCircle className='h-5 w-5 text-red-600' />
            <p className='text-red-700'>
              {error || 'Curso não encontrado no backend'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-10'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            onClick={() => router.push('/admin/cursos')}
            className='border-slate-200 text-slate-600'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Voltar
          </Button>
          <div className='flex items-center gap-2'>
            <h1 className='text-2xl font-bold text-slate-900'>
              {course.titulo}
            </h1>
            <span
              className={`px-2 py-1 text-xs rounded-full border ${course.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
            >
              {course.status === 'published' ? 'Publicado' : 'Rascunho'}
            </span>
          </div>
        </div>
        <div className='flex gap-2'>
          <CoursePreview course={course} modules={modules} />
          <Button
            variant='outline'
            onClick={() => setEditingCourse(!editingCourse)}
            className='border-slate-200'
          >
            {editingCourse ? 'Cancelar Edição' : 'Editar Curso'}
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <Card className='lg:col-span-2 bg-white border-slate-200 overflow-hidden shadow-sm'>
          <div className='h-72 sm:h-96 lg:h-[450px] bg-slate-100'>
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.titulo}
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center text-slate-300'>
                <ImageIcon className='h-14 w-14' />
              </div>
            )}
          </div>
          <div className='p-6 border-b border-slate-100'>
            <div className='flex flex-wrap gap-2'>
              <span className='px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs border border-blue-100'>
                {course.categoria}
              </span>
              <span className='px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs border border-emerald-100'>
                {levelLabel[course.nivel] || course.nivel}
              </span>
            </div>
          </div>
          <CardContent className='p-6 pt-6 space-y-6'>
            {courseMessage && (
              <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700'>
                {courseMessage}
              </div>
            )}
            {courseError && (
              <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
                {courseError}
              </div>
            )}
            {imageError && (
              <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
                {imageError}
              </div>
            )}
            {imageSuccess && (
              <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700'>
                {imageSuccess}
              </div>
            )}

            <p className='text-slate-600 leading-relaxed'>{course.descricao}</p>

            <div className='space-y-3'>
              <h3 className='text-base font-semibold text-slate-800'>Trilha</h3>
              {loadingModules ? (
                <div className='flex items-center gap-2 text-sm text-slate-500'>
                  <Loader2 className='h-4 w-4 animate-spin text-blue-600' />
                  Carregando trilha...
                </div>
              ) : sortedModules.length === 0 ? (
                <p className='text-sm text-slate-500'>
                  Ainda não há aulas neste curso.
                </p>
              ) : (
                <div className='space-y-4'>
                  {groupedModules.slice(0, 3).map((group) => (
                    <div
                      key={group.section}
                      className='rounded-lg border border-slate-200 bg-slate-50/50 p-4'
                    >
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-semibold text-slate-800'>
                          {group.section}
                        </p>
                        <p className='text-xs text-slate-400'>
                          {group.lessons.length} aulas
                        </p>
                      </div>
                      <div className='mt-3 space-y-1.5'>
                        {group.lessons.slice(0, 4).map((lesson) => (
                          <div
                            key={lesson.id}
                            className='flex items-center justify-between gap-3 text-sm'
                          >
                            <span className='truncate text-slate-700'>
                              {lesson.ordem}.{' '}
                              {splitSectionAndLessonTitle(lesson.titulo).lesson}
                            </span>
                            <span className='shrink-0 text-xs text-slate-400'>
                              {lesson.duracaoEstimada || 0} min
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className='space-y-8'>
          <Card className='bg-white border-slate-200 shadow-sm'>
            <CardHeader>
              <CardTitle className='text-lg'>Gerenciar Conteúdo</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='rounded-lg border border-2 border-dashed border-slate-200 p-6 hover:bg-slate-50/50 transition-colors'>
                <div className='flex flex-col items-center gap-2 text-center'>
                  <label
                    className={`cursor-pointer flex flex-col items-center gap-2 ${
                      updatingImage ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <input
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadImageFile(file);
                      }}
                    />
                    {updatingImage ? (
                      <Loader2 className='h-10 w-10 text-blue-600 animate-spin' />
                    ) : (
                      <Upload className='h-10 w-10 text-slate-400' />
                    )}
                    <span className='text-sm font-medium text-slate-700'>
                      {updatingImage ? 'Enviando...' : 'Alterar Capa'}
                    </span>
                    <span className='text-xs text-slate-400'>PNG ou JPG</span>
                  </label>
                </div>
              </div>

              <div className='pt-2'>
                <div className='text-sm font-medium text-slate-700 mb-2'>
                  Adicionar Nova Aula
                </div>
                <form onSubmit={handleCreateModule} className='space-y-3'>
                  {moduleError && (
                    <div className='text-xs text-red-600 bg-red-50 p-2 rounded'>
                      {moduleError}
                    </div>
                  )}
                  {moduleMessage && (
                    <div className='text-xs text-emerald-600 bg-emerald-50 p-2 rounded'>
                      {moduleMessage}
                    </div>
                  )}

                  <Input
                    placeholder='Nome da Seção (ex: Módulo 1: Introdução)'
                    value={newModuleForm.sectionTitle}
                    onChange={(e) =>
                      setNewModuleForm({
                        ...newModuleForm,
                        sectionTitle: e.target.value,
                      })
                    }
                    className='text-sm'
                  />
                  <Input
                    placeholder='Título da Aula'
                    value={newModuleForm.title}
                    onChange={(e) =>
                      setNewModuleForm({
                        ...newModuleForm,
                        title: e.target.value,
                      })
                    }
                    className='text-sm'
                  />
                  <Select
                    value={newModuleForm.contentType}
                    onValueChange={(val: any) =>
                      setNewModuleForm({ ...newModuleForm, contentType: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Tipo de Conteúdo' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='video'>Vídeo</SelectItem>
                      <SelectItem value='texto'>Texto</SelectItem>
                      <SelectItem value='quiz'>Quiz</SelectItem>
                      <SelectItem value='avaliacao'>Avaliação</SelectItem>
                    </SelectContent>
                  </Select>

                  {newModuleForm.contentType === 'texto' && (
                    <Textarea
                      placeholder='Conteúdo em texto...'
                      value={newModuleForm.textContent}
                      onChange={(e) =>
                        setNewModuleForm({
                          ...newModuleForm,
                          textContent: e.target.value,
                        })
                      }
                      className='min-h-[100px]'
                    />
                  )}

                  <Button
                    type='submit'
                    className='w-full bg-blue-600 hover:bg-blue-700'
                    disabled={creatingModule}
                  >
                    {creatingModule ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <PlusCircle className='h-4 w-4 mr-2' />
                    )}
                    Adicionar Aula
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white border-slate-200 shadow-sm'>
            <CardHeader>
              <CardTitle className='text-lg'>Última Aula Adicionada</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedModules.length > 0 ? (
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-slate-900'>
                      {sortedModules[sortedModules.length - 1].titulo}
                    </span>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='text-red-500 hover:text-red-700 hover:bg-red-50'
                      onClick={() =>
                        handleDeleteModule(
                          sortedModules[sortedModules.length - 1],
                        )
                      }
                      disabled={
                        deletingModuleId ===
                        sortedModules[sortedModules.length - 1].id
                      }
                    >
                      {deletingModuleId ===
                      sortedModules[sortedModules.length - 1].id ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Trash2 className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                  {sortedModules[sortedModules.length - 1].tipoConteudo ===
                    'video' && (
                    <div className='flex items-center gap-2'>
                      {sortedModules[sortedModules.length - 1].videoUrl ? (
                        <div className='flex items-center gap-2 text-emerald-600 text-sm'>
                          <Check className='h-4 w-4' /> Vídeo enviado
                        </div>
                      ) : (
                        <div className='w-full'>
                          <p className='text-xs text-slate-500 mb-2'>
                            Fazer upload de vídeo:
                          </p>
                          <CldUploadWidget
                            uploadPreset={
                              process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
                            }
                            options={{
                              maxFiles: 1,
                              resourceType: 'video',
                              clientAllowedFormats: ['mp4', 'webm', 'mov'],
                            }}
                            onSuccess={(
                              result: CloudinaryUploadWidgetResults,
                            ) => {
                              if (
                                result.info &&
                                typeof result.info !== 'string'
                              ) {
                                const moduleId =
                                  sortedModules[sortedModules.length - 1].id;
                                modulosService
                                  .update(course?.id || '', moduleId, {
                                    videoUrl: result.info.secure_url,
                                    videoPublicId: result.info.public_id,
                                  })
                                  .then(() => fetchModules({ silent: true }));
                              }
                            }}
                          >
                            {({ open }) => (
                              <Button
                                variant='outline'
                                size='sm'
                                className='w-full'
                                onClick={() => open?.()}
                              >
                                <Video className='h-3 w-3 mr-2' /> Upload Vídeo
                              </Button>
                            )}
                          </CldUploadWidget>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className='text-sm text-slate-500'>
                  Nenhuma aula cadastrada.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
