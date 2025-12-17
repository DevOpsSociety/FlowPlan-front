// ===== Task API 타입 (api.json 스펙 매핑) =====

/**
 * TaskFlatResponseDto (api.json)
 * GET /api/tasks/projects/{projectId}/tasks 응답
 * 백엔드에서 반환하는 평탄화(Flat)된 작업 구조
 */
export interface TaskFlatDto {
  id: number; // int64
  parent: number | null; // int64, nullable
  name: string;
  start: string; // date format (YYYY-MM-DD)
  end: string; // date format (YYYY-MM-DD)
  duration: number; // int32 (일 단위)
  progress: number; // int32 (0-100)
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assigneeName: string; // 담당자 이름
  assigneeEmail: string; // 담당자 이메일
}

/**
 * ProjectWithTasksResponseDto (api.json)
 * GET /api/tasks/projects/{projectId}/tasks 응답
 * 프로젝트 정보와 작업 목록을 함께 반환
 */
export interface ProjectWithTasksResponseDto {
  projectId: number; // int64
  projectName: string;
  projectTopic: string;
  memberCount: number; // int32
  expectedDurationMonths: number; // int32
  tasks: TaskFlatDto[]; // TaskFlatResponseDto 배열
}

/**
 * CreateTaskRequestDto (api.json)
 * 작업 생성 요청
 */
export interface CreateTaskDto {
  name: string;
  parentId?: number;
  assigneeId?: number;
  assigneeEmail?: string;
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
  assigneeEmail?: string; // 담당자 이메일 (백엔드 스웨거 스펙)
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  status?: string;
  progress?: number; // 0-100
}
