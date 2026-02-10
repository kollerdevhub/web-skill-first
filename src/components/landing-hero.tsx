'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronRight } from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

export function LandingHero() {
  const { user } = useFirebaseAuth();

  return (
    <section className='container mx-auto px-4 py-16 md:py-28 text-center'>
      <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8'>
        <Sparkles className='h-4 w-4' />
        Plataforma de Desenvolvimento Profissional
      </div>
      <h1 className='text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight'>
        Sua jornada para o <span className='text-blue-600'>sucesso</span> começa
        aqui
      </h1>
      <p className='text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed'>
        Plataforma completa para desenvolvimento profissional com cursos, vagas
        de emprego e certificações.
      </p>
      <div className='flex flex-col sm:flex-row gap-3 justify-center'>
        <Link
          href={user ? '/dashboard' : '/login'}
          className='w-full sm:w-auto'
        >
          <Button
            size='lg'
            className='w-full bg-blue-600 hover:bg-blue-700 text-white'
          >
            {user ? 'Acessar Dashboard' : 'Começar Agora'}
            <ChevronRight className='h-4 w-4 ml-2' />
          </Button>
        </Link>
        <Link href='/cursos' className='w-full sm:w-auto'>
          <Button
            size='lg'
            variant='outline'
            className='w-full border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
          >
            Ver Cursos
          </Button>
        </Link>
      </div>
    </section>
  );
}
