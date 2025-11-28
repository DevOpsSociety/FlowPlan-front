/**
 * API 클라이언트 (클라이언트 컴포넌트 전용)
 * 백엔드 API와 통신하기 위한 공통 함수
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * API 요청 헬퍼 함수 (클라이언트 전용)
 *
 * @param endpoint - API 엔드포인트 경로 (예: '/api/tasks/projects/1/tasks')
 * @param options - fetch 옵션
 * @returns API 응답 데이터
 */
export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  // 204 No Content 처리
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
