'use client';

import { ThemeProvider } from '@/shared/providers/ThemeProvider';
import { Toaster } from '@/shared/ui/sonner';
import { Analytics } from '@vercel/analytics/next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type React from 'react';
import { useState } from 'react';

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1분
            retry: 1, // 1번만 재시도
          },
        },
      })
  );

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      </QueryClientProvider>
      <Analytics />
    </>
  );
}
