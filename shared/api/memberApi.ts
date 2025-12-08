import { apiRequest } from '@/shared/lib/apiClient';
import type { ProjectMemberDto, ProjectMemberRole } from './memberTypes';

/**
 * 프로젝트 팀원 목록 조회
 *
 * GET /api/projects/{projectId}/members
 *
 * @param projectId - 프로젝트 ID
 * @returns 프로젝트 멤버 배열
 */
export const fetchProjectMembers = async (projectId: string): Promise<ProjectMemberDto[]> => {
  return apiRequest<ProjectMemberDto[]>(`/api/projects/${projectId}/members`);
};

/**
 * 팀원 역할 변경
 *
 * PATCH /api/projects/{projectId}/members/{memberId}
 *
 * @param projectId - 프로젝트 ID
 * @param memberId - 멤버 ID
 * @param role - 변경할 역할 (OWNER, MEMBER, VIEWER)
 */
export const updateMemberRole = async (
  projectId: string,
  memberId: number,
  role: ProjectMemberRole
): Promise<void> => {
  const body = { role };
  console.log('🔧 [updateMemberRole] Request:', { projectId, memberId, role, body });

  await apiRequest<void>(`/api/projects/${projectId}/members/${memberId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
};
