'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface MobileLayoutProps {
  session: any;
  children: React.ReactNode;
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Meus Cursos', href: '/dashboard/cursos', icon: GraduationCap },
  { label: 'Vagas', href: '/dashboard/vagas', icon: Briefcase },
  { label: 'Candidaturas', href: '/dashboard/candidaturas', icon: FileText },
  { label: 'Certificados', href: '/dashboard/certificados', icon: Award },
  { label: 'Perfil', href: '/dashboard/perfil', icon: User },
];

export default function DashboardClientLayout({
  session,
  children,
}: MobileLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className='min-h-screen bg-slate-50 flex flex-col md:flex-row'>
      {/* Mobile Top Header */}
      <header className='md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-50'>
        <Link
          href='/'
          className='text-xl font-bold text-slate-900 flex items-center gap-2'
        >
          <div className='p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
            <Sparkles className='h-4 w-4 text-white' />
          </div>
          <span>Web Skill First</span>
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
        <div className='p-4 border-b border-slate-200 hidden md:block'>
          <Link
            href='/'
            className='text-2xl font-bold text-slate-900 flex items-center gap-2'
          >
            <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'>
              <Sparkles className='h-5 w-5 text-white' />
            </div>
            <span>Web Skill First</span>
          </Link>
        </div>

        <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? 'text-blue-500' : ''}`}
                />
                <span className='font-medium'>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className='p-4 border-t border-slate-200 bg-slate-50/50 mt-auto'>
          <div className='bg-white p-3 rounded-2xl border border-slate-200 shadow-sm'>
            <div className='flex items-center gap-3 mb-3'>
              <Avatar className='h-10 w-10 ring-2 ring-blue-50'>
                <AvatarImage src={session.user?.image || ''} />
                <AvatarFallback className='bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium'>
                  {session.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-slate-900 truncate'>
                  {session.user?.name}
                </p>
                <p className='text-xs text-slate-500 truncate'>
                  {session.user?.email}
                </p>
              </div>
            </div>
            <Button
              onClick={() => signOut({ callbackUrl: '/' })}
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
      <main className='flex-1 overflow-auto w-full'>
        <div className='p-4 md:p-8 max-w-7xl mx-auto'>{children}</div>
      </main>
    </div>
  );
}
