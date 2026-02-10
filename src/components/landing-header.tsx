'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { UserMenu } from '@/components/user-menu';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Skeleton } from '@/components/ui/skeleton';

export function LandingHeader() {
  const { user, loading } = useFirebaseAuth();

  return (
    <header className='border-b border-slate-200/80 bg-white sticky top-0 z-50 shadow-sm shadow-slate-900/5'>
      <div className='container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4'>
        <Link href='/' className='text-2xl font-bold flex items-center gap-2'>
          <div className='p-2 rounded-lg bg-blue-600 shadow-sm'>
            <Sparkles className='h-5 w-5 text-white' />
          </div>
          <span className='text-slate-900'>Web Skill First</span>
        </Link>
        <nav className='flex items-center gap-4 w-full sm:w-auto justify-center'>
          {loading ? (
            <div className='flex items-center gap-4'>
              <Skeleton className='h-10 w-24' />
              <Skeleton className='h-10 w-10 rounded-full' />
            </div>
          ) : user ? (
            <div className='flex items-center gap-4'>
              <Link href='/dashboard' className='hidden sm:block'>
                <Button
                  variant='ghost'
                  className='text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                >
                  Dashboard
                </Button>
              </Link>
              <UserMenu />
            </div>
          ) : (
            <Link href='/login'>
              <Button className='bg-blue-600 hover:bg-blue-700 text-white shadow-sm'>
                Entrar
                <ArrowRight className='h-4 w-4 ml-2' />
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
