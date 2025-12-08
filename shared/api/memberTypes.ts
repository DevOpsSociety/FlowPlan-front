/**
 * 프로젝트 멤버 관련 타입 정의
 */

/**
 * 프로젝트 멤버 역할
 * - OWNER: 관리자 (프로젝트 소유자)
 * - MEMBER: 멤버 (일반 팀원)
 * - VIEWER: 뷰어 (읽기 전용)
 * - PENDING: 승인 대기 (초대되었지만 아직 승인되지 않음)
 */
export type ProjectMemberRole = 'OWNER' | 'MEMBER' | 'VIEWER' | 'PENDING';

/**
 * 프로젝트 멤버 DTO
 * GET /api/projects/{projectId}/members 응답 타입
 */
export interface ProjectMemberDto {
  memberId: number;
  userId: number;
  userName: string;
  userEmail: string;
  role: ProjectMemberRole;
}
