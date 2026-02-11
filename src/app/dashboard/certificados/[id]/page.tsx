'use client';

import { useParams } from 'next/navigation';
import { useCertificado } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft, Printer, Share2, Award } from 'lucide-react';
import Link from 'next/link';

export default function CertificadoDetalhePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';

  const { data: certificado, isLoading, error } = useCertificado(id);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-[50vh]'>
        <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
      </div>
    );
  }

  if (error || !certificado) {
    return (
      <div className='space-y-4'>
        <Link href='/dashboard/certificados'>
          <Button variant='ghost'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Voltar
          </Button>
        </Link>
        <Card className='bg-red-50 border-red-200'>
          <CardContent className='p-6 text-red-600 flex items-center gap-2'>
            <AlertCircle className='h-5 w-5' />
            Certificado não encontrado.
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className='space-y-6 max-w-4xl mx-auto pb-10 print:p-0 print:max-w-none'>
      <div className='flex items-center justify-between print:hidden'>
        <Link href='/dashboard/certificados'>
          <Button variant='ghost'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Voltar para Certificados
          </Button>
        </Link>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={handlePrint}>
            <Printer className='h-4 w-4 mr-2' />
            Imprimir
          </Button>
        </div>
      </div>

      <div className='relative bg-white text-slate-900 shadow-xl print:shadow-none border-8 border-double border-slate-200 p-10 md:p-20 text-center space-y-8 aspect-[1.414] flex flex-col justify-center print:border-none'>
        {/* Background Watermark/Pattern if needed */}
        <div className='absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none'>
          <Award className='w-96 h-96' />
        </div>

        <div className='relative z-10 space-y-2'>
          <div className='flex justify-center mb-6'>
            <div className='h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center border-4 border-amber-200'>
              <Award className='h-10 w-10 text-amber-600' />
            </div>
          </div>

          <h1 className='text-4xl md:text-5xl font-serif font-bold text-slate-800 tracking-wide uppercase'>
            Certificado de Conclusão
          </h1>
          <p className='text-slate-500 uppercase tracking-widest text-sm'>
            Certificamos que
          </p>
        </div>

        <div className='relative z-10'>
          <h2 className='text-3xl md:text-4xl font-bold text-blue-900 border-b-2 border-slate-100 pb-4 inline-block px-8'>
            {certificado.candidato?.nome || 'Aluno'}
          </h2>
        </div>

        <div className='relative z-10 space-y-4'>
          <p className='text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed'>
            concluiu com êxito o curso de{' '}
            <strong className='text-slate-900 font-bold'>
              {certificado.curso?.titulo}
            </strong>
            , com carga horária de{' '}
            <strong className='text-slate-900'>
              {certificado.cargaHoraria} horas
            </strong>
            , em {new Date(certificado.dataEmissao).toLocaleDateString()}.
          </p>
        </div>

        <div className='relative z-10 pt-12 flex flex-col md:flex-row justify-between items-end px-12 gap-8'>
          <div className='text-center space-y-2'>
            <div className='h-px w-48 bg-slate-300' />
            <p className='text-xs text-slate-400 uppercase tracking-wider'>
              SkillFirst Education
            </p>
          </div>

          <div className='text-right space-y-1'>
            <div className='h-20 w-20 bg-white p-2 border border-slate-200 inline-block'>
              {/* QR Code placeholder */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${certificado.validationUrl || ''}`}
                alt='Validation QR Code'
                className='w-full h-full object-contain'
              />
            </div>
            <p className='text-[10px] text-slate-400 font-mono'>
              Código: {certificado.codigo}
            </p>
            <p className='text-[10px] text-slate-400'>
              Valide em:{' '}
              {new Date(certificado.dataEmissao).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { AlertCircle } from 'lucide-react';
