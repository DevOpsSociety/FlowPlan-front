import type { Metadata } from 'next';
import type React from 'react';
import { ThemeProvider } from 'next-themes';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from '@/shared/ui/sonner';
import { ReactQueryProvider } from '@/shared/providers/ReactQueryProvider';
import './globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata: Metadata = {
  title: 'FlowPlan - AI 프로젝트 관리',
  description: 'AI 기반 프로젝트 관리 도구',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.error('Google Client ID가 설정되지 않았습니다.');
    return (
      <html lang="ko">
        <body>
          <h1>설정 오류</h1>
          <p>
            Google Client ID가 .env.local에 설정되지 않았습니다. 파일을 확인하고 Next.js 서버를
            재시작해주세요.
          </p>
        </body>
      </html>
    );
  }

  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <GoogleOAuthProvider clientId={googleClientId}>
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
        </GoogleOAuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
