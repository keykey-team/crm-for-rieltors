import { Sidebar } from '@/components/sidebar';
import { SidebarWrapper } from './_components/sidebar-wrapper';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <SidebarWrapper>{children}</SidebarWrapper>
    </div>
  );
}
