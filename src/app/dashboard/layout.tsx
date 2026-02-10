import DashboardClientLayout from './client-layout';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
