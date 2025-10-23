'use client';

import { ThemeProvider } from '@/shared/providers/ThemeProvider';
import { Toaster } from '@/shared/ui/sonner';
import { Analytics } from '@vercel/analytics/next';
import type React from 'react';

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        {children}
        <Toaster />
      </ThemeProvider>
      <Analytics />
    </>
  );
}
