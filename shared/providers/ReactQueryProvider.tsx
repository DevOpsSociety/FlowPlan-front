'use client';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

/**
 * API 에러 메시지를 사용자 친화적으로 변환
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // API Error 형식: "API Error: 400 Bad Request - {...}"
    const match = error.message.match(/API Error: (\d+) .* - (.*)/);
    if (match) {
      const statusCode = match[1];
      const errorBody = match[2];

      // JSON 형식의 에러 메시지 파싱 시도
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed.message) return parsed.message;
        if (parsed.error) return parsed.error;
      } catch {
        // JSON 파싱 실패 시 원본 사용
      }

      // 상태 코드별 기본 메시지
      switch (statusCode) {
        case '400':
          return '잘못된 요청입니다.';
        case '401':
          return '인증이 필요합니다. 다시 로그인해주세요.';
        case '403':
          return '접근 권한이 없습니다.';
        case '404':
          return '요청한 리소스를 찾을 수 없습니다.';
        case '500':
          return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        default:
          return `오류가 발생했습니다. (${statusCode})`;
      }
    }

    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
}

export function ReactQueryProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            // 이미 개별적으로 에러 처리하는 경우 스킵 (meta.skipGlobalErrorHandler)
            if (query.meta?.skipGlobalErrorHandler) return;

            console.error('🔴 [Query Error]', error);
            toast.error(getErrorMessage(error), {
              description: '데이터를 불러오는 중 문제가 발생했습니다.',
            });
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            // 이미 개별적으로 에러 처리하는 경우 스킵 (meta.skipGlobalErrorHandler)
            if (mutation.meta?.skipGlobalErrorHandler) return;

            console.error('🔴 [Mutation Error]', error);
            toast.error(getErrorMessage(error), {
              description: '작업 처리 중 문제가 발생했습니다.',
            });
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1분
            retry: 1, // 1번만 재시도
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
