import type { Metadata } from 'next';
import type React from 'react';
import { ThemeProvider } from 'next-themes';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from '@/shared/ui/sonner';
import { ReactQueryProvider } from '@/shared/providers/ReactQueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'FlowPlan - AI 프로젝트 관리',
  description: 'AI 기반 프로젝트 관리 도구',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            {children}
            <Toaster />
          </ReactQueryProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
