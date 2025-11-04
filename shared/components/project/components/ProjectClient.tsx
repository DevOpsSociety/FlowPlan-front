'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { QUERY_KEYS } from '@/shared/hooks/queries/useProjectQuery';
import { ProjectHeader } from './ProjectHeader';
import { ViewNavigator } from './ViewNavigator';

interface ProjectClientProps {
  projectId: string;
  children: React.ReactNode;
}

/**
 * 프로젝트 클라이언트 컴포넌트
 *
 * HydrationBoundary로 주입된 데이터를 사용하여
 * 공통 헤더와 뷰 네비게이션을 렌더링합니다.
 *
 * 역할:
 * - 서버에서 prefetch된 프로젝트 데이터 소비
 * - 공통 헤더 및 네비게이션 제공
 * - 사용자 인터랙션 처리 (라우팅 등)
 */
export function ProjectClient({ projectId, children }: ProjectClientProps) {
  const router = useRouter();

  // HydrationBoundary로 주입된 데이터 사용 (즉시 사용 가능, queryFn 불필요)
  const { data: project, isLoading } = useQuery({
    queryKey: QUERY_KEYS.project(projectId),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: QUERY_KEYS.tasks(projectId),
  });

  if (isLoading || !project) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">프로젝트 로딩 중...</p>
        </div>
      </div>
    );
  }

  const handleShowTeam = () => {
    router.push(`/team/${projectId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* 공통 헤더 */}
      <ProjectHeader project={project} wbsTasks={tasks} onShowTeam={handleShowTeam} />

      {/* 뷰 네비게이션 (URL 기반) */}
      <div className="hidden md:flex justify-end">
        <ViewNavigator projectId={projectId} />
      </div>

      {/* 각 뷰 페이지가 렌더링되는 영역 */}
      <div className="min-h-[600px] rounded-lg border p-6">{children}</div>
    </div>
  );
}
