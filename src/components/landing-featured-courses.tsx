'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useCursos } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  TrendingUp,
  Users,
} from 'lucide-react';

const levelLabel: Record<string, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

function CourseCardSkeleton() {
  return (
    <div>
      <Skeleton className='h-40 rounded-xl mb-4' />
      <Skeleton className='h-5 w-3/4 mb-2' />
      <Skeleton className='h-4 w-2/3' />
    </div>
  );
}

export function LandingFeaturedCourses() {
  const { data, isLoading, error } = useCursos({
    page: 1,
    limit: 12,
    publishedOnly: true,
  });

  const featuredCourses = useMemo(() => {
    const courses = data?.data ?? [];
    const published = courses.filter(
      (course) => course.status === 'published' || course.ativo,
    );
    const source = published.length > 0 ? published : courses;
    return source.slice(0, 3);
  }, [data?.data]);

  return (
    <section className='container mx-auto px-4 py-20'>
      <div className='flex flex-col md:flex-row justify-between items-center mb-10'>
        <div>
          <h2 className='text-3xl font-bold text-slate-900 mb-2'>
            Cursos em Destaque
          </h2>
          <p className='text-slate-600'>Conteúdo real vindo da plataforma</p>
        </div>
        <Link href='/cursos'>
          <Button variant='ghost' className='text-blue-600'>
            Ver todos os cursos <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </Link>
      </div>

      {error ? (
        <Card className='bg-red-50 border-red-200'>
          <CardContent className='p-4 flex items-center gap-2 text-red-700'>
            <AlertCircle className='h-5 w-5' />
            Não foi possível carregar os cursos no momento.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className='grid md:grid-cols-3 gap-6'>
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </div>
      ) : featuredCourses.length > 0 ? (
        <div className='grid md:grid-cols-3 gap-6'>
          {featuredCourses.map((course) => (
            <div key={course.id} className='group cursor-pointer'>
              <div className='h-40 rounded-xl bg-slate-100 mb-4 overflow-hidden'>
                {course.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.thumbnailUrl}
                    alt={course.titulo}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-slate-400'>
                    <TrendingUp className='h-10 w-10 opacity-50' />
                  </div>
                )}
              </div>
              <h3 className='font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2'>
                {course.titulo}
              </h3>
              <div className='flex items-center gap-4 mt-2 text-sm text-slate-500'>
                <span className='flex items-center gap-1'>
                  <Users className='h-4 w-4' /> {course.totalInscritos || 0}{' '}
                  alunos
                </span>
                <span className='flex items-center gap-1'>
                  <Award className='h-4 w-4' />{' '}
                  {levelLabel[course.nivel] || course.nivel}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className='bg-slate-50 border-slate-200'>
          <CardContent className='p-10 text-center text-slate-500'>
            <BookOpen className='h-10 w-10 mx-auto mb-3 text-slate-300' />
            Nenhum curso disponível no momento.
          </CardContent>
        </Card>
      )}
    </section>
  );
}
