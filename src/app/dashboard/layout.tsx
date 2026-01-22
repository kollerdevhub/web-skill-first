import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import DashboardClientLayout from './client-layout';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardClientLayout session={session}>{children}</DashboardClientLayout>
  );
}
