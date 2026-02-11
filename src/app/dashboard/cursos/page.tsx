'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers,
  Play,
  Sparkles,
  Trophy,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useMinhasInscricoes } from '@/hooks';
import Link from 'next/link';
import { useMemo, useState } from 'react';

function CourseCardSkeleton() {
  return (
    <Card className='overflow-hidden'>
      <div className='h-44 bg-muted animate-pulse rounded-t-lg' />
      <CardHeader className='pb-3'>
        <Skeleton className='h-5 w-3/4' />
        <Skeleton className='h-4 w-1/2' />
      </CardHeader>
      <CardContent className='space-y-3'>
        <Skeleton className='h-2 w-full rounded-full' />
        <Skeleton className='h-3 w-1/3 rounded-md' />
      </CardContent>
      <CardFooter>
        <Skeleton className='h-10 w-full rounded-md' />
      </CardFooter>
    </Card>
  );
}

type CourseFilter = 'all' | 'in_progress' | 'completed';

function clampProgress(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function formatLastAccess(value?: string) {
  if (!value) return 'Sem acesso recente';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sem acesso recente';

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function CursosPage() {
  const { data: inscricoes, isLoading, error } = useMinhasInscricoes();
  const [filter, setFilter] = useState<CourseFilter>('all');

  const validInscricoes = useMemo(
    () => (inscricoes || []).filter((inscricao) => !!inscricao.curso),
    [inscricoes],
  );
  const missingCoursesCount = useMemo(
    () =>
      (inscricoes || []).filter((inscricao) => !inscricao.curso).length,
    [inscricoes],
  );

  const stats = useMemo(() => {
    if (!validInscricoes.length) {
      return {
        total: 0,
        emAndamento: 0,
        concluidos: 0,
        totalHoras: 0,
        mediaProgresso: 0,
      };
    }

    const progressoTotal = validInscricoes.reduce(
      (sum, item) => sum + clampProgress(item.progressoPercentual || 0),
      0,
    );

    return {
      total: validInscricoes.length,
      emAndamento: validInscricoes.filter((i) => i.status !== 'concluido')
        .length,
      concluidos: validInscricoes.filter((i) => i.status === 'concluido')
        .length,
      totalHoras: validInscricoes.reduce(
        (sum, item) => sum + (item.curso?.cargaHoraria || 0),
        0,
      ),
      mediaProgresso: Math.round(progressoTotal / validInscricoes.length),
    };
  }, [validInscricoes]);

  const mostRecent = useMemo(() => {
    if (validInscricoes.length === 0) return null;
    const inProgress = validInscricoes
      .filter((i) => i.status !== 'concluido')
      .sort(
        (a, b) =>
          new Date(b.ultimoAcesso || b.dataInscricao).getTime() -
          new Date(a.ultimoAcesso || a.dataInscricao).getTime(),
      );
    return inProgress[0] || null;
  }, [validInscricoes]);

  const filteredInscricoes = useMemo(() => {
    const sorted = [...validInscricoes].sort(
      (a, b) =>
        new Date(b.ultimoAcesso || b.dataInscricao).getTime() -
        new Date(a.ultimoAcesso || a.dataInscricao).getTime(),
    );

    if (filter === 'completed') {
      return sorted.filter((item) => item.status === 'concluido');
    }

    if (filter === 'in_progress') {
      return sorted.filter((item) => item.status !== 'concluido');
    }

    return sorted;
  }, [filter, validInscricoes]);

  return (
    <div className='space-y-8'>
      <Card className='overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background shadow-sm'>
        <CardContent className='p-6 md:p-7'>
          <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='p-2.5 rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20'>
                  <GraduationCap className='h-6 w-6 text-primary-foreground' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-foreground'>
                    Meus Cursos
                  </h1>
                  <p className='text-muted-foreground text-sm'>
                    Continue sua jornada de aprendizado com ritmo e constância.
                  </p>
                </div>
              </div>

              {!isLoading && validInscricoes.length > 0 && (
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge variant='secondary' className='h-7'>
                    <Layers className='h-3.5 w-3.5 mr-1.5' />
                    {stats.total} cursos
                  </Badge>
                  <Badge variant='outline' className='h-7'>
                    <Clock className='h-3.5 w-3.5 mr-1.5' />
                    {stats.totalHoras}h acumuladas
                  </Badge>
                  <Badge variant='outline' className='h-7'>
                    <TrendingUp className='h-3.5 w-3.5 mr-1.5' />
                    {stats.mediaProgresso}% de progresso médio
                  </Badge>
                </div>
              )}
            </div>

            <div className='flex flex-wrap gap-2'>
              <Link href='/dashboard/explorar-cursos'>
                <Button variant='outline'>Explorar mais cursos</Button>
              </Link>
              <Link href='/dashboard/certificados'>
                <Button>
                  Ver certificados
                  <ArrowRight className='h-4 w-4 ml-2' />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {!isLoading && missingCoursesCount > 0 && (
        <Card className='bg-amber-50 border-amber-200'>
          <CardContent className='p-4 flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-amber-700' />
            <p className='text-amber-800 text-sm'>
              {missingCoursesCount} inscrição(ões) foram ocultadas porque o
              curso não existe mais ou está indisponível.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && validInscricoes.length > 0 && (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
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

          <Card>
            <CardContent className='p-4 flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-amber-100'>
                <Sparkles className='h-5 w-5 text-amber-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>
                  {stats.mediaProgresso}%
                </p>
                <p className='text-xs text-muted-foreground'>Média de progresso</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                    <p className='text-xs text-muted-foreground mt-1'>
                      Último acesso em {formatLastAccess(mostRecent.ultimoAcesso)}
                    </p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Progress
                      value={clampProgress(mostRecent.progressoPercentual || 0)}
                      className='flex-1 h-2.5'
                    />
                    <span className='text-sm font-bold text-primary'>
                      {clampProgress(mostRecent.progressoPercentual || 0)}%
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

      {!isLoading && validInscricoes.length > 0 && (
        <div className='flex items-center justify-between gap-3'>
          <Tabs
            value={filter}
            onValueChange={(value) => setFilter(value as CourseFilter)}
          >
            <TabsList className='grid w-full grid-cols-3 sm:w-[420px]'>
              <TabsTrigger value='all'>Todos ({stats.total})</TabsTrigger>
              <TabsTrigger value='in_progress'>
                Em andamento ({stats.emAndamento})
              </TabsTrigger>
              <TabsTrigger value='completed'>
                Concluídos ({stats.concluidos})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
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
        ) : filteredInscricoes.length > 0 ? (
          filteredInscricoes.map((inscricao) => {
            const curso = inscricao.curso;
            if (!curso) return null;

            const isCompleted = inscricao.status === 'concluido';
            const isCancelled = inscricao.status === 'cancelado';
            const progress = clampProgress(inscricao.progressoPercentual || 0);
            const lastAccess = inscricao.ultimoAcesso || inscricao.dataInscricao;

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
                          isCancelled
                            ? 'bg-zinc-600 text-white hover:bg-zinc-600'
                            : isCompleted
                            ? 'bg-emerald-500 text-white hover:bg-emerald-500'
                            : 'bg-primary text-primary-foreground hover:bg-primary'
                        }
                      >
                        {isCancelled ? (
                          'Cancelado'
                        ) : isCompleted ? (
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
                      <p className='text-xs text-muted-foreground mt-2'>
                        Acesso em {formatLastAccess(lastAccess)}
                      </p>
                    </div>

                    <div className='space-y-1.5'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-muted-foreground'>Progresso</span>
                        <span className='font-bold text-primary'>
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} />
                    </div>

                    <Button
                      className='w-full'
                      variant={isCompleted ? 'outline' : 'default'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className='h-4 w-4 mr-2' />
                      ) : (
                        <Play className='h-4 w-4 mr-2' />
                      )}
                      {isCancelled
                        ? 'Ver detalhes'
                        : isCompleted
                          ? 'Revisar'
                          : 'Continuar'}
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
                {validInscricoes.length === 0
                  ? 'Nenhum curso ainda'
                  : filter === 'completed'
                    ? 'Nenhum curso concluído'
                    : 'Nenhum curso em andamento'}
              </h3>
              <p className='text-muted-foreground mb-6'>
                {validInscricoes.length === 0
                  ? 'Você ainda não está inscrito em nenhum curso.'
                  : 'Troque o filtro para visualizar outros cursos da sua trilha.'}
              </p>
              {validInscricoes.length === 0 ? (
                <Link href='/dashboard/explorar-cursos'>
                  <Button className='shadow-md shadow-primary/20'>
                    Explorar Cursos
                  </Button>
                </Link>
              ) : (
                <Button
                  variant='outline'
                  onClick={() => setFilter('all')}
                  className='mx-auto'
                >
                  Ver todos os cursos
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
