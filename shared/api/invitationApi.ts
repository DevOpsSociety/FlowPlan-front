import { apiRequest } from '@/shared/lib/apiClient';
import type { ApiErrorResponse, InviteTeamMemberDto } from './invitationTypes';
import { headers } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * 팀원 초대
 *
 * POST /api/projects/{projectId}/invite
 *
 * @param projectId - 프로젝트 ID
 * @param data - 초대할 이메일 정보
 * @throws Error - 초대 실패 시 서버 메시지 포함
 */
export const inviteTeamMember = async (
  projectId: string,
  data: InviteTeamMemberDto
): Promise<void> => {
  const url = `${API_BASE_URL}/api/projects/${projectId}/invite`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // 에러 응답 파싱 시도
    let errorMessage = `초대에 실패했습니다 (${response.status})`;

    try {
      const errorData: ApiErrorResponse = await response.json();
      // 서버에서 보낸 메시지가 있으면 사용
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // JSON 파싱 실패 시 기본 에러 메시지 사용
    }

    throw new Error(errorMessage);
  }

  // 성공 시 200 OK, body 없음
};

/**
 * 초대 수락
 *
 * POST /api/projects/invite/accept?token={token}
 *
 * @param token - 초대 토큰
 */
export const acceptInvitation = async (token: string): Promise<void> => {
  console.log('✉️ [acceptInvitation] Request:', { token });

  await apiRequest<void>(`/api/projects/invite/accept?token=${token}`, {
    method: 'POST',
  });
};
