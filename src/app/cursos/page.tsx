'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCursos } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  BookOpen,
  Clock,
  Loader2,
  Search,
  Sparkles,
} from 'lucide-react';

export default function PublicCoursesPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useCursos({
    q: search || undefined,
    page: 1,
    limit: 24,
  });

  return (
    <main className='min-h-screen bg-slate-50'>
      <div className='max-w-7xl mx-auto px-4 py-10 space-y-6'>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
            <Sparkles className='h-6 w-6 text-white' />
          </div>
          <div>
            <h1 className='text-3xl font-bold text-slate-900'>Cursos</h1>
            <p className='text-slate-500 text-sm'>
              Explore trilhas de aprendizado para acelerar sua carreira
            </p>
          </div>
        </div>

        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder='Buscar cursos...'
                className='pl-10 border-slate-200'
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className='bg-red-50 border-red-200'>
            <CardContent className='p-4 flex items-center gap-2 text-red-700'>
              <AlertCircle className='h-5 w-5' />
              Não foi possível carregar os cursos no momento.
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className='flex items-center justify-center h-[40vh]'>
            <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
          </div>
        ) : data?.data?.length ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {data.data.map((curso) => (
              <Card
                key={curso.id}
                className='bg-white border-slate-200 shadow-sm overflow-hidden'
              >
                <div className='aspect-video bg-slate-100'>
                  {curso.thumbnailUrl ? (
                    <img
                      src={curso.thumbnailUrl}
                      alt={curso.titulo}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <BookOpen className='h-10 w-10 text-slate-300' />
                    </div>
                  )}
                </div>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-lg text-slate-900 line-clamp-2'>
                    {curso.titulo}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <p className='text-sm text-slate-500 line-clamp-3'>
                    {curso.descricao}
                  </p>
                  <div className='flex items-center gap-2 text-xs text-slate-500'>
                    <Clock className='h-3.5 w-3.5' />
                    {curso.cargaHoraria}h
                  </div>
                  <Link href='/login' className='block'>
                    <Button className='w-full bg-blue-600 hover:bg-blue-700'>
                      Entrar para se inscrever
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className='bg-slate-50 border-slate-200'>
            <CardContent className='p-12 text-center text-slate-500'>
              Nenhum curso encontrado.
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

