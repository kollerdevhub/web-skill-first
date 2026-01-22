'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  FileText,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Eye,
  TrendingUp,
  Users,
} from 'lucide-react';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  appliedAt: string;
  status: 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
}

const fetchApplications = async (): Promise<Application[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: '1',
      jobTitle: 'Desenvolvedor Full Stack',
      company: 'Tech Corp',
      appliedAt: '15/01/2024',
      status: 'interview',
    },
    {
      id: '2',
      jobTitle: 'Frontend Developer React',
      company: 'StartupXYZ',
      appliedAt: '12/01/2024',
      status: 'reviewing',
    },
    {
      id: '3',
      jobTitle: 'Backend Developer Node.js',
      company: 'FinTech Solutions',
      appliedAt: '10/01/2024',
      status: 'pending',
    },
    {
      id: '4',
      jobTitle: 'DevOps Engineer',
      company: 'CloudTech',
      appliedAt: '05/01/2024',
      status: 'rejected',
    },
    {
      id: '5',
      jobTitle: 'Senior React Developer',
      company: 'BigTech Inc',
      appliedAt: '03/01/2024',
      status: 'accepted',
    },
  ];
};

const statusConfig = {
  pending: {
    label: 'Pendente',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    icon: Clock,
  },
  reviewing: {
    label: 'Em Análise',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: Eye,
  },
  interview: {
    label: 'Entrevista',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Phone,
  },
  rejected: {
    label: 'Não Selecionado',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: XCircle,
  },
  accepted: {
    label: 'Aprovado',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: CheckCircle,
  },
};

function ApplicationSkeleton() {
  return (
    <Card className='bg-white border-slate-200'>
      <CardHeader>
        <Skeleton className='h-6 w-3/4 bg-slate-100' />
        <Skeleton className='h-4 w-1/2 bg-slate-100' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-8 w-24 bg-slate-100' />
      </CardContent>
    </Card>
  );
}

export default function CandidaturasPage() {
  const {
    data: applications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['applications'],
    queryFn: fetchApplications,
  });

  const stats = applications
    ? {
        total: applications.length,
        pending: applications.filter((a) => a.status === 'pending').length,
        reviewing: applications.filter((a) => a.status === 'reviewing').length,
        interview: applications.filter((a) => a.status === 'interview').length,
      }
    : null;

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
          <FileText className='h-6 w-6 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>
            Minhas Candidaturas
          </h1>
          <p className='text-slate-500 text-sm'>
            Acompanhe o status das suas candidaturas
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
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
                    {stats.reviewing}
                  </p>
                  <p className='text-sm text-slate-500'>Em Análise</p>
                </div>
                <div className='p-3 rounded-xl bg-amber-50'>
                  <Eye className='h-5 w-5 text-amber-500' />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className='bg-white border-slate-200 shadow-sm'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-2xl font-bold text-slate-900'>
                    {stats.interview}
                  </p>
                  <p className='text-sm text-slate-500'>Entrevistas</p>
                </div>
                <div className='p-3 rounded-xl bg-blue-50'>
                  <Phone className='h-5 w-5 text-blue-500' />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className='bg-white border-slate-200 shadow-sm'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-2xl font-bold text-slate-900'>
                    {stats.pending}
                  </p>
                  <p className='text-sm text-slate-500'>Pendentes</p>
                </div>
                <div className='p-3 rounded-xl bg-slate-100'>
                  <Clock className='h-5 w-5 text-slate-500' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Card className='bg-red-50 border-red-200'>
          <CardContent className='p-4'>
            <p className='text-red-600'>
              Erro ao carregar candidaturas. Tente novamente.
            </p>
          </CardContent>
        </Card>
      )}

      <div className='space-y-4'>
        {isLoading ? (
          <>
            <ApplicationSkeleton />
            <ApplicationSkeleton />
            <ApplicationSkeleton />
          </>
        ) : (
          applications?.map((app) => {
            const status = statusConfig[app.status];
            const StatusIcon = status.icon;
            return (
              <Card
                key={app.id}
                className='group bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all shadow-sm'
              >
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div>
                      <CardTitle className='text-slate-900 group-hover:text-blue-600 transition-colors'>
                        {app.jobTitle}
                      </CardTitle>
                      <CardDescription className='text-slate-500 flex items-center gap-2'>
                        <Building2 className='h-3 w-3' />
                        {app.company}
                        <span className='text-slate-300'>•</span>
                        <Calendar className='h-3 w-3' />
                        Candidatura em {app.appliedAt}
                      </CardDescription>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border ${status.bgColor} ${status.color} ${status.borderColor}`}
                    >
                      <StatusIcon className='h-3 w-3' />
                      {status.label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      className='border-slate-200 text-slate-600 hover:bg-slate-100'
                    >
                      Ver Detalhes
                    </Button>
                    {app.status === 'pending' && (
                      <Button
                        variant='outline'
                        className='border-red-200 text-red-600 hover:bg-red-50'
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {applications?.length === 0 && (
        <Card className='bg-white border-slate-200'>
          <CardContent className='p-8 text-center'>
            <div className='inline-flex p-4 rounded-full bg-slate-100 mb-4'>
              <FileText className='h-10 w-10 text-slate-400' />
            </div>
            <p className='text-slate-600 mb-4'>
              Você ainda não tem candidaturas
            </p>
            <Link href='/dashboard/vagas'>
              <Button className='bg-blue-600 hover:bg-blue-700'>
                Explorar Vagas
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
