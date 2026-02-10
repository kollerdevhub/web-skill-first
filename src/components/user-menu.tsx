'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LogOut,
  LayoutDashboard,
  Settings,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { signOutUser } from '@/lib/firebase-auth';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isAdmin } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOutUser();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className='relative' ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 p-1 rounded-full hover:bg-slate-50 transition-colors group'
      >
        <Avatar className='h-8 w-8 ring-2 ring-transparent group-hover:ring-blue-100 transition-all'>
          <AvatarImage src={user.photoURL || undefined} />
          <AvatarFallback className='bg-blue-600 text-white text-xs'>
            {user.displayName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-[60] animate-in fade-in zoom-in duration-200'>
          <div className='px-4 py-2 border-b border-slate-100 mb-1'>
            <p className='text-sm font-semibold text-slate-900 truncate'>
              {user.displayName}
            </p>
            <p className='text-xs text-slate-500 truncate'>{user.email}</p>
            {isAdmin && (
              <span className='inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-50 text-[10px] font-semibold text-blue-700 uppercase border border-blue-100'>
                Administrador
              </span>
            )}
          </div>

          <div className='px-2 space-y-0.5'>
            <Link
              href={isAdmin ? '/admin' : '/dashboard'}
              onClick={() => setIsOpen(false)}
              className='flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors'
            >
              <LayoutDashboard className='h-4 w-4' />
              {isAdmin ? 'Painel Admin' : 'Meu Dashboard'}
            </Link>

            <Link
              href='/dashboard/perfil'
              onClick={() => setIsOpen(false)}
              className='flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors'
            >
              <UserIcon className='h-4 w-4' />
              Perfil
            </Link>

            <Link
              href={isAdmin ? '/admin/config' : '/dashboard/configuracoes'}
              onClick={() => setIsOpen(false)}
              className='flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors'
            >
              <Settings className='h-4 w-4' />
              Configurações
            </Link>
          </div>

          <div className='mt-2 pt-2 border-t border-slate-100 px-2'>
            <button
              onClick={handleLogout}
              className='flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors'
            >
              <LogOut className='h-4 w-4' />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
