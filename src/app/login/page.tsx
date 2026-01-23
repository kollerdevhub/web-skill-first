'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className='min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white'>
      {/* Left Side: Marketing/Branding (Hidden on Mobile) */}
      <div className='hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 relative overflow-hidden'>
        {/* Abstract Background Shapes */}
        <div className='absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl' />
        <div className='absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl' />

        <div className='relative z-10'>
          <Link href='/' className='flex items-center gap-3 group'>
            <div className='p-3 rounded-2xl bg-white shadow-xl shadow-blue-900/20 group-hover:scale-110 transition-transform'>
              <Sparkles className='h-8 w-8 text-blue-600' />
            </div>
            <span className='text-3xl font-bold text-white tracking-tight'>
              Web Skill First
            </span>
          </Link>
        </div>

        <div className='relative z-10 max-w-lg mb-20'>
          <h2 className='text-5xl font-bold text-white leading-tight mb-6'>
            Impulsione sua <span className='text-blue-200'>carreira</span> com
            novas habilidades.
          </h2>
          <p className='text-xl text-blue-100 leading-relaxed font-light'>
            Acesse os melhores cursos, encontre vagas exclusivas e conquiste
            certificados reconhecidos no mercado. Tudo em um só lugar.
          </p>
        </div>

        <div className='relative z-10 flex items-center gap-6 text-sm text-blue-100/60'>
          <span>© 2026 Web Skill First</span>
          <div className='h-1 w-1 bg-blue-100/40 rounded-full' />
          <span>Plataforma de Elite</span>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className='flex items-center justify-center p-8 bg-slate-50/50 relative'>
        {/* Mobile Header (Hidden on Laptop) */}
        <div className='absolute top-8 left-8 lg:hidden'>
          <Link href='/' className='flex items-center gap-2'>
            <div className='p-2 rounded-xl bg-blue-600'>
              <Sparkles className='h-5 w-5 text-white' />
            </div>
            <span className='text-xl font-bold text-slate-900'>
              Web Skill First
            </span>
          </Link>
        </div>

        <div className='w-full max-w-md space-y-8'>
          <div className='text-center lg:text-left'>
            <h1 className='text-3xl font-extrabold text-slate-900 tracking-tight mb-2'>
              Bem-vindo de volta
            </h1>
            <p className='text-slate-500'>
              Escolha uma forma de acessar sua conta e continuar seu progresso.
            </p>
          </div>

          <div className='bg-white p-2 rounded-[2rem] shadow-2xl shadow-blue-100 border border-blue-50/50'>
            <Card className='border-0 shadow-none bg-transparent'>
              <CardContent className='pt-8 pb-10 px-8 space-y-6'>
                <Button
                  onClick={() =>
                    signIn('google', { callbackUrl: '/auth/redirect' })
                  }
                  className='w-full bg-white hover:bg-slate-50 text-slate-900 font-bold py-8 rounded-2xl border border-slate-200 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm'
                >
                  <svg className='w-6 h-6' viewBox='0 0 24 24'>
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
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    />
                  </svg>
                  <span className='text-lg'>Continuar com Google</span>
                </Button>

                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <span className='w-full border-t border-slate-100' />
                  </div>
                  <div className='relative flex justify-center text-[10px] uppercase tracking-widest text-slate-400 font-bold'>
                    <span className='bg-white px-4'>Acesso Único</span>
                  </div>
                </div>

                <div className='flex flex-col gap-4 items-center pt-2'>
                  <Link
                    href='/'
                    className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors text-sm font-semibold'
                  >
                    <ArrowLeft className='h-4 w-4' />
                    Voltar ao portal inicial
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='text-center space-y-4 pt-4'>
            <p className='text-[10px] text-slate-400 leading-relaxed mx-auto uppercase tracking-wide px-8'>
              Ao continuar, você concorda com nossos{' '}
              <Link
                href='/termos'
                className='text-blue-600 hover:underline font-bold'
              >
                Termos de Serviço
              </Link>{' '}
              e{' '}
              <Link
                href='/privacidade'
                className='text-blue-600 hover:underline font-bold'
              >
                Privacidade
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
