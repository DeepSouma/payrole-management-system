'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { SandboxBanner } from '@/components/layout/sandbox-banner';
import { SandboxTourModal } from '@/components/ui/sandbox-tour-modal';
import { SandboxExplorerModal } from '@/components/ui/sandbox-explorer-modal';
import { SandboxFloatingFab } from '@/components/ui/sandbox-floating-fab';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <div className="w-full min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>{children}</div>;
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <SandboxBanner />
      <div className="flex w-full flex-1 min-h-0">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main
            className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-base)' }}
          >
            {children}
          </main>
        </div>
      </div>
      <SandboxTourModal />
      <SandboxExplorerModal />
      <SandboxFloatingFab />
    </div>
  );
}
