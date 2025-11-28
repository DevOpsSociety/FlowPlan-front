import { ProjectClient } from '@/shared/components/project/ProjectClient';

/**
 * 프로젝트 상세 페이지 레이아웃
 *
 * 간단한 레이아웃 컴포넌트로 ProjectClient를 래핑합니다.
 * 모든 데이터는 클라이언트 컴포넌트에서 fetch합니다.
 */
interface ProjectLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
  return <ProjectClient projectId={params.id}>{children}</ProjectClient>;
}
