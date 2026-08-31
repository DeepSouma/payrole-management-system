'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/auth-context';
import { SandboxGuideProvider } from '@/lib/sandbox-guide-context';
import { ThemeProvider } from '@/lib/theme-context';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SandboxGuideProvider>{children}</SandboxGuideProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
