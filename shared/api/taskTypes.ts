// ===== 간트차트 API 타입 (api.json 스펙 매핑) =====

/**
 * TaskFlatResponseDto (api.json)
 * 백엔드에서 반환하는 평탄화된 작업 구조
 */
export interface TaskFlatDto {
  id: number;
  parent: number | null;
  name: string;
  start: string; // date (YYYY-MM-DD)
  end: string; // date (YYYY-MM-DD)
  duration: number;
  progress: number; // 0-100
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignee: string;
}

/**
 * CreateTaskRequestDto (api.json)
 * 작업 생성 요청
 */
export interface CreateTaskDto {
  name: string;
  parentId?: number;
  assigneeId?: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: string;
  progress: number; // 0-100
}

/**
 * UpdateTaskRequestDto (api.json)
 * 작업 수정 요청
 */
export interface UpdateTaskDto {
  name?: string;
  assigneeId?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  status?: string;
  progress?: number; // 0-100
}
