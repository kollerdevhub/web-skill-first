'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import {
  Play,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  Trash2,
  Eye,
  Video,
  Image as ImageIcon,
  GraduationCap,
  BarChart3,
  Calendar,
  Sparkles,
  Layers,
  Loader2,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: number;
  imageUrl: string | null;
  videoUrl: string | null;
  videoPublicId: string | null;
  createdAt: string;
  _count?: { enrollments: number };
}

const levelConfig: Record<
  string,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
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

export default function AdminCursosPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const res = await fetch('/api/admin/courses');
      const data = await res.json();
      setCourses(data);
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
      await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      setCourses(courses.filter((c) => c.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  const stats = useMemo(
    () => ({
      total: courses.length,
      withVideo: courses.filter((c) => c.videoUrl).length,
      totalEnrollments: courses.reduce(
        (acc, c) => acc + (c._count?.enrollments || 0),
        0,
      ),
      totalDuration: courses.reduce((acc, c) => acc + c.duration, 0),
    }),
    [courses],
  );

  const categories = useMemo(() => {
    const cats = new Set(courses.map((c) => c.category));
    return Array.from(cats).sort();
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const result = courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel =
        levelFilter === 'all' || course.level === levelFilter;
      const matchesCategory =
        categoryFilter === 'all' || course.category === categoryFilter;
      return matchesSearch && matchesLevel && matchesCategory;
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
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'enrollments':
        result.sort(
          (a, b) => (b._count?.enrollments || 0) - (a._count?.enrollments || 0),
        );
        break;
    }
    return result;
  }, [courses, searchTerm, levelFilter, categoryFilter, sortBy]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
            <GraduationCap className='h-6 w-6 text-white' />
          </div>
          <div>
            <h1 className='text-3xl font-bold text-slate-900'>Cursos</h1>
            <p className='text-slate-500 text-sm'>
              Gerencie os cursos da plataforma
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

      {/* Stats */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-slate-900'>
                  {stats.total}
                </p>
                <p className='text-sm text-slate-500'>Total</p>
              </div>
              <div className='p-3 rounded-xl bg-blue-50'>
                <Layers className='h-5 w-5 text-blue-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-slate-900'>
                  {stats.withVideo}
                </p>
                <p className='text-sm text-slate-500'>Com Vídeo</p>
              </div>
              <div className='p-3 rounded-xl bg-emerald-50'>
                <Video className='h-5 w-5 text-emerald-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-slate-900'>
                  {stats.totalEnrollments}
                </p>
                <p className='text-sm text-slate-500'>Matrículas</p>
              </div>
              <div className='p-3 rounded-xl bg-amber-50'>
                <Users className='h-5 w-5 text-amber-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-slate-900'>
                  {Math.round(stats.totalDuration / 60)}h
                </p>
                <p className='text-sm text-slate-500'>Conteúdo</p>
              </div>
              <div className='p-3 rounded-xl bg-rose-50'>
                <Clock className='h-5 w-5 text-rose-500' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className='bg-white border-slate-200 shadow-sm'>
        <CardContent className='p-4'>
          <div className='flex flex-col lg:flex-row gap-4'>
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
              <Input
                placeholder='Buscar cursos...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 border-slate-200'
              />
            </div>
            <div className='flex flex-wrap gap-3'>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className='w-40 border-slate-200'>
                  <Filter className='h-4 w-4 mr-2 text-slate-400' />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Todos níveis</SelectItem>
                  <SelectItem value='beginner'>Iniciante</SelectItem>
                  <SelectItem value='intermediate'>Intermediário</SelectItem>
                  <SelectItem value='advanced'>Avançado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className='w-44 border-slate-200'>
                  <Sparkles className='h-4 w-4 mr-2 text-slate-400' />
                  <SelectValue />
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
                <SelectTrigger className='w-40 border-slate-200'>
                  <BarChart3 className='h-4 w-4 mr-2 text-slate-400' />
                  <SelectValue />
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
        </CardContent>
      </Card>

      {/* Courses Grid */}
      {loading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              className='bg-white border-slate-200 overflow-hidden animate-pulse'
            >
              <div className='aspect-video bg-slate-100' />
              <CardContent className='p-4 space-y-3'>
                <div className='h-5 bg-slate-100 rounded w-3/4' />
                <div className='h-4 bg-slate-100 rounded w-1/2' />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card className='bg-white border-slate-200'>
          <CardContent className='p-16 text-center'>
            <div className='inline-flex p-4 rounded-full bg-slate-100 mb-4'>
              <GraduationCap className='h-10 w-10 text-slate-400' />
            </div>
            <h3 className='text-lg font-medium text-slate-700 mb-2'>
              {courses.length === 0
                ? 'Nenhum curso cadastrado'
                : 'Nenhum curso encontrado'}
            </h3>
            <p className='text-slate-500 mb-4'>
              Começe criando seu primeiro curso
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
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredCourses.map((course) => {
            const level = levelConfig[course.level] || levelConfig.beginner;
            return (
              <Card
                key={course.id}
                className='group bg-white border-slate-200 overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all shadow-sm'
              >
                <div className='aspect-video bg-slate-100 relative overflow-hidden'>
                  {course.imageUrl ? (
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <ImageIcon className='h-12 w-12 text-slate-300' />
                    </div>
                  )}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                  {course.videoUrl && (
                    <button
                      onClick={() => router.push(`/admin/cursos/${course.id}`)}
                      className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all'
                    >
                      <div className='p-4 rounded-full bg-blue-600 shadow-xl transform scale-90 group-hover:scale-100 transition-transform'>
                        <Play className='h-8 w-8 text-white fill-white' />
                      </div>
                    </button>
                  )}
                  <div className='absolute top-3 left-3 flex gap-2'>
                    {course.videoUrl && (
                      <span className='px-2 py-1 rounded-full bg-blue-600 text-white text-xs font-medium flex items-center gap-1'>
                        <Video className='h-3 w-3' />
                        Vídeo
                      </span>
                    )}
                  </div>
                  <div className='absolute bottom-3 right-3'>
                    <span className='px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1'>
                      <Clock className='h-3 w-3' />
                      {course.duration} min
                    </span>
                  </div>
                </div>
                <CardContent className='p-4 space-y-3'>
                  <h3 className='font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors'>
                    {course.title}
                  </h3>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-200'>
                      {course.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${level.bgColor} ${level.color} ${level.borderColor}`}
                    >
                      {level.label}
                    </span>
                  </div>
                  <p className='text-sm text-slate-500 line-clamp-2'>
                    {course.description}
                  </p>
                  <div className='flex items-center gap-4 text-xs text-slate-400'>
                    <span className='flex items-center gap-1'>
                      <Users className='h-3.5 w-3.5' />
                      {course._count?.enrollments || 0} alunos
                    </span>
                    <span className='flex items-center gap-1'>
                      <Calendar className='h-3.5 w-3.5' />
                      {formatDate(course.createdAt)}
                    </span>
                  </div>
                  <div className='flex gap-2 pt-2'>
                    <Button
                      size='sm'
                      onClick={() => router.push(`/admin/cursos/${course.id}`)}
                      className='flex-1 bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white'
                    >
                      <Eye className='h-3.5 w-3.5 mr-1.5' />
                      Ver detalhes
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleDelete(course.id, course.title)}
                      disabled={deleting === course.id}
                      className='border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                    >
                      {deleting === course.id ? (
                        <Loader2 className='h-3.5 w-3.5 animate-spin' />
                      ) : (
                        <Trash2 className='h-3.5 w-3.5' />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {filteredCourses.length > 0 && (
        <p className='text-center text-sm text-slate-400'>
          Mostrando {filteredCourses.length} de {courses.length} cursos
        </p>
      )}
    </div>
  );
}
