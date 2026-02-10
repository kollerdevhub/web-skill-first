import AdminClientLayout from './client-layout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
