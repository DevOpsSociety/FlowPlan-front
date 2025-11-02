import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

/**
 * 서버 컴포넌트에서 사용할 QueryClient 싱글톤 생성 함수
 *
 * React의 cache()를 사용하여 하나의 요청(렌더링) 동안
 * 여러 서버 컴포넌트가 같은 QueryClient 인스턴스를 공유합니다.
 *
 * @example
 * // layout.tsx (서버 컴포넌트)
 * const queryClient = getQueryClient()
 * await queryClient.prefetchQuery(...)
 */
const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          // 데이터가 5분간 신선한 상태로 유지
          staleTime: 1000 * 60 * 5,
          // 실패 시 1번만 재시도
          retry: 1,
        },
      },
    })
);

export default getQueryClient;
