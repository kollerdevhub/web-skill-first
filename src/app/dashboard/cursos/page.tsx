'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, Clock, User, Play } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  instructor: string;
}

const fetchCourses = async (): Promise<Course[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: '1',
      title: 'React Avançado',
      description: 'Domine hooks, context, e padrões avançados do React',
      thumbnail: '📘',
      duration: 12,
      instructor: 'João Silva',
    },
    {
      id: '2',
      title: 'Node.js do Zero ao Deploy',
      description: 'Construa APIs RESTful profissionais com Node.js',
      thumbnail: '📗',
      duration: 15,
      instructor: 'Maria Santos',
    },
    {
      id: '3',
      title: 'TypeScript Completo',
      description: 'Tipagem avançada e boas práticas com TypeScript',
      thumbnail: '📙',
      duration: 10,
      instructor: 'Pedro Costa',
    },
    {
      id: '4',
      title: 'Next.js na Prática',
      description: 'Construa aplicações full-stack com Next.js',
      thumbnail: '📕',
      duration: 8,
      instructor: 'Ana Lima',
    },
    {
      id: '5',
      title: 'Docker e Kubernetes',
      description: 'Containerização e orquestração de aplicações',
      thumbnail: '📓',
      duration: 14,
      instructor: 'Carlos Mendes',
    },
    {
      id: '6',
      title: 'AWS para Desenvolvedores',
      description: 'Deploy e infraestrutura na nuvem com AWS',
      thumbnail: '📔',
      duration: 16,
      instructor: 'Lucia Ferreira',
    },
  ];
};

function CourseCardSkeleton() {
  return (
    <Card className='bg-white border-slate-200'>
      <CardHeader>
        <Skeleton className='h-12 w-12 rounded bg-slate-100' />
        <Skeleton className='h-5 w-3/4 bg-slate-100' />
      </CardHeader>
      <CardContent className='space-y-3'>
        <Skeleton className='h-4 w-full bg-slate-100' />
        <Skeleton className='h-4 w-2/3 bg-slate-100' />
        <Skeleton className='h-10 w-full bg-slate-100' />
      </CardContent>
    </Card>
  );
}

export default function CursosPage() {
  const {
    data: courses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
          <GraduationCap className='h-6 w-6 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Meus Cursos</h1>
          <p className='text-slate-500 text-sm'>
            Continue sua jornada de aprendizado
          </p>
        </div>
      </div>

      {error && (
        <Card className='bg-red-50 border-red-200'>
          <CardContent className='p-4'>
            <p className='text-red-600'>
              Erro ao carregar cursos. Tente novamente.
            </p>
          </CardContent>
        </Card>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {isLoading ? (
          <>
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </>
        ) : (
          courses?.map((course) => (
            <Card
              key={course.id}
              className='group bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all shadow-sm'
            >
              <CardHeader>
                <div className='text-5xl mb-2'>{course.thumbnail}</div>
                <CardTitle className='text-slate-900 group-hover:text-blue-600 transition-colors'>
                  {course.title}
                </CardTitle>
                <CardDescription className='text-slate-500 flex items-center gap-2'>
                  <User className='h-3 w-3' />
                  {course.instructor}
                  <span className='text-slate-300'>•</span>
                  <Clock className='h-3 w-3' />
                  {course.duration}h
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-slate-600 text-sm'>{course.description}</p>
                <Button className='w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'>
                  <Play className='h-4 w-4 mr-2' />
                  Acessar Curso
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
