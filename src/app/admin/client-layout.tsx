'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  Settings,
  ArrowLeft,
  Home,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { signOutUser } from '@/lib/firebase-auth';

interface AdminClientLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Usuários', href: '/admin/usuarios', icon: Users },
  { label: 'Cursos', href: '/admin/cursos', icon: GraduationCap },
  { label: 'Vagas', href: '/admin/vagas', icon: Briefcase },
  { label: 'Configurações', href: '/admin/config', icon: Settings },
];

export default function AdminClientLayout({
  children,
}: AdminClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useFirebaseAuth();
  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = async () => {
    await signOutUser();
    router.push('/');
  };

  return (
    <div className='min-h-screen bg-[#fafbfc] flex flex-col md:flex-row'>
      {/* Mobile Top Header */}
      <header className='md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-50'>
        <Link
          href='/admin'
          className='text-xl font-bold text-slate-900 flex items-center gap-2'
        >
          <div className='p-1.5 rounded-lg bg-blue-600 shadow-sm'>
            <Sparkles className='h-4 w-4 text-white' />
          </div>
          <span>Admin Panel</span>
        </Link>
        <Button variant='ghost' size='icon' onClick={toggleSidebar}>
          {isSidebarOpen ? (
            <X className='h-6 w-6' />
          ) : (
            <Menu className='h-6 w-6' />
          )}
        </Button>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className='fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm'
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='p-5 border-b border-slate-200 hidden md:block'>
          <Link
            href='/admin'
            className='text-xl font-bold flex items-center gap-2 text-slate-900'
          >
            <div className='p-2 rounded-lg bg-blue-600 shadow-sm'>
              <Sparkles className='h-5 w-5 text-white' />
            </div>
            <span>Web Skill First</span>
          </Link>
        </div>

        <nav className='flex-1 p-3 space-y-1 overflow-y-auto'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-600' : ''}`}
                />
                <span className='font-medium'>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick links */}
        <div className='p-4 border-t border-slate-200 space-y-2'>
          <Link
            href='/dashboard'
            className='flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors'
          >
            <ArrowLeft className='h-4 w-4' />
            Voltar ao Dashboard
          </Link>
          <Link
            href='/'
            className='flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors'
          >
            <Home className='h-4 w-4' />
            Ir para Home
          </Link>
        </div>

        {/* User section */}
        <div className='p-4 border-t border-slate-200 bg-slate-50/50 mt-auto'>
          <div className='bg-white p-3 rounded-xl border border-slate-200 shadow-sm'>
            <div className='flex items-center gap-3 mb-3'>
              <Avatar className='h-10 w-10 ring-2 ring-blue-50'>
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className='bg-blue-600 text-white font-medium'>
                  {user?.displayName?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-slate-900 truncate'>
                  {user?.displayName}
                </p>
                <p className='text-[10px] text-blue-600 font-semibold uppercase tracking-wider'>
                  Administrador
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant='ghost'
              size='sm'
              className='w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg h-9 transition-all'
            >
              <LogOut className='h-4 w-4 mr-2' />
              <span className='font-medium'>Finalizar Sessão</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className='flex-1 overflow-auto w-full bg-[#fafbfc]'>
        <div className='p-4 md:p-8 max-w-7xl mx-auto'>{children}</div>
      </main>
    </div>
  );
}
