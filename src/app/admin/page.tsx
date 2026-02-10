'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Award,
  Plus,
  BarChart3,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useHomeData } from '@/hooks';

function StatCardSkeleton() {
  return (
    <Card className='bg-white border-slate-200 shadow-sm'>
      <CardContent className='p-5'>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-16 bg-slate-100' />
            <Skeleton className='h-8 w-12 bg-slate-100' />
          </div>
          <Skeleton className='h-12 w-12 rounded-lg bg-slate-100' />
        </div>
        <Skeleton className='h-4 w-24 mt-3 bg-slate-100' />
      </CardContent>
    </Card>
  );
}

function SecondaryStatSkeleton() {
  return (
    <Card className='bg-white border-slate-200 shadow-sm'>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <Skeleton className='h-8 w-16 bg-slate-100' />
            <Skeleton className='h-4 w-20 bg-slate-100' />
          </div>
          <Skeleton className='h-11 w-11 rounded-lg bg-slate-100' />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: homeData, isLoading, error } = useHomeData();

  const stats = homeData?.estatisticas;

  const statCards = [
    {
      label: 'Candidatos',
      value: stats?.totalCandidatos || 0,
      icon: Users,
      href: '/admin/usuarios',
    },
    {
      label: 'Cursos',
      value: stats?.totalCursos || 0,
      icon: GraduationCap,
      href: '/admin/cursos',
    },
    {
      label: 'Vagas',
      value: stats?.totalVagas || 0,
      icon: Briefcase,
      href: '/admin/vagas',
    },
    {
      label: 'Ver Mais',
      value: '→',
      icon: TrendingUp,
      href: '/admin/relatorios',
    },
  ];

  const quickActions = [
    {
      label: 'Novo Curso',
      icon: Plus,
      href: '/admin/cursos/new',
      color:
        'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100',
    },
    {
      label: 'Trilha de Curso',
      icon: GraduationCap,
      href: '/admin/cursos',
      color:
        'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100',
    },
    {
      label: 'Gerenciar Vagas',
      icon: Briefcase,
      href: '/admin/vagas',
      color:
        'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200',
    },
    {
      label: 'Ver Usuários',
      icon: Users,
      href: '/admin/usuarios',
      color:
        'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200',
    },
  ];

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-lg bg-blue-600 shadow-sm'>
          <Layers className='h-6 w-6 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Dashboard</h1>
          <p className='text-slate-500 text-sm'>
            Visão geral da plataforma Web Skill First
          </p>
        </div>
      </div>

      {error && (
        <Card className='bg-blue-50 border-blue-200'>
          <CardContent className='p-4 flex items-center gap-2'>
            <BarChart3 className='h-5 w-5 text-blue-600' />
            <p className='text-blue-700'>
              Estatísticas ainda não disponíveis. Os dados serão exibidos quando
              houver atividade na plataforma.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link key={stat.label} href={stat.href}>
                  <Card className='group bg-white border-slate-200 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer shadow-sm'>
                    <CardContent className='p-5'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-slate-500 text-sm font-medium'>
                            {stat.label}
                          </p>
                          <p className='text-3xl font-bold text-slate-900 mt-1'>
                            {stat.value}
                          </p>
                        </div>
                        <div className='p-3 rounded-lg bg-blue-50'>
                          <Icon className='h-6 w-6 text-blue-600' />
                        </div>
                      </div>
                      <div className='flex items-center gap-1 mt-3 text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors'>
                        <span>Ver detalhes</span>
                        <ChevronRight className='h-4 w-4' />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
      </div>

      {/* Secondary Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {isLoading ? (
          <>
            <SecondaryStatSkeleton />
            <SecondaryStatSkeleton />
            <SecondaryStatSkeleton />
          </>
        ) : (
          <>
            <Card className='bg-white border-slate-200 shadow-sm'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-2xl font-bold text-slate-900'>
                      {homeData?.cursosPopulares?.length || 0}
                    </p>
                    <p className='text-sm text-slate-500'>Cursos Populares</p>
                  </div>
                  <div className='p-3 rounded-lg bg-blue-50'>
                    <TrendingUp className='h-5 w-5 text-blue-600' />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className='bg-white border-slate-200 shadow-sm'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-2xl font-bold text-slate-900'>
                      {homeData?.vagasDestaque?.length || 0}
                    </p>
                    <p className='text-sm text-slate-500'>Vagas em Destaque</p>
                  </div>
                  <div className='p-3 rounded-lg bg-blue-50'>
                    <Award className='h-5 w-5 text-blue-600' />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className='bg-white border-slate-200 shadow-sm col-span-2 lg:col-span-1'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-2xl font-bold text-slate-900'>
                      {stats
                        ? Math.round(
                            (stats.totalVagas / (stats.totalCursos || 1)) * 100,
                          )
                        : 0}
                      %
                    </p>
                    <p className='text-sm text-slate-500'>Taxa Vaga/Curso</p>
                  </div>
                  <div className='p-3 rounded-lg bg-blue-50'>
                    <BarChart3 className='h-5 w-5 text-blue-600' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions & Featured Content */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Quick Actions */}
        <Card className='bg-white border-slate-200 shadow-sm'>
          <div className='p-6 pb-3'>
            <h3 className='text-slate-900 font-semibold flex items-center gap-2'>
              <Sparkles className='h-5 w-5 text-blue-600' />
              Ações Rápidas
            </h3>
            <p className='text-slate-500 text-sm'>
              Acesso às principais funcionalidades
            </p>
          </div>
          <CardContent>
            <div className='grid grid-cols-2 gap-3'>
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href}>
                    <div
                      className={`p-4 rounded-xl ${action.color} transition-colors cursor-pointer flex flex-col items-center gap-2`}
                    >
                      <Icon className='h-6 w-6' />
                      <span className='text-sm font-medium'>
                        {action.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Featured Jobs */}
        <Card className='bg-white border-slate-200 shadow-sm'>
          <div className='p-6 pb-3'>
            <h3 className='text-slate-900 font-semibold flex items-center gap-2'>
              <Briefcase className='h-5 w-5 text-blue-600' />
              Vagas em Destaque
            </h3>
            <p className='text-slate-500 text-sm'>
              Principais oportunidades ativas
            </p>
          </div>
          <CardContent>
            <div className='space-y-3'>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className='flex items-center gap-3 p-3 bg-slate-50 rounded-lg'
                  >
                    <Skeleton className='h-8 w-8 rounded-lg bg-slate-200' />
                    <div className='flex-1 space-y-1'>
                      <Skeleton className='h-4 w-32 bg-slate-200' />
                      <Skeleton className='h-3 w-24 bg-slate-200' />
                    </div>
                  </div>
                ))
              ) : homeData?.vagasDestaque &&
                homeData.vagasDestaque.length > 0 ? (
                homeData.vagasDestaque.slice(0, 5).map((vaga) => (
                  <Link key={vaga.id} href='/admin/vagas'>
                    <div className='flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer'>
                      <div className='p-2 rounded-lg bg-white shadow-sm'>
                        <Briefcase className='h-4 w-4 text-blue-600' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-slate-700 text-sm font-medium'>
                          {vaga.titulo}
                        </p>
                        <p className='text-slate-400 text-xs'>
                          {vaga.empresa?.nome} • {vaga.localizacao}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className='text-center py-4'>
                  <p className='text-slate-500 text-sm'>
                    Nenhuma vaga em destaque
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
