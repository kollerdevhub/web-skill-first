import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
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
} from 'lucide-react';

interface DashboardLayoutProps {
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

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className='min-h-screen bg-slate-50 flex'>
      {/* Sidebar */}
      <aside className='w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm'>
        <div className='p-4 border-b border-slate-200'>
          <Link href='/' className='text-2xl font-bold text-slate-900'>
            Web Skill First
          </Link>
        </div>

        <nav className='flex-1 p-4 space-y-1'>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors'
              >
                <Icon className='h-5 w-5' />
                <span className='font-medium'>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className='p-4 border-t border-slate-200'>
          <div className='flex items-center gap-3 mb-3'>
            <Avatar className='ring-2 ring-slate-100'>
              <AvatarImage
                src={session.user?.image || ''}
                alt={session.user?.name || ''}
              />
              <AvatarFallback className='bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium'>
                {session.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-slate-900 truncate'>
                {session.user?.name}
              </p>
              <p className='text-xs text-slate-500 truncate'>
                {session.user?.email}
              </p>
            </div>
          </div>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <Button
              type='submit'
              variant='outline'
              className='w-full border-slate-200 text-slate-600 hover:bg-slate-100'
            >
              <LogOut className='h-4 w-4 mr-2' />
              Sair
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className='flex-1 overflow-auto'>
        <div className='p-8'>{children}</div>
      </main>
    </div>
  );
}
