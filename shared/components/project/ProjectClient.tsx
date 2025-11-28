'use client';

import { useRouter } from 'next/navigation';
import { useProjectQuery } from '@/shared/hooks/queries/useProjectQuery';
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
 * Tasks는 각 뷰에서 개별적으로 조회합니다.
 */
export function ProjectClient({ projectId, children }: ProjectClientProps) {
  const router = useRouter();
  const { data: project } = useProjectQuery(projectId);

  if (!project) {
    return null;
  }

  const handleShowTeam = () => {
    router.push(`/team/${projectId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* 공통 헤더 */}
      <ProjectHeader project={project} wbsTasks={[]} onShowTeam={handleShowTeam} />

      {/* 뷰 네비게이션 (URL 기반) */}
      <div className="hidden md:flex justify-end">
        <ViewNavigator projectId={projectId} />
      </div>

      {/* 각 뷰 페이지가 렌더링되는 영역 */}
      <div className="min-h-[600px] rounded-lg border p-6">{children}</div>
    </div>
  );
}
