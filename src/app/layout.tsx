import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { AppShell } from '@/components/layout/app-shell';

export const metadata: Metadata = {
  title: 'PayrollPro Cloud | Enterprise Payroll & Workforce Financial Management',
  description: 'Enterprise-grade Payroll Management System featuring automated payroll calculation engine, attendance tracking, role-based approval workflows, and instant payslip generation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // "dark" class is set here as SSR default to prevent flash;
    // ThemeProvider will override on client mount based on localStorage
    <html lang="en" className="dark">
      <body className="min-h-screen flex antialiased selection:bg-indigo-500 selection:text-white" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

