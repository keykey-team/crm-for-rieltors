import { Sidebar } from './sidebar';
import { SidebarWrapper } from './sidebar-wrapper';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <SidebarWrapper>{children}</SidebarWrapper>
    </div>
  );
}
