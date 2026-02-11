'use client';

import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  ExternalLink,
  FileCheck,
  Filter,
  GraduationCap,
  Sparkles,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { useMeusCertificados } from '@/hooks';
import { downloadCertificatePdf } from '@/lib/pdf/certificate-pdf';

type CertificateFilter = 'todos' | 'com-pdf' | 'com-validacao';

const CATEGORY_LABELS: Record<string, string> = {
  tecnico: 'Técnico',
  comportamental: 'Comportamental',
  idiomas: 'Idiomas',
  gestao: 'Gestão',
  outros: 'Outros',
};

const LEVEL_LABELS: Record<string, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function CertificateSkeleton() {
  return (
    <Card className='h-full overflow-hidden border-slate-200 bg-white shadow-sm'>
      <CardHeader className='space-y-3 border-b border-slate-100 bg-slate-50/70'>
        <Skeleton className='h-5 w-24 bg-slate-200' />
        <Skeleton className='h-6 w-4/5 bg-slate-200' />
      </CardHeader>
      <CardContent className='space-y-4 p-5'>
        <Skeleton className='h-4 w-40 bg-slate-100' />
        <Skeleton className='h-4 w-32 bg-slate-100' />
        <Skeleton className='h-4 w-36 bg-slate-100' />
        <div className='grid grid-cols-2 gap-2 pt-2'>
          <Skeleton className='h-9 w-full bg-slate-100' />
          <Skeleton className='h-9 w-full bg-slate-100' />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CertificadosPage() {
  const { data: certificados, isLoading, error } = useMeusCertificados();
  const [filter, setFilter] = useState<CertificateFilter>('todos');

  const safeCertificates = useMemo(() => certificados ?? [], [certificados]);

  const totalHours = useMemo(
    () =>
      safeCertificates.reduce((acc, certificado) => {
        return acc + (certificado.cargaHoraria || 0);
      }, 0),
    [safeCertificates],
  );

  const withPdfCount = useMemo(
    () => safeCertificates.length,
    [safeCertificates],
  );

  const withValidationCount = useMemo(
    () =>
      safeCertificates.filter((certificado) => !!certificado.validationUrl)
        .length,
    [safeCertificates],
  );

  const latestCertificateDate = useMemo(() => {
    if (!safeCertificates.length) return '-';
    const latest = [...safeCertificates].sort(
      (a, b) =>
        new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime(),
    )[0];
    return formatDate(latest.dataEmissao);
  }, [safeCertificates]);

  const filteredCertificates = useMemo(() => {
    if (filter === 'com-pdf') {
      return safeCertificates;
    }
    if (filter === 'com-validacao') {
      return safeCertificates.filter(
        (certificado) => !!certificado.validationUrl,
      );
    }
    return safeCertificates;
  }, [filter, safeCertificates]);

  const emptyStateText = {
    todos: {
      title: 'Você ainda não possui certificados',
      description:
        'Conclua seus cursos para desbloquear certificados e comprovar sua evolução.',
    },
    'com-pdf': {
      title: 'Nenhum certificado disponível para download',
      description:
        'Quando seus certificados forem emitidos, você poderá baixar o PDF nesta aba.',
    },
    'com-validacao': {
      title: 'Nenhum certificado com link de validação',
      description:
        'Os certificados com validação online aparecerão aqui para compartilhamento externo.',
    },
  }[filter];

  return (
    <div className='space-y-6'>
      <section className='relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm'>
        <div className='absolute -top-24 right-8 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl' />
        <div className='absolute -bottom-24 left-8 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl' />

        <div className='relative px-6 py-7 md:px-8 md:py-8'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='flex items-start gap-4'>
              <div className='mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25'>
                <Award className='h-6 w-6' />
              </div>
              <div>
                <h1 className='text-2xl font-bold tracking-tight text-slate-900 md:text-3xl'>
                  Meus Certificados
                </h1>
                <p className='mt-1 text-sm text-slate-600 md:text-base'>
                  Sua vitrine de conquistas para comprovar aprendizado e
                  evolução.
                </p>
                <div className='mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600'>
                  <Badge
                    variant='outline'
                    className='border-blue-200 bg-blue-50 text-blue-700'
                  >
                    <FileCheck className='mr-1 h-3.5 w-3.5' />
                    {safeCertificates.length} certificados
                  </Badge>
                  <Badge
                    variant='outline'
                    className='border-amber-200 bg-amber-50 text-amber-700'
                  >
                    <Clock className='mr-1 h-3.5 w-3.5' />
                    {totalHours}h acumuladas
                  </Badge>
                  <Badge
                    variant='outline'
                    className='border-emerald-200 bg-emerald-50 text-emerald-700'
                  >
                    <CalendarDays className='mr-1 h-3.5 w-3.5' />
                    Último em {latestCertificateDate}
                  </Badge>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Link href='/dashboard/cursos'>
                <Button variant='outline' className='border-slate-200'>
                  <GraduationCap className='mr-2 h-4 w-4' />
                  Continuar aprendendo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card className='border-slate-200 shadow-sm'>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-500'>Emitidos</p>
                <p className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
                  {isLoading ? '-' : safeCertificates.length}
                </p>
              </div>
              <div className='rounded-xl bg-blue-50 p-2.5 text-blue-700'>
                <Trophy className='h-5 w-5' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-slate-200 shadow-sm'>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-500'>Com PDF</p>
                <p className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
                  {isLoading ? '-' : withPdfCount}
                </p>
              </div>
              <div className='rounded-xl bg-amber-50 p-2.5 text-amber-700'>
                <Download className='h-5 w-5' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-slate-200 shadow-sm'>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-500'>Com validação</p>
                <p className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
                  {isLoading ? '-' : withValidationCount}
                </p>
              </div>
              <div className='rounded-xl bg-emerald-50 p-2.5 text-emerald-700'>
                <CheckCircle2 className='h-5 w-5' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='flex items-center gap-2 p-4 text-red-700'>
            <AlertCircle className='h-5 w-5 text-red-600' />
            <p>
              Não foi possível carregar seus certificados no momento. Tente
              novamente em alguns instantes.
            </p>
          </CardContent>
        </Card>
      )}

      <section className='space-y-4'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='flex items-center gap-2 text-xl font-bold text-slate-900'>
              <Sparkles className='h-5 w-5 text-blue-600' />
              Biblioteca de Certificados
            </h2>
            <p className='mt-1 text-sm text-slate-500'>
              Filtre e acesse rapidamente os certificados que você quer
              compartilhar.
            </p>
          </div>

          <Tabs
            value={filter}
            onValueChange={(value) => setFilter(value as CertificateFilter)}
            className='w-full sm:w-auto'
          >
            <TabsList className='h-10 w-full justify-start gap-1 rounded-xl bg-slate-100 p-1 sm:w-auto'>
              <TabsTrigger value='todos' className='rounded-lg'>
                Todos ({safeCertificates.length})
              </TabsTrigger>
              <TabsTrigger value='com-pdf' className='rounded-lg'>
                PDF ({withPdfCount})
              </TabsTrigger>
              <TabsTrigger value='com-validacao' className='rounded-lg'>
                <Filter className='mr-1 h-3.5 w-3.5' />
                Validação ({withValidationCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
            <CertificateSkeleton />
            <CertificateSkeleton />
            <CertificateSkeleton />
          </div>
        ) : filteredCertificates.length > 0 ? (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {filteredCertificates.map((certificado) => {
              const categoryLabel = certificado.curso?.categoria
                ? CATEGORY_LABELS[certificado.curso.categoria] ||
                  certificado.curso.categoria
                : 'Curso indisponível';

              const levelLabel = certificado.curso?.nivel
                ? LEVEL_LABELS[certificado.curso.nivel] ||
                  certificado.curso.nivel
                : null;

              const courseTitle =
                certificado.curso?.titulo?.trim() || 'Curso removido';
              const handleDownloadPdf = () => {
                downloadCertificatePdf({
                  codigo: certificado.codigo,
                  studentName: certificado.candidato?.nome || 'Aluno',
                  courseTitle: certificado.curso?.titulo || 'Curso',
                  issuedAt: certificado.dataEmissao,
                  workloadHours: certificado.cargaHoraria || 0,
                  validationUrl: certificado.validationUrl,
                });
              };

              return (
                <Card
                  key={certificado.id}
                  className='group h-full overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg'
                >
                  <CardHeader className='space-y-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50/40'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='space-y-2'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <Badge
                            variant='outline'
                            className='border-blue-200 bg-blue-50 text-blue-700'
                          >
                            {categoryLabel}
                          </Badge>
                          {levelLabel ? (
                            <Badge
                              variant='outline'
                              className='border-slate-200 bg-white text-slate-600'
                            >
                              {levelLabel}
                            </Badge>
                          ) : null}
                        </div>
                        <CardTitle className='line-clamp-2 text-xl leading-tight text-slate-900'>
                          {courseTitle}
                        </CardTitle>
                        <CardDescription className='font-mono text-xs uppercase tracking-wide text-slate-500'>
                          Código: {certificado.codigo}
                        </CardDescription>
                      </div>

                      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm ring-1 ring-slate-200'>
                        <Award className='h-5 w-5' />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className='space-y-4 p-5'>
                    <div className='space-y-2 text-sm text-slate-600'>
                      <div className='flex items-center gap-2'>
                        <Clock className='h-4 w-4 text-slate-400' />
                        <span>{certificado.cargaHoraria} horas de carga</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <CalendarDays className='h-4 w-4 text-slate-400' />
                        <span>
                          Emitido em {formatDate(certificado.dataEmissao)}
                        </span>
                      </div>
                    </div>

                    <div className='flex flex-wrap gap-2'>
                      {certificado.validationUrl ? (
                        <Badge
                          variant='outline'
                          className='border-emerald-200 bg-emerald-50 text-emerald-700'
                        >
                          <CheckCircle2 className='mr-1 h-3.5 w-3.5' />
                          Validação disponível
                        </Badge>
                      ) : (
                        <Badge
                          variant='outline'
                          className='border-slate-200 bg-slate-50 text-slate-500'
                        >
                          Sem validação externa
                        </Badge>
                      )}
                      <Badge
                        variant='outline'
                        className='border-blue-200 bg-blue-50 text-blue-700'
                      >
                        <Download className='mr-1 h-3.5 w-3.5' />
                        PDF disponível
                      </Badge>
                    </div>

                    <div className='grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2'>
                      <Link
                        href={`/dashboard/certificados/${certificado.id}`}
                        className='sm:col-span-2'
                      >
                        <Button className='w-full bg-blue-600 hover:bg-blue-700'>
                          <Eye className='mr-2 h-4 w-4' />
                          Visualizar certificado
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
                            Validar
                          </Button>
                        </a>
                      ) : (
                        <Button variant='outline' className='w-full' disabled>
                          Validar
                        </Button>
                      )}

                      <Button
                        variant='outline'
                        className='w-full'
                        onClick={handleDownloadPdf}
                      >
                        <Download className='mr-2 h-4 w-4' />
                        Baixar PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className='border-dashed border-slate-300 bg-slate-50/80'>
            <CardContent className='p-10 text-center md:p-14'>
              <div className='mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200'>
                <GraduationCap className='h-8 w-8' />
              </div>
              <h3 className='text-xl font-bold text-slate-900'>
                {emptyStateText.title}
              </h3>
              <p className='mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-500'>
                {emptyStateText.description}
              </p>
              <div className='mt-6 flex flex-wrap items-center justify-center gap-2'>
                <Link href='/dashboard/cursos'>
                  <Button className='bg-blue-600 hover:bg-blue-700'>
                    Explorar cursos
                  </Button>
                </Link>
                <Link href='/dashboard/explorar-cursos'>
                  <Button variant='outline'>Ver trilhas sugeridas</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
