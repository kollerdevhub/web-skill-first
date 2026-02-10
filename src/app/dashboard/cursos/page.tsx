'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GraduationCap,
  Clock,
  Play,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import { useMinhasInscricoes } from '@/hooks';
import Link from 'next/link';

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
  const { data: inscricoes, isLoading, error } = useMinhasInscricoes();

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
          <CardContent className='p-4 flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-red-600' />
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
        ) : inscricoes && inscricoes.length > 0 ? (
          inscricoes.map((inscricao) => {
            const curso = inscricao.curso;
            if (!curso) return null;

            return (
              <Card
                key={inscricao.id}
                className='group bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all shadow-sm'
              >
                <CardHeader>
                  {curso.thumbnailUrl ? (
                    <img
                      src={curso.thumbnailUrl}
                      alt={curso.titulo}
                      className='h-32 w-full object-cover rounded-lg mb-2'
                    />
                  ) : (
                    <div className='h-32 w-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-2 flex items-center justify-center'>
                      <BookOpen className='h-12 w-12 text-blue-400' />
                    </div>
                  )}
                  <CardTitle className='text-slate-900 group-hover:text-blue-600 transition-colors'>
                    {curso.titulo}
                  </CardTitle>
                  <CardDescription className='text-slate-500 flex items-center gap-2'>
                    <Clock className='h-3 w-3' />
                    {curso.totalModulos || 0} módulos
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Progress */}
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-slate-500'>Progresso</span>
                      <span className='text-blue-600 font-medium'>
                        {inscricao.progressoPercentual}%
                      </span>
                    </div>
                    <div className='w-full bg-slate-100 rounded-full h-2'>
                      <div
                        className='bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all'
                        style={{ width: `${inscricao.progressoPercentual}%` }}
                      />
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className='flex items-center justify-between'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        inscricao.status === 'concluido'
                          ? 'text-green-600 bg-green-50'
                          : 'text-blue-600 bg-blue-50'
                      }`}
                    >
                      {inscricao.status === 'concluido'
                        ? 'Concluído'
                        : 'Em andamento'}
                    </span>
                  </div>

                  <Link href={`/dashboard/cursos/${inscricao.cursoId}`}>
                    <Button className='w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'>
                      <Play className='h-4 w-4 mr-2' />
                      {inscricao.status === 'concluido'
                        ? 'Revisar'
                        : 'Continuar'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className='bg-slate-50 border-slate-200 col-span-full'>
            <CardContent className='p-8 text-center'>
              <GraduationCap className='h-12 w-12 text-slate-300 mx-auto mb-4' />
              <p className='text-slate-500 mb-4'>
                Você ainda não está inscrito em nenhum curso.
              </p>
              <Link href='/dashboard/explorar-cursos'>
                <Button className='bg-blue-600 hover:bg-blue-700'>
                  Explorar Cursos
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
