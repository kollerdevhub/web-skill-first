'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  FileText,
  Award,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { signOut } from 'next-auth/react';

const navItems = [
  { label: 'Início', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Cursos', href: '/dashboard/cursos', icon: GraduationCap },
  { label: 'Explorar', href: '/dashboard/explorar-cursos', icon: Sparkles },
  { label: 'Certificados', href: '/dashboard/certificados', icon: Award },
  {
    label: 'Minhas Candidaturas',
    href: '/dashboard/candidaturas',
    icon: FileText,
  },
  { label: 'Vagas', href: '/dashboard/vagas', icon: Briefcase },
  { label: 'Perfil', href: '/dashboard/perfil', icon: User },
];

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useFirebaseAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const activeSection = useMemo(
    () =>
      navItems.find(
        (item) =>
          pathname === item.href || pathname.startsWith(`${item.href}/`),
      )?.label || 'Painel',
    [pathname],
  );

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?from=dashboard');
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-transparent flex flex-col md:flex-row'>
      <header className='md:hidden bg-white/95 backdrop-blur border-b border-slate-200/80 p-4 flex items-center justify-between sticky top-0 z-50 shadow-sm shadow-slate-900/5'>
        <Link
          href='/'
          className='text-lg font-bold text-slate-900 flex items-center gap-2'
        >
          <div className='p-1.5 rounded-lg bg-blue-600 shadow-sm'>
            <Sparkles className='h-4 w-4 text-white' />
          </div>
          <span>Web Skill First</span>
        </Link>
        <Button
          variant='outline'
          size='icon'
          onClick={toggleSidebar}
          className='border-slate-200'
        >
          {isSidebarOpen ? (
            <X className='h-6 w-6' />
          ) : (
            <Menu className='h-6 w-6' />
          )}
        </Button>
      </header>

      {isSidebarOpen && (
        <div
          className='fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm'
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white/95 backdrop-blur border-r border-slate-200 flex flex-col shadow-xl shadow-slate-900/5 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='p-5 border-b border-slate-200 hidden md:block bg-gradient-to-r from-blue-600 to-blue-500'>
          <Link
            href='/'
            className='text-lg font-bold text-white flex items-center gap-2'
          >
            <div className='p-2 rounded-lg bg-white/20 shadow-sm'>
              <Sparkles className='h-5 w-5 text-white' />
            </div>
            <span>Web Skill First</span>
          </Link>
        </div>

        <nav className='flex-1 p-4 space-y-1.5 overflow-y-auto'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-blue-700' : ''}`}
                />
                <span className='font-medium'>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className='p-4 border-t border-slate-200 bg-slate-50/50 mt-auto'>
          <div className='bg-white p-3 rounded-xl border border-slate-200 shadow-sm'>
            <div className='flex items-center gap-3 mb-3'>
              <Avatar className='h-10 w-10 ring-2 ring-blue-50'>
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className='bg-blue-600 text-white font-medium'>
                  {user?.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-slate-900 truncate'>
                  {user?.displayName}
                </p>
                <p className='text-xs text-slate-500 truncate'>{user?.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant='ghost'
              size='sm'
              className='w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg h-9 transition-all border border-transparent'
            >
              <LogOut className='h-4 w-4 mr-2' />
              <span className='font-medium'>Finalizar Sessão</span>
            </Button>
          </div>
        </div>
      </aside>

      <main className='flex-1 w-full min-w-0 bg-[radial-gradient(1200px_500px_at_50%_-15%,rgba(59,130,246,0.08),transparent)]'>
        <div className='hidden md:flex sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/65'>
          <div className='mx-auto w-full max-w-7xl px-8 py-4 flex items-center justify-between'>
            <div>
              <p className='text-xs uppercase tracking-wider text-slate-500 font-semibold'>
                Área do Candidato
              </p>
              <p className='text-sm font-semibold text-slate-900'>
                {activeSection}
              </p>
            </div>
            <Link href='/dashboard/explorar-cursos'>
              <Button size='sm' variant='outline'>
                <Sparkles className='h-4 w-4 mr-2' />
                Explorar Novos Cursos
              </Button>
            </Link>
          </div>
        </div>
        <div className='mx-auto w-full max-w-7xl px-4 py-5 md:px-8 md:py-8'>
          {children}
        </div>
      </main>
    </div>
  );
}
