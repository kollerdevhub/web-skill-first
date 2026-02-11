'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCertificado } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { downloadCertificatePdf } from '@/lib/pdf/certificate-pdf';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Printer,
  Share2,
} from 'lucide-react';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function CertificadoDetalhePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';
  const [copied, setCopied] = useState(false);

  const { data: certificado, isLoading, error } = useCertificado(id);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!certificado) return;

    const shareUrl = certificado.validationUrl || window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Certificado - ${certificado.curso?.titulo || 'Curso'}`,
          text: 'Confira meu certificado:',
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Intencional: usuário pode cancelar o share
    }
  };

  const handleCopyCode = async () => {
    if (!certificado) return;

    try {
      await navigator.clipboard.writeText(certificado.codigo);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Falha de clipboard não deve quebrar a UI
    }
  };

  const handleDownloadPdf = () => {
    if (!certificado) return;

    downloadCertificatePdf({
      codigo: certificado.codigo,
      studentName: certificado.candidato?.nome || 'Aluno',
      courseTitle: certificado.curso?.titulo || 'Curso',
      issuedAt: certificado.dataEmissao,
      workloadHours: certificado.cargaHoraria || 0,
      validationUrl: certificado.validationUrl,
    });
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='h-10 w-32 rounded-lg bg-slate-100 animate-pulse' />
        <Card className='border-slate-200'>
          <CardContent className='flex h-[420px] items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !certificado) {
    return (
      <div className='space-y-4'>
        <Link href='/dashboard/certificados'>
          <Button variant='ghost'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Voltar
          </Button>
        </Link>

        <Card className='border-red-200 bg-red-50'>
          <CardContent className='flex items-center gap-2 p-5 text-red-700'>
            <AlertCircle className='h-5 w-5' />
            Certificado não encontrado.
          </CardContent>
        </Card>
      </div>
    );
  }

  const courseTitle = certificado.curso?.titulo?.trim() || 'Curso removido';
  const studentName = certificado.candidato?.nome || 'Aluno';

  return (
    <div className='space-y-5 pb-10 print:pb-0'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden'>
        <Link href='/dashboard/certificados'>
          <Button variant='outline' className='border-slate-200'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Voltar para certificados
          </Button>
        </Link>

        <div className='flex flex-wrap items-center gap-2'>
          <Button variant='outline' onClick={handleCopyCode}>
            {copied ? (
              <Check className='mr-2 h-4 w-4 text-emerald-600' />
            ) : (
              <Copy className='mr-2 h-4 w-4' />
            )}
            Copiar código
          </Button>
          <Button variant='outline' onClick={handlePrint}>
            <Printer className='mr-2 h-4 w-4' />
            Imprimir
          </Button>
          <Button variant='outline' onClick={handleDownloadPdf}>
            <Download className='mr-2 h-4 w-4' />
            Baixar PDF
          </Button>
          <Button onClick={handleShare} className='bg-blue-600 hover:bg-blue-700'>
            <Share2 className='mr-2 h-4 w-4' />
            Compartilhar
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-3 print:hidden'>
        <Card className='border-slate-200 shadow-sm'>
          <CardContent className='flex items-center gap-3 p-4'>
            <div className='rounded-lg bg-amber-50 p-2 text-amber-700'>
              <Award className='h-5 w-5' />
            </div>
            <div>
              <p className='text-xs uppercase tracking-wide text-slate-500'>
                Código
              </p>
              <p className='font-mono text-sm font-semibold text-slate-900'>
                {certificado.codigo}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='border-slate-200 shadow-sm'>
          <CardContent className='flex items-center gap-3 p-4'>
            <div className='rounded-lg bg-blue-50 p-2 text-blue-700'>
              <CalendarDays className='h-5 w-5' />
            </div>
            <div>
              <p className='text-xs uppercase tracking-wide text-slate-500'>
                Emissão
              </p>
              <p className='text-sm font-semibold text-slate-900'>
                {formatDate(certificado.dataEmissao)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='border-slate-200 shadow-sm'>
          <CardContent className='flex items-center gap-3 p-4'>
            <div className='rounded-lg bg-emerald-50 p-2 text-emerald-700'>
              <Clock3 className='h-5 w-5' />
            </div>
            <div>
              <p className='text-xs uppercase tracking-wide text-slate-500'>
                Carga horária
              </p>
              <p className='text-sm font-semibold text-slate-900'>
                {certificado.cargaHoraria} horas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='overflow-hidden border-slate-200 bg-white shadow-lg print:shadow-none print:border-none'>
        <CardContent className='relative p-0 print:p-0'>
          <div className='relative overflow-hidden bg-[radial-gradient(1000px_500px_at_20%_-20%,rgba(59,130,246,0.12),transparent),radial-gradient(800px_400px_at_95%_0%,rgba(245,158,11,0.14),transparent)] px-4 py-5 sm:px-7 sm:py-7 md:px-10 md:py-10 print:bg-none print:p-0'>
            <div className='relative rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm md:p-10 print:rounded-none print:border-none print:shadow-none'>
              <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-amber-200 bg-amber-100 text-amber-700'>
                <Award className='h-8 w-8' />
              </div>

              <p className='text-xs uppercase tracking-[0.35em] text-slate-500'>
                Certificado de Conclusão
              </p>
              <h1 className='mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl'>
                {courseTitle}
              </h1>

              <div className='mx-auto mt-6 max-w-2xl space-y-4 text-slate-600'>
                <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>
                  Certificamos que
                </p>
                <p className='text-2xl font-bold text-blue-900 md:text-3xl'>
                  {studentName}
                </p>
                <p className='text-base leading-relaxed md:text-lg'>
                  concluiu com êxito o curso acima, com carga horária de{' '}
                  <strong className='text-slate-900'>
                    {certificado.cargaHoraria} horas
                  </strong>{' '}
                  e emissão em{' '}
                  <strong className='text-slate-900'>
                    {formatDate(certificado.dataEmissao)}
                  </strong>
                  .
                </p>
              </div>

              <div className='mt-7 flex flex-wrap items-center justify-center gap-2 print:hidden'>
                {certificado.validationUrl ? (
                  <a
                    href={certificado.validationUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Button variant='outline'>
                      <ExternalLink className='mr-2 h-4 w-4' />
                      Validar autenticidade
                    </Button>
                  </a>
                ) : null}
                <Button variant='outline' onClick={handleDownloadPdf}>
                  <Download className='mr-2 h-4 w-4' />
                  Baixar PDF
                </Button>
              </div>

              <div className='mt-8 flex flex-col gap-5 border-t border-slate-200 pt-6 text-left md:flex-row md:items-end md:justify-between'>
                <div>
                  <p className='text-xs uppercase tracking-wider text-slate-500'>
                    Emissor
                  </p>
                  <p className='mt-1 text-sm font-semibold text-slate-900'>
                    Web Skill First Education
                  </p>
                  <Badge
                    variant='outline'
                    className='mt-2 border-emerald-200 bg-emerald-50 text-emerald-700'
                  >
                    Certificado ativo
                  </Badge>
                </div>

                <div className='text-right'>
                  {certificado.validationUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(certificado.validationUrl)}`}
                      alt='QR Code de validação do certificado'
                      className='ml-auto h-16 w-16 rounded border border-slate-200 bg-white p-1'
                    />
                  ) : null}
                  <p className='mt-2 text-xs text-slate-500'>
                    Código de validação
                  </p>
                  <p className='font-mono text-xs font-semibold text-slate-700'>
                    {certificado.codigo}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
