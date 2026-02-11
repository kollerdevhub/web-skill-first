'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CheckCircle2,
  Clock,
  Eye,
  GraduationCap,
  Image as ImageIcon,
  Layers,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cursosService } from '@/lib/api/services/cursos.service';
import { Curso, CursoNivel } from '@/lib/api/types';

type StatusFilter = 'all' | 'published' | 'draft' | 'archived';

const levelConfig: Record<
  CursoNivel | string,
  { label: string; classes: string }
> = {
  basico: {
    label: 'Básico',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  intermediario: {
    label: 'Intermediário',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  avancado: {
    label: 'Avançado',
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  beginner: {
    label: 'Iniciante',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  intermediate: {
    label: 'Intermediário',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  advanced: {
    label: 'Avançado',
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

const statusConfig: Record<
  Exclude<StatusFilter, 'all'>,
  { label: string; classes: string; dot: string }
> = {
  published: {
    label: 'Publicado',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  draft: {
    label: 'Rascunho',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  archived: {
    label: 'Arquivado',
    classes: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [courseToToggle, setCourseToToggle] = useState<Curso | null>(null);
  const { toast } = useToast();
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

  function handleDeleteClick(id: string, title: string) {
    setCourseToDelete({ id, title });
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!courseToDelete) return;
    setDeleting(courseToDelete.id);
    try {
      await cursosService.delete(courseToDelete.id);
      setCourses((current) =>
        current.filter((c) => c.id !== courseToDelete.id),
      );
      toast({
        title: 'Curso excluído',
        description: `O curso "${courseToDelete.title}" foi removido.`,
      });
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir curso. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  }

  function getPublishBlockReason(course: Curso): string | null {
    const isPublished = (course.status || 'draft') === 'published';
    if (isPublished) return null;
    if (!course.thumbnailUrl)
      return 'Adicione uma capa para publicar este curso.';
    if ((course.totalModulos || 0) <= 0)
      return 'Adicione pelo menos uma aula para publicar.';
    return null;
  }

  function handlePublishClick(course: Curso) {
    const reason = getPublishBlockReason(course);
    if (reason) {
      toast({
        title: 'Curso ainda não pode ser publicado',
        description: reason,
        variant: 'destructive',
      });
      return;
    }
    setCourseToToggle(course);
    setPublishDialogOpen(true);
  }

  async function confirmPublishToggle() {
    if (!courseToToggle) return;
    const publishing = courseToToggle.status !== 'published';

    setTogglingPublishId(courseToToggle.id);
    try {
      if (publishing) {
        await cursosService.publish(courseToToggle.id);
      } else {
        await cursosService.unpublish(courseToToggle.id);
      }

      setCourses((current) =>
        current.map((c) =>
          c.id === courseToToggle.id
            ? { ...c, status: publishing ? 'published' : 'draft' }
            : c,
        ),
      );
      toast({
        title: publishing ? 'Curso publicado' : 'Curso despublicado',
        description: `O curso "${courseToToggle.titulo}" foi ${
          publishing ? 'publicado' : 'despublicado'
        } com sucesso.`,
      });
    } catch (e) {
      toast({
        title: 'Erro',
        description:
          e instanceof Error ? e.message : 'Falha ao atualizar status do curso',
        variant: 'destructive',
      });
    } finally {
      setTogglingPublishId(null);
      setPublishDialogOpen(false);
      setCourseToToggle(null);
    }
  }

  const categories = useMemo(() => {
    const cats = new Set(courses.map((c) => c.categoria));
    return Array.from(cats).sort();
  }, [courses]);

  const stats = useMemo(() => {
    return {
      total: courses.length,
      published: courses.filter((c) => c.status === 'published').length,
      draft: courses.filter((c) => c.status !== 'published').length,
      totalAlunos: courses.reduce((s, c) => s + (c.totalInscritos || 0), 0),
    };
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
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='flex items-center gap-3'>
          <div className='p-2.5 rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20'>
            <GraduationCap className='h-6 w-6 text-primary-foreground' />
          </div>
          <div>
            <h1 className='text-3xl font-bold text-foreground'>Cursos</h1>
            <p className='text-muted-foreground text-sm'>
              {loading
                ? 'Carregando catálogo...'
                : `${courses.length} cursos no catálogo`}
            </p>
          </div>
        </div>

        <Button onClick={() => router.push('/admin/cursos/new')}>
          <Plus className='h-4 w-4 mr-2' />
          Novo Curso
        </Button>
      </div>

      {/* Stats */}
      {!loading && courses.length > 0 && (
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='p-4 flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-primary/10'>
                <Layers className='h-5 w-5 text-primary' />
              </div>
              <div>
                <p className='text-2xl font-bold'>{stats.total}</p>
                <p className='text-xs text-muted-foreground'>Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-emerald-100'>
                <CheckCircle2 className='h-5 w-5 text-emerald-600' />
              </div>
              <div>
                <p className='text-2xl font-bold'>{stats.published}</p>
                <p className='text-xs text-muted-foreground'>Publicados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-amber-100'>
                <Clock className='h-5 w-5 text-amber-600' />
              </div>
              <div>
                <p className='text-2xl font-bold'>{stats.draft}</p>
                <p className='text-xs text-muted-foreground'>Rascunhos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-blue-100'>
                <Users className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-2xl font-bold'>{stats.totalAlunos}</p>
                <p className='text-xs text-muted-foreground'>Alunos total</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters + Table Card */}
      <Card className='overflow-hidden'>
        <div className='p-5 border-b flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div className='relative w-full lg:max-w-sm'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Buscar cursos...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>

          <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end lg:gap-4'>
            {/* Status tabs */}
            <div className='flex gap-1 rounded-lg bg-muted p-1 w-fit'>
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
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className='flex flex-wrap gap-3'>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className='w-40'>
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
                <SelectTrigger className='w-44'>
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
                <SelectTrigger className='w-44'>
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
          <div className='p-10 flex items-center justify-center gap-2 text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin text-primary' />
            Carregando cursos...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className='p-16 text-center'>
            <div className='inline-flex p-4 rounded-full bg-muted mb-4'>
              <GraduationCap className='h-10 w-10 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-medium text-foreground mb-2'>
              {courses.length === 0
                ? 'Nenhum curso cadastrado'
                : 'Nenhum curso encontrado'}
            </h3>
            <p className='text-muted-foreground mb-4'>
              {courses.length === 0
                ? 'Comece criando seu primeiro curso'
                : 'Ajuste sua busca ou filtros para ver mais resultados.'}
            </p>
            {courses.length === 0 && (
              <Button onClick={() => router.push('/admin/cursos/new')}>
                <Plus className='h-4 w-4 mr-2' />
                Criar Curso
              </Button>
            )}
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/50 hover:bg-muted/50'>
                  <TableHead className='pl-6 text-xs font-semibold uppercase tracking-wide'>
                    Curso
                  </TableHead>
                  <TableHead className='text-xs font-semibold uppercase tracking-wide'>
                    Categoria
                  </TableHead>
                  <TableHead className='text-xs font-semibold uppercase tracking-wide'>
                    Nível
                  </TableHead>
                  <TableHead className='text-xs font-semibold uppercase tracking-wide'>
                    Alunos
                  </TableHead>
                  <TableHead className='text-xs font-semibold uppercase tracking-wide'>
                    Status
                  </TableHead>
                  <TableHead className='text-xs font-semibold uppercase tracking-wide'>
                    Duração
                  </TableHead>
                  <TableHead className='pr-6 text-right text-xs font-semibold uppercase tracking-wide'>
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
                  const status =
                    statusConfig[courseStatus] || statusConfig.draft;
                  const enrollments = course.totalInscritos || 0;
                  const publishBlockReason = getPublishBlockReason(course);

                  return (
                    <TableRow key={course.id}>
                      <TableCell className='pl-6'>
                        <div className='flex items-center gap-4'>
                          <div className='h-12 w-20 rounded-lg overflow-hidden border bg-muted shrink-0'>
                            {course.thumbnailUrl ? (
                              <img
                                src={course.thumbnailUrl}
                                alt={course.titulo}
                                className='h-full w-full object-cover'
                              />
                            ) : (
                              <div className='h-full w-full flex items-center justify-center'>
                                <ImageIcon className='h-6 w-6 text-muted-foreground/30' />
                              </div>
                            )}
                          </div>
                          <div className='min-w-0'>
                            <button
                              type='button'
                              className='text-left font-semibold text-foreground hover:text-primary transition-colors truncate max-w-[340px] block'
                              onClick={() =>
                                router.push(`/admin/cursos/${course.id}`)
                              }
                            >
                              {course.titulo}
                            </button>
                            <p className='text-xs text-muted-foreground mt-0.5'>
                              Criado em {formatDate(course.createdAt)}
                            </p>
                            {publishBlockReason ? (
                              <p className='text-[11px] text-amber-700 mt-1'>
                                {publishBlockReason}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant='secondary'>{course.categoria}</Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant='outline' className={level.classes}>
                          {level.label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className='flex items-center gap-2 text-sm'>
                          <Users className='h-4 w-4 text-muted-foreground' />
                          {enrollments}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant='outline' className={status.classes}>
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dot} mr-1.5`}
                          />
                          {status.label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <Clock className='h-4 w-4' />
                          {course.cargaHoraria}h
                        </div>
                      </TableCell>

                      <TableCell className='pr-6 text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/cursos/${course.id}`)
                              }
                            >
                              <Eye className='h-4 w-4 mr-2' />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handlePublishClick(course)}
                              disabled={togglingPublishId === course.id}
                            >
                              {courseStatus === 'published' ? (
                                <>
                                  <XCircle className='h-4 w-4 mr-2' />
                                  Despublicar
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className='h-4 w-4 mr-2' />
                                  Publicar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className='text-destructive focus:text-destructive'
                              onClick={() =>
                                handleDeleteClick(course.id, course.titulo)
                              }
                              disabled={deleting === course.id}
                            >
                              <Trash2 className='h-4 w-4 mr-2' />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {!loading && filteredCourses.length > 0 && (
        <p className='text-center text-sm text-muted-foreground'>
          Mostrando {filteredCourses.length} de {courses.length} cursos
        </p>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir curso</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o curso &quot;
              {courseToDelete?.title}&quot;? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant='destructive'
              onClick={confirmDelete}
              disabled={!!deleting}
            >
              {deleting ? (
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              ) : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {courseToToggle?.status === 'published'
                ? 'Despublicar curso'
                : 'Publicar curso'}
            </DialogTitle>
            <DialogDescription>
              {courseToToggle?.status === 'published'
                ? `Tem certeza que deseja despublicar o curso "${courseToToggle?.titulo}"? Ele deixará de ser visível para os alunos.`
                : `Tem certeza que deseja publicar o curso "${courseToToggle?.titulo}"? Ele ficará visível para os alunos.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setPublishDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmPublishToggle}
              disabled={!!togglingPublishId}
            >
              {togglingPublishId ? (
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              ) : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
