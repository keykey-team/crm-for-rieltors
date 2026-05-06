'use client';

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main className="lg:ml-[260px] transition-all duration-300 min-h-screen">
      <div className="p-4 md:p-6 lg:p-8 pt-20 lg:pt-8 max-w-[1400px]">
        {children}
      </div>
    </main>
  );
}
