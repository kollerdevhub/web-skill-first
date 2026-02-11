'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GraduationCap,
  Clock,
  Play,
  BookOpen,
  AlertCircle,
  Trophy,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { useMinhasInscricoes } from '@/hooks';
import Link from 'next/link';
import { useMemo } from 'react';

function CourseCardSkeleton() {
  return (
    <Card>
      <div className='h-44 bg-muted animate-pulse rounded-t-lg' />
      <CardContent className='p-5 space-y-3'>
        <Skeleton className='h-5 w-3/4' />
        <Skeleton className='h-4 w-1/2' />
        <Skeleton className='h-2 w-full rounded-full' />
        <Skeleton className='h-10 w-full rounded-md' />
      </CardContent>
    </Card>
  );
}

export default function CursosPage() {
  const { data: inscricoes, isLoading, error } = useMinhasInscricoes();

  const stats = useMemo(() => {
    if (!inscricoes) return { total: 0, emAndamento: 0, concluidos: 0 };
    return {
      total: inscricoes.length,
      emAndamento: inscricoes.filter((i) => i.status !== 'concluido').length,
      concluidos: inscricoes.filter((i) => i.status === 'concluido').length,
    };
  }, [inscricoes]);

  // Most recently accessed course (for hero card)
  const mostRecent = useMemo(() => {
    if (!inscricoes || inscricoes.length === 0) return null;
    const inProgress = inscricoes
      .filter((i) => i.status !== 'concluido')
      .sort(
        (a, b) =>
          new Date(b.ultimoAcesso || b.dataInscricao).getTime() -
          new Date(a.ultimoAcesso || a.dataInscricao).getTime(),
      );
    return inProgress[0] || null;
  }, [inscricoes]);

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <div className='p-2.5 rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20'>
          <GraduationCap className='h-6 w-6 text-primary-foreground' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Meus Cursos</h1>
          <p className='text-muted-foreground text-sm'>
            Continue sua jornada de aprendizado
          </p>
        </div>
      </div>

      {error && (
        <Card className='bg-destructive/10 border-destructive/30'>
          <CardContent className='p-4 flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-destructive' />
            <p className='text-destructive'>
              Erro ao carregar cursos. Tente novamente.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Bar */}
      {!isLoading && inscricoes && inscricoes.length > 0 && (
        <div className='grid grid-cols-3 gap-4'>
          <Card>
            <CardContent className='p-4 flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-primary/10'>
                <Layers className='h-5 w-5 text-primary' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {stats.total}
                </p>
                <p className='text-xs text-muted-foreground'>Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-blue-100'>
                <Play className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {stats.emAndamento}
                </p>
                <p className='text-xs text-muted-foreground'>Em andamento</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-emerald-100'>
                <Trophy className='h-5 w-5 text-emerald-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {stats.concluidos}
                </p>
                <p className='text-xs text-muted-foreground'>Concluídos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Continue Hero Card */}
      {mostRecent && mostRecent.curso && (
        <Card className='overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent shadow-md shadow-primary/5 ring-1 ring-primary/10'>
          <CardContent className='p-0'>
            <div className='flex flex-col sm:flex-row'>
              <div className='sm:w-48 h-32 sm:h-auto bg-muted shrink-0'>
                {mostRecent.curso.thumbnailUrl ? (
                  <img
                    src={mostRecent.curso.thumbnailUrl}
                    alt={mostRecent.curso.titulo}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5'>
                    <BookOpen className='h-10 w-10 text-primary/40' />
                  </div>
                )}
              </div>
              <div className='flex-1 p-5 flex flex-col justify-center gap-3'>
                <div>
                  <p className='text-xs font-medium text-primary uppercase tracking-wider'>
                    Continuar de onde parou
                  </p>
                  <h3 className='text-lg font-bold text-foreground mt-1'>
                    {mostRecent.curso.titulo}
                  </h3>
                </div>
                <div className='flex items-center gap-3'>
                  <Progress
                    value={mostRecent.progressoPercentual}
                    className='flex-1 h-2.5'
                  />
                  <span className='text-sm font-bold text-primary'>
                    {mostRecent.progressoPercentual}%
                  </span>
                </div>
                <Link href={`/dashboard/cursos/${mostRecent.cursoId}`}>
                  <Button>
                    <Play className='h-4 w-4 mr-2' />
                    Continuar
                    <ArrowRight className='h-4 w-4 ml-2' />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Grid */}
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

            const isCompleted = inscricao.status === 'concluido';

            return (
              <Link
                key={inscricao.id}
                href={`/dashboard/cursos/${inscricao.cursoId}`}
              >
                <Card className='group h-full hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 hover:ring-1 hover:ring-primary/10 transition-all duration-300 cursor-pointer overflow-hidden'>
                  {/* Thumbnail */}
                  <div className='relative h-44 bg-muted overflow-hidden'>
                    {curso.thumbnailUrl ? (
                      <img
                        src={curso.thumbnailUrl}
                        alt={curso.titulo}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5'>
                        <BookOpen className='h-14 w-14 text-primary/30' />
                      </div>
                    )}
                    {/* Status Badge overlay */}
                    <div className='absolute top-3 right-3'>
                      <Badge
                        className={
                          isCompleted
                            ? 'bg-emerald-500 text-white hover:bg-emerald-500'
                            : 'bg-primary text-primary-foreground hover:bg-primary'
                        }
                      >
                        {isCompleted ? (
                          <>
                            <Trophy className='h-3 w-3 mr-1' /> Concluído
                          </>
                        ) : (
                          'Em andamento'
                        )}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className='p-5 space-y-4'>
                    <div>
                      <h3 className='font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2'>
                        {curso.titulo}
                      </h3>
                      <div className='flex items-center gap-2 mt-2'>
                        <Badge variant='secondary'>{curso.categoria}</Badge>
                        <span className='text-xs text-muted-foreground flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          {curso.cargaHoraria}h
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className='space-y-1.5'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-muted-foreground'>Progresso</span>
                        <span className='font-bold text-primary'>
                          {inscricao.progressoPercentual}%
                        </span>
                      </div>
                      <Progress value={inscricao.progressoPercentual} />
                    </div>

                    <Button
                      className='w-full'
                      variant={isCompleted ? 'outline' : 'default'}
                    >
                      <Play className='h-4 w-4 mr-2' />
                      {isCompleted ? 'Revisar' : 'Continuar'}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        ) : (
          <Card className='col-span-full border-dashed'>
            <CardContent className='p-14 text-center'>
              <div className='inline-flex p-4 rounded-full bg-primary/5 mb-4'>
                <GraduationCap className='h-10 w-10 text-primary/40' />
              </div>
              <h3 className='text-lg font-semibold text-foreground mb-2'>
                Nenhum curso ainda
              </h3>
              <p className='text-muted-foreground mb-6'>
                Você ainda não está inscrito em nenhum curso.
              </p>
              <Link href='/dashboard/explorar-cursos'>
                <Button className='shadow-md shadow-primary/20'>
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
