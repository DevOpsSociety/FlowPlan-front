import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import getQueryClient from '@/shared/lib/queries/getQueryClient';
import { getProjectById, getProjectTasks } from '@/shared/lib/queries/projectService';
import { ProjectLayoutClient } from '@/shared/components/project/components/ProjectLayoutClient';

/**
 * 프로젝트 상세 페이지 레이아웃
 *
 * 서버 컴포넌트로 프로젝트 데이터와 태스크를 prefetch한 후
 * HydrationBoundary를 통해 클라이언트로 전달합니다.
 *
 * 이 패턴의 장점:
 * 1. 초기 로딩이 빠름 (서버에서 데이터 미리 로드)
 * 2. SEO 최적화 (서버 렌더링된 HTML에 데이터 포함)
 * 3. 클라이언트에서 즉시 사용 가능 (로딩 스피너 없음)
 */
interface ProjectLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const queryClient = getQueryClient(); // cache()로 싱글톤 생성

  // 서버에서 프로젝트 데이터와 태스크를 미리 로드
  // Note: 서버 컴포넌트에서는 queryKey를 직접 정의 (QUERY_KEYS는 클라이언트 전용)
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['project', params.id],
      queryFn: () => getProjectById(params.id),
    }),
    queryClient.prefetchQuery({
      queryKey: ['tasks', params.id],
      queryFn: () => getProjectTasks(params.id),
    }),
  ]);

  // dehydrate: QueryClient 상태를 직렬화하여 클라이언트로 전달
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectLayoutClient projectId={params.id}>{children}</ProjectLayoutClient>
    </HydrationBoundary>
  );
}
