'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Clock, User, Download, Eye, GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface Certificate {
  id: string;
  courseName: string;
  completedAt: string;
  instructor: string;
  duration: number;
}

const fetchCertificates = async (): Promise<Certificate[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: '1',
      courseName: 'JavaScript Moderno ES6+',
      completedAt: '10/01/2024',
      instructor: 'João Silva',
      duration: 12,
    },
    {
      id: '2',
      courseName: 'CSS Avançado e Flexbox',
      completedAt: '25/12/2023',
      instructor: 'Maria Santos',
      duration: 8,
    },
    {
      id: '3',
      courseName: 'Git e GitHub Completo',
      completedAt: '15/12/2023',
      instructor: 'Pedro Costa',
      duration: 6,
    },
    {
      id: '4',
      courseName: 'HTML5 e Semântica',
      completedAt: '01/12/2023',
      instructor: 'Ana Lima',
      duration: 4,
    },
    {
      id: '5',
      courseName: 'Lógica de Programação',
      completedAt: '20/11/2023',
      instructor: 'Carlos Mendes',
      duration: 10,
    },
  ];
};

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
  const {
    data: certificates,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['certificates'],
    queryFn: fetchCertificates,
  });

  const totalHours =
    certificates?.reduce((acc, cert) => acc + cert.duration, 0) || 0;

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
            <p className='text-4xl font-bold text-white'>
              {certificates?.length || 0}
            </p>
            <p className='text-blue-100'>Certificados</p>
          </CardContent>
        </Card>
        <Card className='bg-gradient-to-br from-amber-500 to-amber-600 border-0 shadow-lg shadow-amber-500/20'>
          <CardContent className='p-6'>
            <p className='text-4xl font-bold text-white'>{totalHours}h</p>
            <p className='text-amber-100'>Horas de Estudo</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className='bg-red-50 border-red-200'>
          <CardContent className='p-4'>
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
        ) : (
          certificates?.map((cert) => (
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
                      {cert.courseName}
                    </h3>
                    <p className='text-slate-500 text-sm flex items-center gap-2'>
                      <User className='h-3 w-3' />
                      {cert.instructor}
                      <span className='text-slate-300'>•</span>
                      <Clock className='h-3 w-3' />
                      {cert.duration}h<span className='text-slate-300'>•</span>
                      Concluído em {cert.completedAt}
                    </p>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      className='border-slate-200 text-slate-600 hover:bg-slate-100'
                    >
                      <Eye className='h-4 w-4 mr-2' />
                      Visualizar
                    </Button>
                    <Button className='bg-blue-600 hover:bg-blue-700'>
                      <Download className='h-4 w-4 mr-2' />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {certificates?.length === 0 && (
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
  );
}
