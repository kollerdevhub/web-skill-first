'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Info, ListVideo } from 'lucide-react';

export default function AdminVideosPage() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
          <ListVideo className='h-6 w-6 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Vídeos</h1>
          <p className='text-slate-500 text-sm'>
            Fluxo migrado para trilha de módulos por curso
          </p>
        </div>
      </div>

      <Card className='bg-white border-slate-200 shadow-sm'>
        <CardHeader>
          <CardTitle className='text-slate-900 flex items-center gap-2'>
            <Info className='h-5 w-5 text-blue-600' />
            Gestão de vídeo por curso
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-slate-600'>
          <p>
            A biblioteca global de vídeos foi descontinuada para evitar duplicidade.
          </p>
          <p>
            Agora cada vídeo deve ser enviado dentro de um módulo em{' '}
            <strong>/admin/cursos/[id]</strong>, mantendo a trilha organizada.
          </p>

          <div className='flex flex-wrap gap-3 pt-2'>
            <Link href='/admin/cursos'>
              <Button className='bg-blue-600 hover:bg-blue-700'>
                Ir para cursos
                <ArrowRight className='h-4 w-4 ml-2' />
              </Button>
            </Link>
            <Link href='/admin/cursos/new'>
              <Button
                variant='outline'
                className='border-slate-200 text-slate-600 hover:bg-slate-100'
              >
                Criar novo curso
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
