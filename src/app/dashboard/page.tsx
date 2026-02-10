'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  GraduationCap,
  Award,
  FileText,
  Briefcase,
  Sparkles,
  ChevronRight,
  Play,
  BookOpen,
} from 'lucide-react';
import {
  useMinhasInscricoes,
  useMinhasCandidaturas,
  useMeusCertificados,
  useMyProfile,
  useMe,
} from '@/hooks';

function StatCardSkeleton() {
  return (
    <Card className='bg-white border-slate-200 shadow-sm'>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <Skeleton className='h-8 w-12 bg-slate-100' />
            <Skeleton className='h-4 w-24 bg-slate-100' />
          </div>
          <Skeleton className='h-12 w-12 rounded-xl bg-slate-100' />
        </div>
      </CardContent>
    </Card>
  );
}

function CourseCardSkeleton() {
  return (
    <Card className='bg-white border-slate-200 shadow-sm'>
      <CardHeader className='pb-3'>
        <Skeleton className='h-5 w-16 rounded-full bg-slate-100' />
        <Skeleton className='h-5 w-32 bg-slate-100' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-2 w-full bg-slate-100' />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: me } = useMe();
  const { data: profile } = useMyProfile();
  const { data: inscricoes, isLoading: loadingInscricoes } =
    useMinhasInscricoes();
  const { data: candidaturas, isLoading: loadingCandidaturas } =
    useMinhasCandidaturas();
  const { data: certificados, isLoading: loadingCertificados } =
    useMeusCertificados();

  const cursosEmAndamento =
    inscricoes?.filter((i) => i.status === 'em_andamento') || [];
  const totalCertificados = certificados?.length || 0;
  const totalCandidaturas = candidaturas?.length || 0;
  const displayName =
    profile?.nome || me?.email?.split('@')[0] || 'Candidato';

  const stats = [
    {
      label: 'Cursos em Andamento',
      value: cursosEmAndamento.length.toString(),
      icon: GraduationCap,
      href: '/dashboard/cursos',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      loading: loadingInscricoes,
    },
    {
      label: 'Certificados',
      value: totalCertificados.toString(),
      icon: Award,
      href: '/dashboard/certificados',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      loading: loadingCertificados,
    },
    {
      label: 'Candidaturas',
      value: totalCandidaturas.toString(),
      icon: FileText,
      href: '/dashboard/candidaturas',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      loading: loadingCandidaturas,
    },
    {
      label: 'Vagas Disponíveis',
      value: 'Ver',
      icon: Briefcase,
      href: '/dashboard/vagas',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      loading: false,
    },
  ];

  // Get recent courses (up to 3)
  const recentCourses = cursosEmAndamento.slice(0, 3);

  return (
    <div className='space-y-8'>
      {/* Welcome section */}
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-lg bg-blue-600 shadow-sm'>
          <Sparkles className='h-6 w-6 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>
            Olá, {displayName.split(' ')[0]}! 👋
          </h1>
          <p className='text-slate-500 text-sm'>
            Continue sua jornada de aprendizado
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {stats.map((stat) => {
          const Icon = stat.icon;

          if (stat.loading) {
            return <StatCardSkeleton key={stat.label} />;
          }

          return (
            <Link key={stat.label} href={stat.href}>
              <Card className='bg-white border-slate-200 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer shadow-sm'>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-2xl font-bold text-slate-900'>
                        {stat.value}
                      </p>
                      <p className='text-sm text-slate-500'>{stat.label}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent courses */}
      <div>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-semibold text-slate-900 flex items-center gap-2'>
            <Play className='h-5 w-5 text-blue-600' />
            Continuar Assistindo
          </h2>
          <Link
            href='/dashboard/cursos'
            className='text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1'
          >
            Ver todos
            <ChevronRight className='h-4 w-4' />
          </Link>
        </div>

        {loadingInscricoes ? (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </div>
        ) : recentCourses.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {recentCourses.map((inscricao) => (
              <Link
                key={inscricao.id}
                href={`/dashboard/cursos/${inscricao.cursoId}`}
              >
                <Card className='bg-white border-slate-200 hover:border-blue-200 hover:shadow-md transition-all shadow-sm cursor-pointer'>
                  <CardHeader className='pb-3'>
                    <span className='px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium w-fit border border-blue-100'>
                      Em andamento
                    </span>
                    <CardTitle className='text-slate-900 text-lg'>
                      {inscricao.curso?.titulo || 'Curso'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                          style={{
                            width: `${inscricao.progressoPercentual}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className='bg-slate-50 border-slate-200'>
            <CardContent className='p-6 text-center'>
              <BookOpen className='h-10 w-10 text-slate-300 mx-auto mb-3' />
              <p className='text-slate-500 text-sm'>
                Nenhum curso em andamento.
              </p>
              <Link
                href='/dashboard/explorar-cursos'
                className='text-blue-600 hover:text-blue-700 text-sm font-medium'
              >
                Explorar cursos disponíveis
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className='text-xl font-semibold text-slate-900 mb-4'>
          Ações Rápidas
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <Link href='/dashboard/cursos'>
            <Card className='bg-blue-600 border-0 hover:bg-blue-700 transition-colors cursor-pointer shadow-sm'>
              <CardContent className='p-6'>
                <p className='text-lg font-medium text-white'>
                  Explorar Cursos
                </p>
                <p className='text-blue-100 text-sm'>Descubra novos cursos</p>
              </CardContent>
            </Card>
          </Link>
          <Link href='/dashboard/vagas'>
            <Card className='bg-white border-slate-200 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer shadow-sm'>
              <CardContent className='p-6'>
                <p className='text-lg font-medium text-slate-900'>
                  Buscar Vagas
                </p>
                <p className='text-slate-500 text-sm'>Encontre oportunidades</p>
              </CardContent>
            </Card>
          </Link>
          <Link href='/dashboard/perfil'>
            <Card className='bg-white border-slate-200 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer shadow-sm'>
              <CardContent className='p-6'>
                <p className='text-lg font-medium text-slate-900'>
                  Atualizar Perfil
                </p>
                <p className='text-slate-500 text-sm'>Complete seu perfil</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
