import { apiRequest } from '@/shared/lib/apiClient';
import type { ProjectMemberDto } from './memberTypes';

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
