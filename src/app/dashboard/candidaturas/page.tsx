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
            return (
              <Card
                key={candidatura.id}
                className='group bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all shadow-sm'
              >
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div>
                      <CardTitle className='text-slate-900 group-hover:text-blue-600 transition-colors'>
                        {candidatura.vaga?.titulo || 'Vaga'}
                      </CardTitle>
                      <CardDescription className='text-slate-500 flex items-center gap-2'>
                        <Building2 className='h-3 w-3' />
                        {candidatura.vaga?.empresa?.nome || 'Empresa'}
                        <span className='text-slate-300'>•</span>
                        <Calendar className='h-3 w-3' />
                        Candidatura em {formatDate(candidatura.dataInscricao)}
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
                  <div className='flex items-center justify-between'>
                    <div className='flex gap-2 text-sm text-slate-500'>
                      {candidatura.pontuacaoFinal !== undefined && (
                        <span>
                          Pontuação: {candidatura.pontuacaoFinal.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className='flex gap-2'>
                      <Link href={`/dashboard/candidaturas/${candidatura.id}`}>
                        <Button
                          variant='outline'
                          className='border-slate-200 text-slate-600 hover:bg-slate-100'
                        >
                          Ver Detalhes
                        </Button>
                      </Link>
                      {candidatura.status === 'pendente' && (
                        <Button
                          variant='outline'
                          className='border-red-200 text-red-600 hover:bg-red-50'
                          onClick={() => handleCancel(candidatura.id)}
                          disabled={cancelMutation.isPending}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
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
    </div>
  );
}
