'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Award,
  Clock,
  Download,
  Eye,
  GraduationCap,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { useMeusCertificados } from '@/hooks';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function CertificateSkeleton() {
  return (
    <Card className='bg-white border-slate-200'>
      <CardContent className='p-6'>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-16 w-16 rounded-xl bg-slate-100' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-5 w-3/4 bg-slate-100' />
            <Skeleton className='h-4 w-1/2 bg-slate-100' />
          </div>
          <Skeleton className='h-10 w-24 bg-slate-100' />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CertificadosPage() {
  const { data: certificados, isLoading, error } = useMeusCertificados();

  const totalHours =
    certificados?.reduce((acc, cert) => acc + cert.cargaHoraria, 0) || 0;

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20'>
          <Award className='h-6 w-6 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>
            Meus Certificados
          </h1>
          <p className='text-slate-500 text-sm'>
            Certificados conquistados na sua jornada
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 gap-4'>
        <Card className='bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg shadow-blue-500/20'>
          <CardContent className='p-6'>
            {isLoading ? (
              <Skeleton className='h-10 w-12 bg-blue-400/30' />
            ) : (
              <p className='text-4xl font-bold text-white'>
                {certificados?.length || 0}
              </p>
            )}
            <p className='text-blue-100'>Certificados</p>
          </CardContent>
        </Card>
        <Card className='bg-gradient-to-br from-amber-500 to-amber-600 border-0 shadow-lg shadow-amber-500/20'>
          <CardContent className='p-6'>
            {isLoading ? (
              <Skeleton className='h-10 w-16 bg-amber-400/30' />
            ) : (
              <p className='text-4xl font-bold text-white'>{totalHours}h</p>
            )}
            <p className='text-amber-100'>Horas de Estudo</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className='bg-red-50 border-red-200'>
          <CardContent className='p-4 flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-red-600' />
            <p className='text-red-600'>
              Erro ao carregar certificados. Tente novamente.
            </p>
          </CardContent>
        </Card>
      )}

      <div className='space-y-4'>
        {isLoading ? (
          <>
            <CertificateSkeleton />
            <CertificateSkeleton />
            <CertificateSkeleton />
          </>
        ) : certificados && certificados.length > 0 ? (
          certificados.map((cert) => (
            <Card
              key={cert.id}
              className='group bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all shadow-sm'
            >
              <CardContent className='p-6'>
                <div className='flex items-center gap-4'>
                  <div className='h-16 w-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center'>
                    <Award className='h-8 w-8 text-amber-600' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors'>
                      {cert.curso?.titulo || 'Curso'}
                    </h3>
                    <p className='text-slate-500 text-sm flex items-center gap-2 flex-wrap'>
                      <span className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        {cert.cargaHoraria}h
                      </span>
                      <span className='text-slate-300'>•</span>
                      <span>Emitido em {formatDate(cert.dataEmissao)}</span>
                      <span className='text-slate-300'>•</span>
                      <span className='font-mono text-xs bg-slate-100 px-2 py-0.5 rounded'>
                        {cert.codigo}
                      </span>
                    </p>
                  </div>
                  <div className='flex gap-2'>
                    {cert.validationUrl && (
                      <a
                        href={cert.validationUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <Button
                          variant='outline'
                          className='border-slate-200 text-slate-600 hover:bg-slate-100'
                        >
                          <ExternalLink className='h-4 w-4 mr-2' />
                          Validar
                        </Button>
                      </a>
                    )}
                    {cert.pdfUrl ? (
                      <a href={cert.pdfUrl} download>
                        <Button className='bg-blue-600 hover:bg-blue-700'>
                          <Download className='h-4 w-4 mr-2' />
                          Download
                        </Button>
                      </a>
                    ) : (
                      <Link href={`/dashboard/certificados/${cert.id}`}>
                        <Button className='bg-blue-600 hover:bg-blue-700'>
                          <Eye className='h-4 w-4 mr-2' />
                          Visualizar
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className='bg-white border-slate-200'>
            <CardContent className='p-8 text-center'>
              <div className='inline-flex p-4 rounded-full bg-slate-100 mb-4'>
                <GraduationCap className='h-10 w-10 text-slate-400' />
              </div>
              <p className='text-slate-600 mb-2'>
                Você ainda não tem certificados
              </p>
              <p className='text-slate-500 text-sm mb-4'>
                Complete cursos para conquistar seus certificados
              </p>
              <Link href='/dashboard/cursos'>
                <Button className='bg-blue-600 hover:bg-blue-700'>
                  Explorar Cursos
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
