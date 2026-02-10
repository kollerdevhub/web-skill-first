'use client';

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
  AlertCircle,
} from 'lucide-react';
import { useVagas } from '@/hooks';
import type { Modalidade } from '@/lib/api';

const modalidadeConfig: Record<
  Modalidade,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: typeof Home;
  }
> = {
  remoto: {
    label: 'Remoto',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: Home,
  },
  hibrido: {
    label: 'Híbrido',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: RefreshCcw,
  },
  presencial: {
    label: 'Presencial',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Building,
  },
};

function formatSalary(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }
  if (min) return `A partir de ${formatter.format(min)}`;
  if (max) return `Até ${formatter.format(max)}`;
  return null;
}

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semana(s) atrás`;
  return `${Math.floor(diffDays / 30)} mês(es) atrás`;
}

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
  const { data: vagas, isLoading, error } = useVagas({ status: 'aberta' });

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
          <CardContent className='p-4 flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-red-600' />
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
        ) : vagas?.data && vagas.data.length > 0 ? (
          vagas.data.map((vaga) => {
            const modalidade = modalidadeConfig[vaga.modalidade];
            const ModalidadeIcon = modalidade.icon;
            const salary = formatSalary(vaga.salarioMin, vaga.salarioMax);
            const postedAt = formatDate(vaga.dataPublicacao || vaga.createdAt);

            return (
              <Card
                key={vaga.id}
                className='group bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all shadow-sm'
              >
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div>
                      <CardTitle className='text-slate-900 text-xl group-hover:text-blue-600 transition-colors'>
                        {vaga.titulo}
                      </CardTitle>
                      <CardDescription className='text-slate-500 mt-1 flex items-center gap-2'>
                        {vaga.empresa?.nome || 'Empresa'}
                        <span className='text-slate-300'>•</span>
                        <MapPin className='h-3 w-3' />
                        {vaga.localizacao}
                      </CardDescription>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border ${modalidade.bgColor} ${modalidade.color} ${modalidade.borderColor}`}
                    >
                      <ModalidadeIcon className='h-3 w-3' />
                      {modalidade.label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <p className='text-slate-600 line-clamp-2'>
                    {vaga.descricao}
                  </p>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      {salary && (
                        <p className='text-blue-600 font-semibold flex items-center gap-1'>
                          <DollarSign className='h-4 w-4' />
                          {salary}
                        </p>
                      )}
                      {postedAt && (
                        <p className='text-slate-400 text-sm flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          {postedAt}
                        </p>
                      )}
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        className='border-slate-200 text-slate-600 hover:bg-slate-100'
                      >
                        <Bookmark className='h-4 w-4 mr-2' />
                        Salvar
                      </Button>
                      <Link href={`/dashboard/vagas/${vaga.id}`}>
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
        ) : (
          <Card className='bg-slate-50 border-slate-200'>
            <CardContent className='p-8 text-center'>
              <Briefcase className='h-12 w-12 text-slate-300 mx-auto mb-4' />
              <p className='text-slate-500'>
                Nenhuma vaga disponível no momento.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
