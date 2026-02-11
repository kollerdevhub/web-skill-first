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
  Calendar,
  Sparkles,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { useMeusCertificados } from '@/hooks';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function CertificateSkeleton() {
  return (
    <Card className='bg-white border-slate-200 overflow-hidden h-full'>
      <div className='h-32 bg-slate-100 animate-pulse' />
      <CardContent className='p-6 space-y-4'>
        <Skeleton className='h-6 w-3/4 bg-slate-100' />
        <Skeleton className='h-4 w-1/2 bg-slate-100' />
        <div className='flex gap-2 pt-2'>
          <Skeleton className='h-9 w-full bg-slate-100' />
          <Skeleton className='h-9 w-full bg-slate-100' />
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
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <div className='h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 flex items-center justify-center shrink-0 text-white'>
          <Award className='h-6 w-6' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-slate-900 tracking-tight'>
            Meus Certificados
          </h1>
          <p className='text-slate-500 text-lg'>
            Gerencie suas conquistas e comprove seu conhecimento
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card className='group relative overflow-hidden border-0 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 text-white'>
          <div className='absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110'>
            <Award className='h-32 w-32' />
          </div>
          <CardContent className='p-8 relative z-10'>
            <div className='flex items-center gap-4 mb-2'>
              <div className='p-3 bg-white/10 rounded-xl backdrop-blur-sm'>
                <Trophy className='h-6 w-6' />
              </div>
              <p className='font-medium text-indigo-100'>
                Total de Certificados
              </p>
            </div>
            {isLoading ? (
              <Skeleton className='h-12 w-24 bg-white/20' />
            ) : (
              <p className='text-5xl font-bold tracking-tighter'>
                {certificados?.length || 0}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className='group relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-500/20 text-white'>
          <div className='absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110'>
            <Clock className='h-32 w-32' />
          </div>
          <CardContent className='p-8 relative z-10'>
            <div className='flex items-center gap-4 mb-2'>
              <div className='p-3 bg-white/10 rounded-xl backdrop-blur-sm'>
                <Sparkles className='h-6 w-6' />
              </div>
              <p className='font-medium text-amber-100'>Horas de Dedicação</p>
            </div>
            {isLoading ? (
              <Skeleton className='h-12 w-32 bg-white/20' />
            ) : (
              <p className='text-5xl font-bold tracking-tighter'>
                {totalHours}h
              </p>
            )}
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

      {/* Grid */}
      <h2 className='text-xl font-bold text-slate-900 flex items-center gap-2 mt-8'>
        <GraduationCap className='h-5 w-5 text-slate-400' />
        Galeria de Conquistas
      </h2>

      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <CertificateSkeleton />
          <CertificateSkeleton />
          <CertificateSkeleton />
        </div>
      ) : certificados && certificados.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {certificados.map((cert) => (
            <Card
              key={cert.id}
              className='group bg-white border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden'
            >
              <div className='h-32 bg-slate-50 relative border-b border-slate-100 overflow-hidden group-hover:bg-blue-50/50 transition-colors'>
                <div className='absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]' />
                <div className='absolute top-4 right-4'>
                  {cert.pdfUrl ? (
                    <a href={cert.pdfUrl} download>
                      <Button
                        size='icon'
                        variant='secondary'
                        className='h-8 w-8 rounded-full bg-white shadow-sm hover:bg-blue-600 hover:text-white transition-colors'
                      >
                        <Download className='h-4 w-4' />
                      </Button>
                    </a>
                  ) : null}
                </div>
                <div className='absolute -bottom-6 left-6'>
                  <div className='h-12 w-12 bg-white rounded-xl shadow-md border border-slate-100 flex items-center justify-center'>
                    <Award className='h-7 w-7 text-amber-500' />
                  </div>
                </div>
              </div>
              <CardContent className='p-6 pt-10 flex-1 flex flex-col'>
                <h3 className='font-bold text-lg text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors'>
                  {cert.curso?.titulo || 'Curso sem título'}
                </h3>

                <div className='space-y-2 mt-auto'>
                  <div className='flex items-center gap-2 text-sm text-slate-500'>
                    <Clock className='h-4 w-4 text-slate-400' />
                    <span>{cert.cargaHoraria} horas</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-slate-500'>
                    <Calendar className='h-4 w-4 text-slate-400' />
                    <span>{formatDate(cert.dataEmissao)}</span>
                  </div>
                </div>

                <div className='mt-6 pt-4 border-t border-slate-100 flex gap-2'>
                  {cert.validationUrl ? (
                    <a
                      href={cert.validationUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex-1'
                    >
                      <Button
                        variant='outline'
                        className='w-full border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      >
                        <ExternalLink className='h-4 w-4 mr-2' />
                        Validar
                      </Button>
                    </a>
                  ) : null}
                  <Link
                    href={`/dashboard/certificados/${cert.id}`}
                    className='flex-1'
                  >
                    <Button className='w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'>
                      <Eye className='h-4 w-4 mr-2' />
                      Visualizar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className='border-dashed border-2 border-slate-200 bg-slate-50/50'>
          <CardContent className='p-12 text-center'>
            <div className='inline-flex p-6 rounded-full bg-white shadow-sm mb-6'>
              <GraduationCap className='h-12 w-12 text-slate-300' />
            </div>
            <h3 className='text-xl font-bold text-slate-900 mb-2'>
              Sua galeria está vazia
            </h3>
            <p className='text-slate-500 mb-8 max-w-md mx-auto leading-relaxed'>
              Complete cursos para ganhar certificados e demonstrar suas
              habilidades para o mercado.
            </p>
            <Link href='/dashboard/cursos'>
              <Button
                size='lg'
                className='bg-blue-600 hover:bg-blue-700 font-semibold px-8'
              >
                Explorar Cursos
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
