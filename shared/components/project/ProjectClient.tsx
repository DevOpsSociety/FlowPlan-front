'use client';

import { useProjectWithTasks } from '@/shared/hooks/queries/useTaskQuery';
import { useRouter } from 'next/navigation';
import { ProjectHeader } from './ProjectHeader';
import { ViewNavigator } from './ViewNavigator';

interface ProjectClientProps {
  projectId: string;
  children: React.ReactNode;
}

/**
 * 프로젝트 클라이언트 컴포넌트
 *
 * 공통 헤더와 뷰 네비게이션을 렌더링합니다.
 * ProjectWithTasksResponseDto를 사용하여 프로젝트 정보를 조회합니다.
 */
export function ProjectClient({ projectId, children }: ProjectClientProps) {
  const router = useRouter();
  const { data, isLoading, error } = useProjectWithTasks(projectId);

  console.log('🏗️ [ProjectClient] 렌더링:', {
    projectId,
    project: data?.project,
    taskCount: data?.tasks.length,
    isLoading,
    error,
  });

  const handleShowTeam = () => {
    router.push(`/project/${projectId}/team`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* 공통 헤더 - 프로젝트 데이터가 있을 때만 표시 */}
      {data?.project && (
        <>
          <ProjectHeader project={data.project} wbsTasks={[]} onShowTeam={handleShowTeam} />
          {/* 뷰 네비게이션 (URL 기반) */}
          <div className="hidden md:flex justify-end">
            <ViewNavigator projectId={projectId} />
          </div>
        </>
      )}

      {/* 로딩 중 */}
      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">프로젝트 정보를 불러오는 중...</div>
      )}

      {/* 에러 발생 */}
      {error && (
        <div className="text-center py-8 space-y-2">
          <div className="text-destructive">프로젝트를 불러오는 중 오류가 발생했습니다</div>
          <div className="text-sm text-muted-foreground">{error.message}</div>
        </div>
      )}

      {/* 각 뷰 페이지가 렌더링되는 영역 - 항상 렌더링 */}
      <div className="min-h-[600px] rounded-lg border p-6">{children}</div>
    </div>
  );
}
