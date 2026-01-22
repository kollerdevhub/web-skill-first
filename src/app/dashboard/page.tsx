import { auth } from '@/lib/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import {
  GraduationCap,
  Award,
  FileText,
  Briefcase,
  Sparkles,
  ChevronRight,
  Play,
} from 'lucide-react';

const stats = [
  {
    label: 'Cursos em Andamento',
    value: '3',
    icon: GraduationCap,
    href: '/dashboard/cursos',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    label: 'Certificados',
    value: '5',
    icon: Award,
    href: '/dashboard/certificados',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
  {
    label: 'Candidaturas',
    value: '8',
    icon: FileText,
    href: '/dashboard/candidaturas',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  {
    label: 'Vagas Salvas',
    value: '12',
    icon: Briefcase,
    href: '/dashboard/vagas',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
  },
];

const recentCourses = [
  { id: 1, title: 'React Avançado', progress: 75, category: 'Frontend' },
  { id: 2, title: 'Node.js do Zero', progress: 45, category: 'Backend' },
  { id: 3, title: 'TypeScript Completo', progress: 30, category: 'Linguagens' },
];

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className='space-y-8'>
      {/* Welcome section */}
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
          <Sparkles className='h-6 w-6 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>
            Olá, {session?.user?.name?.split(' ')[0]}! 👋
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
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className='bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer shadow-sm'>
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
            <Play className='h-5 w-5 text-blue-500' />
            Continuar Assistindo
          </h2>
          <Link
            href='/dashboard/cursos'
            className='text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1'
          >
            Ver todos
            <ChevronRight className='h-4 w-4' />
          </Link>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {recentCourses.map((course) => (
            <Card
              key={course.id}
              className='bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all shadow-sm'
            >
              <CardHeader className='pb-3'>
                <span className='px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium w-fit border border-blue-200'>
                  {course.category}
                </span>
                <CardTitle className='text-slate-900 text-lg'>
                  {course.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-slate-500'>Progresso</span>
                    <span className='text-blue-600 font-medium'>
                      {course.progress}%
                    </span>
                  </div>
                  <div className='w-full bg-slate-100 rounded-full h-2'>
                    <div
                      className='bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all'
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className='text-xl font-semibold text-slate-900 mb-4'>
          Ações Rápidas
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <Link href='/dashboard/cursos'>
            <Card className='bg-gradient-to-br from-blue-500 to-blue-600 border-0 hover:from-blue-600 hover:to-blue-700 transition-all cursor-pointer shadow-lg shadow-blue-500/20'>
              <CardContent className='p-6'>
                <p className='text-lg font-medium text-white'>
                  Explorar Cursos
                </p>
                <p className='text-blue-100 text-sm'>Descubra novos cursos</p>
              </CardContent>
            </Card>
          </Link>
          <Link href='/dashboard/vagas'>
            <Card className='bg-gradient-to-br from-indigo-500 to-indigo-600 border-0 hover:from-indigo-600 hover:to-indigo-700 transition-all cursor-pointer shadow-lg shadow-indigo-500/20'>
              <CardContent className='p-6'>
                <p className='text-lg font-medium text-white'>Buscar Vagas</p>
                <p className='text-indigo-100 text-sm'>
                  Encontre oportunidades
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href='/dashboard/perfil'>
            <Card className='bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 hover:from-emerald-600 hover:to-emerald-700 transition-all cursor-pointer shadow-lg shadow-emerald-500/20'>
              <CardContent className='p-6'>
                <p className='text-lg font-medium text-white'>
                  Atualizar Perfil
                </p>
                <p className='text-emerald-100 text-sm'>Complete seu perfil</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
