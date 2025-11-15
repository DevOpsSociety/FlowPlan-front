'use client';

import { useRouter } from 'next/navigation';
import { useProjectQuery, QUERY_KEYS } from '@/shared/hooks/queries/useProjectQuery';
import { useQuery } from '@tanstack/react-query';
import { getProjectTasks } from '@/shared/lib/queries/projectService';
import type { Task } from '@/shared/lib/apiTypes';
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
 * - 서버에서 prefetch된 프로젝트 데이터 소비 (초기 렌더링)
 * - queryFn으로 재검증 지원 (window focus, staleTime 만료 시)
 * - 공통 헤더 및 네비게이션 제공
 * - 사용자 인터랙션 처리 (라우팅 등)
 */
export function ProjectClient({ projectId, children }: ProjectClientProps) {
  const router = useRouter();

  // ✅ useProjectQuery 훅 사용 (queryFn 포함)
  // layout.tsx에서 이미 prefetch 완료되어 hydration 보장됨
  const { data: project } = useProjectQuery(projectId);

  // ✅ tasks도 queryFn 제공 (재검증 시 필요)
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: QUERY_KEYS.tasks(projectId),
    queryFn: async () => getProjectTasks(projectId),
  });

  // 타입 안전성 체크만 유지 (prefetch 실패 시 방어)
  if (!project) {
    return null;
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
