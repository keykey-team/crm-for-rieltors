import { Sidebar } from '@/shared/layout/sidebar';
import { SidebarWrapper } from '@/widgets/layout/ui/sidebar-wrapper';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <SidebarWrapper>{children}</SidebarWrapper>
    </div>
  );
}
