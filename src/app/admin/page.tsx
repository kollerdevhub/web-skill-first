'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users,
  GraduationCap,
  Briefcase,
  FileText,
  TrendingUp,
  UserPlus,
  Award,
  Plus,
  Upload,
  BarChart3,
  Clock,
  ChevronRight,
  Layers,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    jobs: 0,
    applications: 0,
    enrollments: 0,
    certificates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading with fake stats
    setTimeout(() => {
      setStats({
        users: 5,
        courses: 6,
        jobs: 5,
        applications: 22,
        enrollments: 272,
        certificates: 4,
      });
      setLoading(false);
    }, 500);
  }, []);

  const statCards = [
    {
      label: 'Usuários',
      value: stats.users,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-500/20',
      href: '/admin/usuarios',
    },
    {
      label: 'Cursos',
      value: stats.courses,
      icon: GraduationCap,
      color: 'from-sky-500 to-cyan-600',
      shadowColor: 'shadow-sky-500/20',
      href: '/admin/cursos',
    },
    {
      label: 'Vagas',
      value: stats.jobs,
      icon: Briefcase,
      color: 'from-indigo-500 to-blue-600',
      shadowColor: 'shadow-indigo-500/20',
      href: '/admin/vagas',
    },
    {
      label: 'Candidaturas',
      value: stats.applications,
      icon: FileText,
      color: 'from-blue-600 to-indigo-600',
      shadowColor: 'shadow-blue-500/20',
      href: '/admin/vagas',
    },
  ];

  const quickActions = [
    {
      label: 'Novo Curso',
      icon: Plus,
      href: '/admin/cursos/new',
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    },
    {
      label: 'Upload Vídeo',
      icon: Upload,
      href: '/admin/videos',
      color: 'bg-sky-50 text-sky-600 hover:bg-sky-100',
    },
    {
      label: 'Gerenciar Vagas',
      icon: Briefcase,
      href: '/admin/vagas',
      color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    },
    {
      label: 'Ver Usuários',
      icon: Users,
      href: '/admin/usuarios',
      color: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    },
  ];

  const recentActivities = [
    {
      action: 'Novo usuário registrado',
      time: 'Há 5 minutos',
      icon: UserPlus,
      color: 'text-blue-500',
    },
    {
      action: 'Candidatura enviada',
      time: 'Há 15 minutos',
      icon: FileText,
      color: 'text-indigo-500',
    },
    {
      action: 'Curso concluído',
      time: 'Há 1 hora',
      icon: GraduationCap,
      color: 'text-emerald-500',
    },
    {
      action: 'Nova vaga criada',
      time: 'Há 2 horas',
      icon: Briefcase,
      color: 'text-sky-500',
    },
    {
      action: 'Certificado emitido',
      time: 'Há 3 horas',
      icon: Award,
      color: 'text-amber-500',
    },
  ];

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-blue-500' />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
          <Layers className='h-6 w-6 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Dashboard</h1>
          <p className='text-slate-500 text-sm'>
            Visão geral da plataforma Web Skill First
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card
                className={`group bg-gradient-to-br ${stat.color} border-0 shadow-lg ${stat.shadowColor} hover:scale-[1.02] transition-transform cursor-pointer`}
              >
                <CardContent className='p-5'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-white/80 text-sm font-medium'>
                        {stat.label}
                      </p>
                      <p className='text-4xl font-bold text-white mt-1'>
                        {stat.value}
                      </p>
                    </div>
                    <div className='p-3 rounded-xl bg-white/20'>
                      <Icon className='h-6 w-6 text-white' />
                    </div>
                  </div>
                  <div className='flex items-center gap-1 mt-3 text-white/70 text-sm group-hover:text-white transition-colors'>
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
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-slate-900'>
                  {stats.enrollments}
                </p>
                <p className='text-sm text-slate-500'>Matrículas</p>
              </div>
              <div className='p-3 rounded-xl bg-emerald-50'>
                <TrendingUp className='h-5 w-5 text-emerald-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-slate-900'>
                  {stats.certificates}
                </p>
                <p className='text-sm text-slate-500'>Certificados</p>
              </div>
              <div className='p-3 rounded-xl bg-amber-50'>
                <Award className='h-5 w-5 text-amber-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-white border-slate-200 shadow-sm col-span-2 lg:col-span-1'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-slate-900'>
                  {stats.users > 0
                    ? Math.round((stats.enrollments / stats.users) * 100)
                    : 0}
                  %
                </p>
                <p className='text-sm text-slate-500'>Engajamento</p>
              </div>
              <div className='p-3 rounded-xl bg-blue-50'>
                <BarChart3 className='h-5 w-5 text-blue-500' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Quick Actions */}
        <Card className='bg-white border-slate-200 shadow-sm'>
          <div className='p-6 pb-3'>
            <h3 className='text-slate-900 font-semibold flex items-center gap-2'>
              <Sparkles className='h-5 w-5 text-blue-500' />
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

        {/* Recent Activity */}
        <Card className='bg-white border-slate-200 shadow-sm'>
          <div className='p-6 pb-3'>
            <h3 className='text-slate-900 font-semibold flex items-center gap-2'>
              <Clock className='h-5 w-5 text-blue-500' />
              Atividade Recente
            </h3>
            <p className='text-slate-500 text-sm'>
              Últimas ações na plataforma
            </p>
          </div>
          <CardContent>
            <div className='space-y-3'>
              {recentActivities.map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={i}
                    className='flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors'
                  >
                    <div className='p-2 rounded-lg bg-white shadow-sm'>
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className='flex-1'>
                      <p className='text-slate-700 text-sm'>
                        {activity.action}
                      </p>
                      <p className='text-slate-400 text-xs'>{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
