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

/**
 * 팀원 제거
 *
 * DELETE /api/projects/{projectId}/members/{memberId}
 *
 * @param projectId - 프로젝트 ID
 * @param memberId - 멤버 ID
 */
export const removeMember = async (projectId: string, memberId: number): Promise<void> => {
  console.log('🗑️ [removeMember] Request:', { projectId, memberId });

  await apiRequest<void>(`/api/projects/${projectId}/members/${memberId}`, {
    method: 'DELETE',
  });
};

/**
 * 프로젝트 나가기 (본인)
 *
 * DELETE /api/projects/{projectId}/members/me
 *
 * @param projectId - 프로젝트 ID
 */
export const leaveProject = async (projectId: string): Promise<void> => {
  console.log('🚪 [leaveProject] Request:', { projectId });

  await apiRequest<void>(`/api/projects/${projectId}/members/me`, {
    method: 'DELETE',
  });
};
