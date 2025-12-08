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
    ...options?.headers,
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const url = `${API_BASE_URL}${endpoint}`;

  console.log('🌐 [API Client] 요청 시작:', {
    url,
    method: options?.method || 'GET',
    headers,
    body: options?.body,
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('📡 [API Client] 응답 받음:', {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API Client] 에러 응답:', {
        url,
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // 204 No Content 처리
    if (response.status === 204) {
      console.log('✅ [API Client] 204 No Content');
      return undefined as T;
    }

    // Content-Length가 0이거나 body가 비어있으면 undefined 반환
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') {
      console.log('✅ [API Client] 200 OK with empty body (content-length: 0)');
      return undefined as T;
    }

    // response body를 먼저 text로 읽어서 비어있는지 확인
    const text = await response.text();
    if (!text || text.trim() === '') {
      console.log('✅ [API Client] 200 OK with empty body');
      return undefined as T;
    }

    // text를 JSON으로 파싱
    const data = JSON.parse(text);
    console.log('✅ [API Client] 성공:', { url, data });
    return data;
  } catch (error) {
    console.error('💥 [API Client] 예외 발생:', { url, error });
    throw error;
  }
}
