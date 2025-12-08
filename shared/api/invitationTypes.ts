/**
 * 팀원 초대 관련 타입 정의
 */

/**
 * 팀원 초대 요청 DTO
 * POST /api/projects/{projectId}/invite
 */
export interface InviteTeamMemberDto {
  email: string;
}

/**
 * API 에러 응답 타입
 * 서버에서 에러 발생 시 반환하는 응답 형식
 */
export interface ApiErrorResponse {
  status: number;
  error: string;
  code: string;
  message: string;
  timestamp: string;
}
