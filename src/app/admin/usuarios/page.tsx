'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { UserRoleSelect } from './user-role-select';
import {
  Users,
  GraduationCap,
  Briefcase,
  Award,
  Mail,
  Calendar,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { usersService, AdminUser } from '@/lib/api/services/users.service';

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
  // Legacy or other roles
  gestor: {
    label: 'Gestor',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  recrutador: {
    label: 'Recrutador',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
};

function UserCardSkeleton() {
  return (
    <Card className='bg-card border-border shadow-sm'>
      <CardHeader className='pb-3'>
        <div className='flex items-start gap-4'>
          <Skeleton className='h-12 w-12 rounded-full bg-muted' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-5 w-32 bg-muted' />
            <Skeleton className='h-4 w-48 bg-muted' />
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Skeleton className='h-6 w-20 bg-muted' />
        <div className='grid grid-cols-3 gap-2'>
          <Skeleton className='h-16 bg-muted rounded-lg' />
          <Skeleton className='h-16 bg-muted rounded-lg' />
          <Skeleton className='h-16 bg-muted rounded-lg' />
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className='bg-card border-border shadow-sm'>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <Skeleton className='h-8 w-12 bg-muted' />
            <Skeleton className='h-4 w-16 bg-muted' />
          </div>
          <Skeleton className='h-11 w-11 rounded-xl bg-muted' />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.list();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    totalEnrollments: users.reduce((acc, u) => acc + (u.enrollments || 0), 0),
    totalCertificates: users.reduce((acc, u) => acc + (u.certificates || 0), 0),
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
          <Users className='h-6 w-6 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Usuários</h1>
          <p className='text-muted-foreground text-sm'>Gerencie os usuários</p>
        </div>
      </div>

      {error && (
        <Card className='bg-destructive/10 border-destructive/20'>
          <CardContent className='p-4 flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-destructive' />
            <p className='text-destructive'>{error}</p>
          </CardContent>
        </Card>
      )}

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card className='bg-card border-border shadow-sm'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-2xl font-bold text-foreground'>
                      {stats.total}
                    </p>
                    <p className='text-sm text-muted-foreground'>Total</p>
                  </div>
                  <div className='p-3 rounded-xl bg-blue-500/10'>
                    <Users className='h-5 w-5 text-blue-500' />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className='bg-card border-border shadow-sm'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-2xl font-bold text-foreground'>
                      {stats.admins}
                    </p>
                    <p className='text-sm text-muted-foreground'>Admins</p>
                  </div>
                  <div className='p-3 rounded-xl bg-rose-500/10'>
                    <ShieldCheck className='h-5 w-5 text-rose-500' />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className='bg-card border-border shadow-sm'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-2xl font-bold text-foreground'>
                      {stats.totalEnrollments}
                    </p>
                    <p className='text-sm text-muted-foreground'>Matrículas</p>
                  </div>
                  <div className='p-3 rounded-xl bg-emerald-500/10'>
                    <GraduationCap className='h-5 w-5 text-emerald-500' />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className='bg-card border-border shadow-sm'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-2xl font-bold text-foreground'>
                      {stats.totalCertificates}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Certificados
                    </p>
                  </div>
                  <div className='p-3 rounded-xl bg-amber-500/10'>
                    <Award className='h-5 w-5 text-amber-500' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {loading ? (
          <>
            <UserCardSkeleton />
            <UserCardSkeleton />
            <UserCardSkeleton />
          </>
        ) : users.length === 0 ? (
          <Card className='col-span-full bg-card border-border'>
            <CardContent className='p-8 text-center'>
              <div className='inline-flex p-4 rounded-full bg-muted mb-4'>
                <Users className='h-10 w-10 text-muted-foreground' />
              </div>
              <p className='text-muted-foreground'>Nenhum usuário encontrado</p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => {
            const role = roleConfig[user.role] || roleConfig.candidate;
            return (
              <Card
                key={user.id}
                className='group bg-card border-border hover:border-primary/50 hover:shadow-lg transition-all shadow-sm'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start gap-4'>
                    <Avatar className='h-12 w-12 ring-2 ring-muted group-hover:ring-primary/20 transition-all'>
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className='bg-primary text-primary-foreground font-medium'>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <CardTitle className='text-foreground text-base truncate group-hover:text-primary transition-colors'>
                        {user.name || 'Sem nome'}
                      </CardTitle>
                      <p className='text-sm text-muted-foreground truncate flex items-center gap-1 mt-1'>
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
                    <div className='p-2 bg-muted/50 rounded-lg text-center'>
                      <div className='flex items-center justify-center text-muted-foreground text-xs mb-1'>
                        <GraduationCap className='h-3 w-3' />
                      </div>
                      <p className='text-foreground font-medium'>
                        {user.enrollments || 0}
                      </p>
                      <p className='text-muted-foreground text-xs'>Cursos</p>
                    </div>
                    <div className='p-2 bg-muted/50 rounded-lg text-center'>
                      <div className='flex items-center justify-center text-muted-foreground text-xs mb-1'>
                        <Briefcase className='h-3 w-3' />
                      </div>
                      <p className='text-foreground font-medium'>
                        {user.applications || 0}
                      </p>
                      <p className='text-muted-foreground text-xs'>Vagas</p>
                    </div>
                    <div className='p-2 bg-muted/50 rounded-lg text-center'>
                      <div className='flex items-center justify-center text-muted-foreground text-xs mb-1'>
                        <Award className='h-3 w-3' />
                      </div>
                      <p className='text-foreground font-medium'>
                        {user.certificates || 0}
                      </p>
                      <p className='text-muted-foreground text-xs'>Certs</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                    <Calendar className='h-3 w-3' />
                    Cadastrado em{' '}
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
