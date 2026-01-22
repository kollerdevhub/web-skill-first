import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function AuthRedirectPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Redirecionar baseado na role
  if (session.user?.role === 'admin') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}
