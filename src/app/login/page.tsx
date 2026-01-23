'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className='min-h-screen bg-[#020617] relative flex items-center justify-center px-4 overflow-hidden'>
      {/* Dynamic Background Elements */}
      <div className='absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob' />
      <div className='absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000' />
      <div className='absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000' />

      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

      <Card className='w-full max-w-md bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl relative z-10 overflow-hidden'>
        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' />

        <CardHeader className='text-center pt-10'>
          <Link
            href='/'
            className='inline-flex items-center justify-center gap-2 mb-6 group'
          >
            <div className='p-2.5 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform'>
              <Sparkles className='h-6 w-6 text-white' />
            </div>
            <span className='text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent'>
              Web Skill First
            </span>
          </Link>
          <CardTitle className='text-2xl text-white font-bold tracking-tight'>
            Bem-vindo de volta
          </CardTitle>
          <p className='text-slate-400 text-sm mt-2'>
            Escolha uma forma de acessar sua conta
          </p>
        </CardHeader>

        <CardContent className='space-y-6 pb-10'>
          <Button
            onClick={() => signIn('google', { callbackUrl: '/auth/redirect' })}
            className='w-full bg-white hover:bg-slate-50 text-slate-900 font-semibold py-7 rounded-2xl border-0 shadow-xl shadow-white/5 flex items-center justify-center gap-3 group transition-all hover:scale-[1.02] active:scale-[0.98]'
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
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              />
            </svg>
            <span className='text-lg'>Entrar com Google</span>
          </Button>

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t border-white/10' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-[#0f172a] px-3 py-1 rounded-full text-slate-500 font-medium border border-white/5'>
                Web Skill First ID
              </span>
            </div>
          </div>

          <div className='space-y-4'>
            <Link
              href='/'
              className='flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium'
            >
              <ArrowLeft className='h-4 w-4' />
              Voltar para a página inicial
            </Link>
          </div>

          <p className='text-center text-[10px] text-slate-500 leading-relaxed max-w-[280px] mx-auto'>
            Ao continuar, você concorda com nossos{' '}
            <Link
              href='/termos'
              className='text-blue-400 hover:text-blue-300 underline underline-offset-4'
            >
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link
              href='/privacidade'
              className='text-blue-400 hover:text-blue-300 underline underline-offset-4'
            >
              Política de Privacidade
            </Link>
          </p>
        </CardContent>
      </Card>

      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
