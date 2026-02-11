'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useValidateCertificado } from '@/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function LoadingState() {
  return (
    <div className='space-y-5'>
      <div className='h-10 w-40 rounded-lg bg-slate-100 animate-pulse' />
      <Card className='border-slate-200'>
        <CardHeader className='space-y-3'>
          <Skeleton className='h-5 w-28' />
          <Skeleton className='h-8 w-2/3' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-4 w-1/2' />
          <Skeleton className='h-4 w-1/3' />
          <Skeleton className='h-4 w-2/3' />
          <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ValidateCertificadoPage() {
  const params = useParams<{ codigo: string }>();
  const codigo = (params?.codigo || '').trim().toUpperCase();

  const { data, isLoading, error } = useValidateCertificado(codigo);

  if (isLoading) {
    return <LoadingState />;
  }

  const certificado = data?.certificado;
  const certificateIsActive = certificado?.ativo !== false;
  const isValid = Boolean(data?.valido && certificado && certificateIsActive);

  if (error) {
    return (
      <div className='space-y-4'>
        <Link href='/dashboard/certificados'>
          <Button variant='ghost'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Voltar para certificados
          </Button>
        </Link>

        <Card className='border-red-200 bg-red-50'>
          <CardContent className='flex items-start gap-3 p-5 text-red-700'>
            <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />
            <div>
              <p className='font-semibold'>Falha ao validar certificado</p>
              <p className='text-sm text-red-600'>
                Não foi possível consultar o código agora. Tente novamente em
                instantes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-5'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <Link href='/dashboard/certificados'>
          <Button variant='ghost'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Voltar para certificados
          </Button>
        </Link>

        <Badge
          variant='outline'
          className={
            isValid
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }
        >
          {isValid ? (
            <CheckCircle2 className='mr-1 h-3.5 w-3.5' />
          ) : (
            <ShieldAlert className='mr-1 h-3.5 w-3.5' />
          )}
          {isValid ? 'Certificado válido' : 'Certificado inválido'}
        </Badge>
      </div>

      <Card
        className={`overflow-hidden border shadow-sm ${
          isValid
            ? 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40'
            : 'border-red-200 bg-gradient-to-br from-white to-red-50/40'
        }`}
      >
        <CardHeader>
          <div className='mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm ring-1 ring-slate-200'>
            <Award className='h-6 w-6' />
          </div>
          <CardTitle className='text-2xl text-slate-900'>
            {isValid ? 'Autenticidade confirmada' : 'Não foi possível validar'}
          </CardTitle>
          <p className='text-sm text-slate-600'>
            Código consultado: <span className='font-mono'>{codigo || '-'}</span>
          </p>
        </CardHeader>

        <CardContent className='space-y-5'>
          {isValid && certificado ? (
            <>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <div className='rounded-xl border border-slate-200 bg-white/80 p-4'>
                  <p className='text-xs uppercase tracking-wider text-slate-500'>
                    Curso
                  </p>
                  <p className='mt-1 text-lg font-semibold text-slate-900'>
                    {certificado.curso?.titulo || 'Curso removido'}
                  </p>
                </div>

                <div className='rounded-xl border border-slate-200 bg-white/80 p-4'>
                  <p className='text-xs uppercase tracking-wider text-slate-500'>
                    Aluno
                  </p>
                  <p className='mt-1 text-lg font-semibold text-slate-900'>
                    {certificado.candidato?.nome || 'Aluno'}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                <div className='rounded-xl border border-slate-200 bg-white p-3'>
                  <p className='flex items-center gap-1 text-xs uppercase tracking-wider text-slate-500'>
                    <Clock3 className='h-3.5 w-3.5' />
                    Carga horária
                  </p>
                  <p className='mt-1 font-semibold text-slate-900'>
                    {certificado.cargaHoraria} horas
                  </p>
                </div>

                <div className='rounded-xl border border-slate-200 bg-white p-3'>
                  <p className='flex items-center gap-1 text-xs uppercase tracking-wider text-slate-500'>
                    <CalendarDays className='h-3.5 w-3.5' />
                    Emissão
                  </p>
                  <p className='mt-1 font-semibold text-slate-900'>
                    {formatDate(certificado.dataEmissao)}
                  </p>
                </div>

                <div className='rounded-xl border border-slate-200 bg-white p-3'>
                  <p className='flex items-center gap-1 text-xs uppercase tracking-wider text-slate-500'>
                    <FileCheck className='h-3.5 w-3.5' />
                    Código
                  </p>
                  <p className='mt-1 font-mono font-semibold text-slate-900'>
                    {certificado.codigo}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                <Link href={`/dashboard/certificados/${certificado.id}`}>
                  <Button className='w-full bg-blue-600 hover:bg-blue-700'>
                    Ver certificado completo
                  </Button>
                </Link>

                {certificado.validationUrl ? (
                  <a
                    href={certificado.validationUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Button variant='outline' className='w-full'>
                      <ExternalLink className='mr-2 h-4 w-4' />
                      Abrir link de validação
                    </Button>
                  </a>
                ) : (
                  <Button variant='outline' className='w-full' disabled>
                    Link de validação indisponível
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className='space-y-4'>
              <div className='rounded-xl border border-red-200 bg-white/90 p-4 text-sm text-slate-700'>
                {certificateIsActive === false
                  ? 'Este certificado foi marcado como inativo e não pode ser validado.'
                  : data?.mensagem || 'Certificado não encontrado para o código informado.'}
              </div>

              <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                <Link href='/dashboard/certificados'>
                  <Button className='w-full bg-blue-600 hover:bg-blue-700'>
                    Ir para meus certificados
                  </Button>
                </Link>
                <Link href='/dashboard/cursos'>
                  <Button variant='outline' className='w-full'>
                    Ver cursos
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
