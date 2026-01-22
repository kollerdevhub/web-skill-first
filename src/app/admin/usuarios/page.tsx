import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserRoleSelect } from './user-role-select';
import {
  Users,
  GraduationCap,
  Briefcase,
  Award,
  Mail,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

export default async function AdminUsuariosPage() {
  const session = await auth();
  if (!session || session.user?.role !== 'admin') redirect('/dashboard');

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { enrollments: true, applications: true, certificates: true },
      },
    },
  });
  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    totalEnrollments: users.reduce((acc, u) => acc + u._count.enrollments, 0),
    totalCertificates: users.reduce((acc, u) => acc + u._count.certificates, 0),
  };
  const roleConfig: Record<
    string,
    { label: string; color: string; bgColor: string; borderColor: string }
  > = {
    admin: {
      label: 'Admin',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
    },
    candidate: {
      label: 'Candidato',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
          <Users className='h-6 w-6 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Usuários</h1>
          <p className='text-slate-500 text-sm'>Gerencie os usuários</p>
        </div>
      </div>

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-slate-900'>
                  {stats.total}
                </p>
                <p className='text-sm text-slate-500'>Total</p>
              </div>
              <div className='p-3 rounded-xl bg-blue-50'>
                <Users className='h-5 w-5 text-blue-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-slate-900'>
                  {stats.admins}
                </p>
                <p className='text-sm text-slate-500'>Admins</p>
              </div>
              <div className='p-3 rounded-xl bg-rose-50'>
                <ShieldCheck className='h-5 w-5 text-rose-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-slate-900'>
                  {stats.totalEnrollments}
                </p>
                <p className='text-sm text-slate-500'>Matrículas</p>
              </div>
              <div className='p-3 rounded-xl bg-emerald-50'>
                <GraduationCap className='h-5 w-5 text-emerald-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-2xl font-bold text-slate-900'>
                  {stats.totalCertificates}
                </p>
                <p className='text-sm text-slate-500'>Certificados</p>
              </div>
              <div className='p-3 rounded-xl bg-amber-50'>
                <Award className='h-5 w-5 text-amber-500' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {users.map((user) => {
          const role = roleConfig[user.role] || roleConfig.candidate;
          return (
            <Card
              key={user.id}
              className='group bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all shadow-sm'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start gap-4'>
                  <Avatar className='h-12 w-12 ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all'>
                    <AvatarImage src={user.image || ''} />
                    <AvatarFallback className='bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium'>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 min-w-0'>
                    <CardTitle className='text-slate-900 text-base truncate group-hover:text-blue-600 transition-colors'>
                      {user.name || 'Sem nome'}
                    </CardTitle>
                    <p className='text-sm text-slate-500 truncate flex items-center gap-1 mt-1'>
                      <Mail className='h-3 w-3' />
                      {user.email}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${role.bgColor} ${role.color} ${role.borderColor}`}
                  >
                    {role.label}
                  </span>
                  <UserRoleSelect userId={user.id} currentRole={user.role} />
                </div>
                <div className='grid grid-cols-3 gap-2'>
                  <div className='p-2 bg-slate-50 rounded-lg text-center'>
                    <div className='flex items-center justify-center text-slate-400 text-xs mb-1'>
                      <GraduationCap className='h-3 w-3' />
                    </div>
                    <p className='text-slate-900 font-medium'>
                      {user._count.enrollments}
                    </p>
                    <p className='text-slate-500 text-xs'>Cursos</p>
                  </div>
                  <div className='p-2 bg-slate-50 rounded-lg text-center'>
                    <div className='flex items-center justify-center text-slate-400 text-xs mb-1'>
                      <Briefcase className='h-3 w-3' />
                    </div>
                    <p className='text-slate-900 font-medium'>
                      {user._count.applications}
                    </p>
                    <p className='text-slate-500 text-xs'>Vagas</p>
                  </div>
                  <div className='p-2 bg-slate-50 rounded-lg text-center'>
                    <div className='flex items-center justify-center text-slate-400 text-xs mb-1'>
                      <Award className='h-3 w-3' />
                    </div>
                    <p className='text-slate-900 font-medium'>
                      {user._count.certificates}
                    </p>
                    <p className='text-slate-500 text-xs'>Certs</p>
                  </div>
                </div>
                <div className='flex items-center gap-1 text-xs text-slate-400'>
                  <Calendar className='h-3 w-3' />
                  Cadastrado em{' '}
                  {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
