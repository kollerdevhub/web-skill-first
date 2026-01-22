'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4'>
      <Card className='w-full max-w-md bg-white border-slate-200 shadow-xl'>
        <CardHeader className='text-center'>
          <Link
            href='/'
            className='text-3xl font-bold inline-flex items-center justify-center gap-2 mb-4'
          >
            <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
              <Sparkles className='h-5 w-5 text-white' />
            </div>
            <span className='bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent'>
              Web Skill First
            </span>
          </Link>
          <CardTitle className='text-2xl text-slate-900'>
            Bem-vindo de volta
          </CardTitle>
          <CardDescription className='text-slate-500'>
            Entre com sua conta para acessar a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Button
            onClick={() => signIn('google', { callbackUrl: '/auth/redirect' })}
            className='w-full bg-white hover:bg-slate-50 text-slate-900 font-medium py-6 border border-slate-200 shadow-sm'
          >
            <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
              <path
                fill='#4285F4'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              />
              <path
                fill='#34A853'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              />
              <path
                fill='#FBBC05'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              />
              <path
                fill='#EA4335'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              />
            </svg>
            Continuar com Google
          </Button>

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t border-slate-200' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-white px-2 text-slate-400'>Ou</span>
            </div>
          </div>

          <p className='text-center text-sm text-slate-500'>
            Ao continuar, você concorda com nossos{' '}
            <Link href='/termos' className='text-blue-600 hover:text-blue-700'>
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link
              href='/privacidade'
              className='text-blue-600 hover:text-blue-700'
            >
              Política de Privacidade
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
