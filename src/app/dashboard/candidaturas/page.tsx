'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Users,
  AlertCircle,
  MapPin,
  ChevronRight,
  Briefcase,
} from 'lucide-react';
import { useMinhasCandidaturas, useCancelCandidatura } from '@/hooks';
import type { CandidaturaStatus } from '@/lib/api';

const statusConfig: Record<
  CandidaturaStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: typeof Clock;
  }
> = {
  pendente: {
    label: 'Pendente',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    icon: Clock,
  },
  em_analise: {
    label: 'Em Análise',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: Eye,
  },
  aprovado_triagem: {
    label: 'Aprovado na Triagem',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: CheckCircle,
  },
  entrevista: {
    label: 'Entrevista',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: Phone,
  },
  aprovado: {
    label: 'Aprovado',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: CheckCircle,
  },
  reprovado: {
    label: 'Não Selecionado',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: XCircle,
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

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

function StatCardSkeleton() {
  return (
    <Card className='bg-white border-slate-200 shadow-sm'>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <Skeleton className='h-8 w-12 bg-slate-100' />
            <Skeleton className='h-4 w-16 bg-slate-100' />
          </div>
          <Skeleton className='h-12 w-12 rounded-xl bg-slate-100' />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CandidaturasPage() {
  const { data: candidaturas, isLoading, error } = useMinhasCandidaturas();
  const cancelMutation = useCancelCandidatura();

  const stats = candidaturas
    ? {
        total: candidaturas.length,
        pendente: candidaturas.filter((c) => c.status === 'pendente').length,
        em_analise: candidaturas.filter((c) => c.status === 'em_analise')
          .length,
        entrevista: candidaturas.filter((c) => c.status === 'entrevista')
          .length,
      }
    : null;

  const handleCancel = (id: string) => {
    if (confirm('Tem certeza que deseja cancelar esta candidatura?')) {
      cancelMutation.mutate(id);
    }
  };

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
      {isLoading ? (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        stats && (
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
                      {stats.em_analise}
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
                      {stats.entrevista}
                    </p>
                    <p className='text-sm text-slate-500'>Entrevistas</p>
                  </div>
                  <div className='p-3 rounded-xl bg-purple-50'>
                    <Phone className='h-5 w-5 text-purple-500' />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className='bg-white border-slate-200 shadow-sm'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-2xl font-bold text-slate-900'>
                      {stats.pendente}
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
        )
      )}

      {error && (
        <Card className='bg-red-50 border-red-200'>
          <CardContent className='p-4 flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-red-600' />
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
        ) : candidaturas && candidaturas.length > 0 ? (
          candidaturas.map((candidatura) => {
            const status = statusConfig[candidatura.status];
            const StatusIcon = status.icon;
            // Link to vacancy details page
            const vacancyLink = `/dashboard/vagas/${candidatura.vagaId}`;

            return (
              <Card
                key={candidatura.id}
                className='group bg-white border-slate-200 hover:border-blue-300 hover:shadow-md transition-all shadow-sm'
              >
                <CardHeader className='pb-3'>
                  <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
                    <div className='flex items-start gap-4'>
                      <div className='h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0'>
                        <Briefcase className='h-6 w-6 text-slate-400' />
                      </div>
                      <div>
                        <Link href={vacancyLink}>
                          <CardTitle className='text-xl text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer'>
                            {candidatura.vaga?.titulo || 'Vaga'}
                          </CardTitle>
                        </Link>
                        <div className='flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500'>
                          <div className='flex items-center gap-1.5'>
                            <Building2 className='h-3.5 w-3.5' />
                            {candidatura.vaga?.empresa?.nome || 'Empresa'}
                          </div>
                          {candidatura.vaga?.localizacao && (
                            <div className='flex items-center gap-1.5'>
                              <MapPin className='h-3.5 w-3.5' />
                              {candidatura.vaga.localizacao}
                            </div>
                          )}
                          <div className='flex items-center gap-1.5'>
                            <Calendar className='h-3.5 w-3.5' />
                            Aplicado em {formatDate(candidatura.dataInscricao)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 border self-start ${status.bgColor} ${status.color} ${status.borderColor}`}
                    >
                      <StatusIcon className='h-3.5 w-3.5' />
                      {status.label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 mt-2'>
                    <div className='flex gap-2 text-sm text-slate-500'>
                      {candidatura.pontuacaoFinal !== undefined && (
                        <span className='inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs font-medium'>
                          Pontuação: {candidatura.pontuacaoFinal.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className='flex gap-2 w-full sm:w-auto'>
                      {candidatura.status === 'pendente' && (
                        <Button
                          variant='outline'
                          className='flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                          onClick={() => handleCancel(candidatura.id)}
                          disabled={cancelMutation.isPending}
                        >
                          Cancelar
                        </Button>
                      )}
                      <Link href={vacancyLink} className='flex-1 sm:flex-none'>
                        <Button
                          variant='outline'
                          className='w-full border-slate-200 text-slate-600 hover:bg-slate-50 group-hover:border-blue-200 group-hover:text-blue-600'
                        >
                          Ver Vaga
                          <ChevronRight className='h-4 w-4 ml-1' />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className='bg-white border-slate-200'>
            <CardContent className='p-12 text-center'>
              <div className='inline-flex p-4 rounded-full bg-slate-50 mb-4'>
                <FileText className='h-12 w-12 text-slate-300' />
              </div>
              <h3 className='text-lg font-semibold text-slate-900 mb-1'>
                Nehuma candidatura ainda
              </h3>
              <p className='text-slate-500 mb-6 max-w-sm mx-auto'>
                Você ainda não se candidatou a nenhuma vaga. Explore as
                oportunidades disponíveis.
              </p>
              <Link href='/dashboard/vagas'>
                <Button className='bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'>
                  Explorar Vagas
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
