'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  Clock,
  Eye,
  GraduationCap,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Users,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cursosService } from '@/lib/api/services/cursos.service';
import { Curso, CursoNivel, CursoCategoria } from '@/lib/api/types';

type StatusFilter = 'all' | 'published' | 'draft' | 'archived';

const levelConfig: Record<
  CursoNivel | string,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  basico: {
    label: 'Básico',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  intermediario: {
    label: 'Intermediário',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  avancado: {
    label: 'Avançado',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
  // Fallback for any legacy data
  beginner: {
    label: 'Iniciante',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  intermediate: {
    label: 'Intermediário',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  advanced: {
    label: 'Avançado',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
};

const statusConfig: Record<
  Exclude<StatusFilter, 'all'>,
  { label: string; pill: string; dot: string }
> = {
  published: {
    label: 'Publicado',
    pill: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  draft: {
    label: 'Rascunho',
    pill: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  archived: {
    label: 'Arquivado',
    pill: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
  },
};

export default function AdminCursosPage() {
  const [courses, setCourses] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [togglingPublishId, setTogglingPublishId] = useState<string | null>(
    null,
  );
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const response = await cursosService.search({ limit: 100 });
      setCourses(response.data);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Excluir o curso "${title}"?`)) return;
    setDeleting(id);
    try {
      await cursosService.delete(id);
      setCourses((current) => current.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      alert('Erro ao excluir curso. Tente novamente.');
    } finally {
      setDeleting(null);
    }
  }

  async function handlePublishToggle(course: Curso) {
    const publishing = course.status !== 'published';
    const ok = confirm(
      publishing
        ? `Publicar o curso "${course.titulo}"?`
        : `Despublicar o curso "${course.titulo}"?`,
    );
    if (!ok) return;

    setTogglingPublishId(course.id);
    try {
      if (publishing) {
        await cursosService.publish(course.id);
      } else {
        await cursosService.unpublish(course.id);
      }

      setCourses((current) =>
        current.map((c) =>
          c.id === course.id
            ? { ...c, status: publishing ? 'published' : 'draft' }
            : c,
        ),
      );
    } catch (e) {
      alert(
        e instanceof Error ? e.message : 'Falha ao atualizar status do curso',
      );
    } finally {
      setTogglingPublishId(null);
    }
  }

  const categories = useMemo(() => {
    const cats = new Set(courses.map((c) => c.categoria));
    return Array.from(cats).sort();
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const result = courses.filter((course) => {
      const matchesSearch =
        course.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel =
        levelFilter === 'all' || course.nivel === levelFilter;
      const matchesCategory =
        categoryFilter === 'all' || course.categoria === categoryFilter;
      const courseStatus = course.status || 'draft';
      const matchesStatus =
        statusFilter === 'all' ? true : courseStatus === statusFilter;
      return matchesSearch && matchesLevel && matchesCategory && matchesStatus;
    });

    switch (sortBy) {
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case 'oldest':
        result.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case 'title':
        result.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
      case 'enrollments':
        result.sort(
          (a, b) => (b.totalInscritos || 0) - (a.totalInscritos || 0),
        );
        break;
    }
    return result;
  }, [courses, searchTerm, levelFilter, categoryFilter, sortBy, statusFilter]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
            <GraduationCap className='h-6 w-6 text-white' />
          </div>
          <div>
            <h1 className='text-3xl font-bold text-slate-900'>Cursos</h1>
            <p className='text-slate-500 text-sm'>
              {loading
                ? 'Carregando catálogo...'
                : `${courses.length} cursos no catálogo`}
            </p>
          </div>
        </div>

        <Button
          onClick={() => router.push('/admin/cursos/new')}
          className='bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'
        >
          <Plus className='h-4 w-4 mr-2' />
          Novo Curso
        </Button>
      </div>

      <Card className='bg-white border-slate-200 shadow-sm overflow-hidden'>
        <div className='p-5 border-b border-slate-200 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div className='relative w-full lg:max-w-sm'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
            <Input
              placeholder='Buscar cursos...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 border-slate-200'
            />
          </div>

          <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end lg:gap-4'>
            <div className='flex gap-1 rounded-lg bg-slate-100 p-1 w-fit'>
              {(
                [
                  { key: 'all', label: 'Todos' },
                  { key: 'published', label: 'Publicados' },
                  { key: 'draft', label: 'Rascunhos' },
                  { key: 'archived', label: 'Arquivados' },
                ] as const
              ).map((tab) => {
                const active = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type='button'
                    onClick={() => setStatusFilter(tab.key)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                      active
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:bg-white/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className='flex flex-wrap gap-3'>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className='w-40 border-slate-200 bg-white'>
                  <SelectValue placeholder='Nível' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Todos níveis</SelectItem>
                  <SelectItem value='basico'>Básico</SelectItem>
                  <SelectItem value='intermediario'>Intermediário</SelectItem>
                  <SelectItem value='avancado'>Avançado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className='w-44 border-slate-200 bg-white'>
                  <SelectValue placeholder='Categoria' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Todas categorias</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className='w-44 border-slate-200 bg-white'>
                  <SelectValue placeholder='Ordenar' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='newest'>Mais recentes</SelectItem>
                  <SelectItem value='oldest'>Mais antigos</SelectItem>
                  <SelectItem value='title'>Título A-Z</SelectItem>
                  <SelectItem value='enrollments'>Mais matrículas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className='p-10 flex items-center justify-center gap-2 text-slate-500'>
            <Loader2 className='h-4 w-4 animate-spin text-blue-600' />
            Carregando cursos...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className='p-16 text-center'>
            <div className='inline-flex p-4 rounded-full bg-slate-100 mb-4'>
              <GraduationCap className='h-10 w-10 text-slate-400' />
            </div>
            <h3 className='text-lg font-medium text-slate-700 mb-2'>
              {courses.length === 0
                ? 'Nenhum curso cadastrado'
                : 'Nenhum curso encontrado'}
            </h3>
            <p className='text-slate-500 mb-4'>
              {courses.length === 0
                ? 'Comece criando seu primeiro curso'
                : 'Ajuste sua busca ou filtros para ver mais resultados.'}
            </p>
            {courses.length === 0 && (
              <Button
                onClick={() => router.push('/admin/cursos/new')}
                className='bg-blue-600 hover:bg-blue-700'
              >
                <Plus className='h-4 w-4 mr-2' />
                Criar Curso
              </Button>
            )}
          </div>
        ) : (
          <Table className='min-w-[980px]'>
            <TableHeader>
              <TableRow className='bg-slate-50 hover:bg-slate-50'>
                <TableHead className='pl-6 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Curso
                </TableHead>
                <TableHead className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Categoria
                </TableHead>
                <TableHead className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Nível
                </TableHead>
                <TableHead className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Alunos
                </TableHead>
                <TableHead className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Status
                </TableHead>
                <TableHead className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Duração
                </TableHead>
                <TableHead className='pr-6 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredCourses.map((course) => {
                const level = levelConfig[course.nivel] || levelConfig.basico;
                const courseStatus = (course.status || 'draft') as Exclude<
                  StatusFilter,
                  'all'
                >;
                const status = statusConfig[courseStatus] || statusConfig.draft;
                const enrollments = course.totalInscritos || 0;
                return (
                  <TableRow key={course.id} className='hover:bg-slate-50'>
                    <TableCell className='pl-6'>
                      <div className='flex items-center gap-4'>
                        <div className='h-12 w-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0'>
                          {course.thumbnailUrl ? (
                            <img
                              src={course.thumbnailUrl}
                              alt={course.titulo}
                              className='h-full w-full object-cover'
                            />
                          ) : (
                            <div className='h-full w-full flex items-center justify-center'>
                              <ImageIcon className='h-6 w-6 text-slate-300' />
                            </div>
                          )}
                        </div>
                        <div className='min-w-0'>
                          <button
                            type='button'
                            className='text-left font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate max-w-[340px]'
                            onClick={() =>
                              router.push(`/admin/cursos/${course.id}`)
                            }
                          >
                            {course.titulo}
                          </button>
                          <p className='text-xs text-slate-500 mt-0.5'>
                            Criado em {formatDate(course.createdAt)}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className='inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10'>
                        {course.categoria}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${level.bgColor} ${level.color} ${level.borderColor}`}
                      >
                        {level.label}
                      </span>
                    </TableCell>

                    <TableCell className='text-sm text-slate-700'>
                      <div className='flex items-center gap-2'>
                        <Users className='h-4 w-4 text-slate-400' />
                        {enrollments}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium border ${status.pill}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                        />
                        {status.label}
                      </span>
                    </TableCell>

                    <TableCell className='text-sm text-slate-700'>
                      <div className='flex items-center gap-2'>
                        <Clock className='h-4 w-4 text-slate-400' />
                        {course.cargaHoraria} min
                      </div>
                    </TableCell>

                    <TableCell className='pr-6'>
                      <div className='flex items-center justify-end gap-1'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          title='Ver detalhes'
                          onClick={() =>
                            router.push(`/admin/cursos/${course.id}`)
                          }
                          className='text-slate-500 hover:text-blue-600'
                        >
                          <Eye className='h-4 w-4' />
                        </Button>

                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          title={
                            courseStatus === 'published'
                              ? 'Despublicar'
                              : 'Publicar'
                          }
                          disabled={togglingPublishId === course.id}
                          onClick={() => void handlePublishToggle(course)}
                          className='text-slate-500 hover:text-emerald-700'
                        >
                          {togglingPublishId === course.id ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : courseStatus === 'published' ? (
                            <XCircle className='h-4 w-4' />
                          ) : (
                            <CheckCircle2 className='h-4 w-4' />
                          )}
                        </Button>

                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          title='Excluir'
                          onClick={() =>
                            void handleDelete(course.id, course.titulo)
                          }
                          disabled={deleting === course.id}
                          className='text-slate-500 hover:text-red-600'
                        >
                          {deleting === course.id ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : (
                            <Trash2 className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {!loading && filteredCourses.length > 0 && (
        <p className='text-center text-sm text-slate-400'>
          Mostrando {filteredCourses.length} de {courses.length} cursos
        </p>
      )}
    </div>
  );
}
