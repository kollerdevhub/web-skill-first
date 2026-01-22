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
  Briefcase,
  MapPin,
  Home,
  Building,
  RefreshCcw,
  DollarSign,
  Clock,
  Send,
  Bookmark,
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'remote' | 'hybrid' | 'onsite';
  salary: string;
  description: string;
  postedAt: string;
}

const fetchJobs = async (): Promise<Job[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: '1',
      title: 'Desenvolvedor Full Stack',
      company: 'Tech Corp',
      location: 'São Paulo, SP',
      type: 'remote',
      salary: 'R$ 8.000 - R$ 12.000',
      description:
        'Procuramos um desenvolvedor full stack para trabalhar com React e Node.js.',
      postedAt: '2 dias atrás',
    },
    {
      id: '2',
      title: 'Frontend Developer React',
      company: 'StartupXYZ',
      location: 'Rio de Janeiro, RJ',
      type: 'hybrid',
      salary: 'R$ 7.000 - R$ 10.000',
      description:
        'Vaga para desenvolvedor frontend com experiência em React e TypeScript.',
      postedAt: '3 dias atrás',
    },
    {
      id: '3',
      title: 'Backend Developer Node.js',
      company: 'FinTech Solutions',
      location: 'Belo Horizonte, MG',
      type: 'onsite',
      salary: 'R$ 9.000 - R$ 14.000',
      description: 'Desenvolvedor backend para construir APIs escaláveis.',
      postedAt: '1 semana atrás',
    },
    {
      id: '4',
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'Curitiba, PR',
      type: 'remote',
      salary: 'R$ 10.000 - R$ 15.000',
      description:
        'Engenheiro DevOps com experiência em AWS, Docker e Kubernetes.',
      postedAt: '4 dias atrás',
    },
  ];
};

const typeConfig = {
  remote: {
    label: 'Remoto',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: Home,
  },
  hybrid: {
    label: 'Híbrido',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: RefreshCcw,
  },
  onsite: {
    label: 'Presencial',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Building,
  },
};

function JobCardSkeleton() {
  return (
    <Card className='bg-white border-slate-200'>
      <CardHeader>
        <Skeleton className='h-6 w-3/4 bg-slate-100' />
        <Skeleton className='h-4 w-1/2 bg-slate-100' />
      </CardHeader>
      <CardContent className='space-y-3'>
        <Skeleton className='h-4 w-full bg-slate-100' />
        <Skeleton className='h-4 w-2/3 bg-slate-100' />
        <div className='flex gap-2'>
          <Skeleton className='h-8 w-20 bg-slate-100' />
          <Skeleton className='h-8 w-20 bg-slate-100' />
        </div>
      </CardContent>
    </Card>
  );
}

export default function VagasPage() {
  const {
    data: jobs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
          <Briefcase className='h-6 w-6 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>
            Vagas de Emprego
          </h1>
          <p className='text-slate-500 text-sm'>
            Encontre a oportunidade perfeita para você
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex gap-3 flex-wrap'>
        <Button className='bg-blue-600 hover:bg-blue-700'>Todos</Button>
        <Button
          variant='outline'
          className='border-slate-200 text-slate-600 hover:bg-slate-100'
        >
          <Home className='h-4 w-4 mr-2' />
          Remoto
        </Button>
        <Button
          variant='outline'
          className='border-slate-200 text-slate-600 hover:bg-slate-100'
        >
          <RefreshCcw className='h-4 w-4 mr-2' />
          Híbrido
        </Button>
        <Button
          variant='outline'
          className='border-slate-200 text-slate-600 hover:bg-slate-100'
        >
          <Building className='h-4 w-4 mr-2' />
          Presencial
        </Button>
      </div>

      {error && (
        <Card className='bg-red-50 border-red-200'>
          <CardContent className='p-4'>
            <p className='text-red-600'>
              Erro ao carregar vagas. Tente novamente.
            </p>
          </CardContent>
        </Card>
      )}

      <div className='space-y-4'>
        {isLoading ? (
          <>
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </>
        ) : (
          jobs?.map((job) => {
            const type = typeConfig[job.type];
            const TypeIcon = type.icon;
            return (
              <Card
                key={job.id}
                className='group bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all shadow-sm'
              >
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div>
                      <CardTitle className='text-slate-900 text-xl group-hover:text-blue-600 transition-colors'>
                        {job.title}
                      </CardTitle>
                      <CardDescription className='text-slate-500 mt-1 flex items-center gap-2'>
                        {job.company}
                        <span className='text-slate-300'>•</span>
                        <MapPin className='h-3 w-3' />
                        {job.location}
                      </CardDescription>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border ${type.bgColor} ${type.color} ${type.borderColor}`}
                    >
                      <TypeIcon className='h-3 w-3' />
                      {type.label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <p className='text-slate-600'>{job.description}</p>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <p className='text-blue-600 font-semibold flex items-center gap-1'>
                        <DollarSign className='h-4 w-4' />
                        {job.salary}
                      </p>
                      <p className='text-slate-400 text-sm flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        {job.postedAt}
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        className='border-slate-200 text-slate-600 hover:bg-slate-100'
                      >
                        <Bookmark className='h-4 w-4 mr-2' />
                        Salvar
                      </Button>
                      <Link href={`/dashboard/vagas/${job.id}`}>
                        <Button className='bg-blue-600 hover:bg-blue-700'>
                          <Send className='h-4 w-4 mr-2' />
                          Candidatar-se
                        </Button>
                      </Link>
                    </div>
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
