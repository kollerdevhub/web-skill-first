import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminClientLayout from './client-layout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  if (!session || session.user?.role !== 'admin') {
    redirect('/dashboard');
  }

  return <AdminClientLayout session={session}>{children}</AdminClientLayout>;
}
