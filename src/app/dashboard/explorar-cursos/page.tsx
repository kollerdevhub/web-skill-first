'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCursos, useMinhasInscricoes, useMyProfile } from '@/hooks';
import { useEnroll } from '@/hooks/useInscricoes';
import {
  AlertCircle,
  BookOpen,
  Clock,
  Loader2,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';

export default function ExplorarCursosPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const { data, isLoading, error } = useCursos({
    q: search || undefined,
    page: 1,
    limit: 30,
  });
  const { data: inscricoes } = useMinhasInscricoes();
  const { data: profile } = useMyProfile();
  const enrollMutation = useEnroll();

  const enrolledCourseIds = useMemo(
    () => new Set((inscricoes || []).map((inscricao) => inscricao.cursoId)),
    [inscricoes],
  );

  async function handleEnroll(cursoId: string) {
    try {
      setEnrollingId(cursoId);
      setEnrollError(null);
      await enrollMutation.mutateAsync(cursoId);
      router.push('/dashboard/cursos');
    } catch (err: any) {
      // Assuming error message is in err.message or just string
      const errorMessage = err?.message || 'Erro desconhecido';

      setEnrollError(errorMessage);
      if (errorMessage.toLowerCase().includes('perfil de candidato')) {
        router.push('/dashboard/perfil?from=enroll');
      } else if (!errorMessage) {
        setEnrollError('Não foi possível inscrever. Tente novamente.');
      }
    } finally {
      setEnrollingId(null);
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
          <Sparkles className='h-6 w-6 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Explorar Cursos</h1>
          <p className='text-slate-500 text-sm'>
            Escolha um curso e inicie sua próxima jornada de aprendizado
          </p>
        </div>
      </div>

      <Card className='bg-white border-slate-200 shadow-sm'>
        <CardContent className='p-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Buscar por nome do curso...'
              className='pl-10 border-slate-200'
            />
          </div>
          {!profile && (
            <p className='mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3'>
              Crie seu perfil de candidato para se inscrever em cursos.{' '}
              <Link
                href='/dashboard/perfil'
                className='underline text-amber-800'
              >
                Ir para meu perfil
              </Link>
            </p>
          )}
          {enrollError && (
            <p className='mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3'>
              {enrollError}
            </p>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className='bg-red-50 border-red-200'>
          <CardContent className='p-4 flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-red-600' />
            <p className='text-red-700'>Não foi possível carregar os cursos.</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className='flex items-center justify-center h-[40vh]'>
          <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
        </div>
      ) : data?.data?.length ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {data.data.map((curso) => {
            const alreadyEnrolled = enrolledCourseIds.has(curso.id);
            return (
              <Card
                key={curso.id}
                className='bg-white border-slate-200 shadow-sm overflow-hidden'
              >
                <div className='aspect-video bg-slate-100'>
                  {curso.thumbnailUrl ? (
                    <img
                      src={curso.thumbnailUrl}
                      alt={curso.titulo}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <BookOpen className='h-10 w-10 text-slate-300' />
                    </div>
                  )}
                </div>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-lg text-slate-900 line-clamp-2'>
                    {curso.titulo}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <p className='text-sm text-slate-500 line-clamp-3'>
                    {curso.descricao}
                  </p>

                  <div className='flex items-center gap-4 text-xs text-slate-500'>
                    <span className='flex items-center gap-1'>
                      <Clock className='h-3.5 w-3.5' />
                      {curso.cargaHoraria}h
                    </span>
                    <span className='flex items-center gap-1'>
                      <Users className='h-3.5 w-3.5' />
                      {curso.totalInscritos || 0} alunos
                    </span>
                  </div>

                  {alreadyEnrolled ? (
                    <Link href='/dashboard/cursos' className='block'>
                      <Button className='w-full bg-slate-100 text-slate-700 hover:bg-slate-200'>
                        Ir para meus cursos
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      className='w-full bg-blue-600 hover:bg-blue-700'
                      disabled={enrollingId === curso.id}
                      onClick={() => handleEnroll(curso.id)}
                    >
                      {enrollingId === curso.id ? (
                        <>
                          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                          Inscrevendo...
                        </>
                      ) : (
                        'Inscrever-se'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className='bg-slate-50 border-slate-200'>
          <CardContent className='p-10 text-center text-slate-500'>
            Nenhum curso disponível no momento.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
