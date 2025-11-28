import { apiRequest } from '@/shared/lib/apiClient';
import type { TaskFlatDto, CreateTaskDto, UpdateTaskDto } from './taskTypes';

/**
 * 프로젝트의 모든 작업 조회
 *
 * GET /api/tasks/projects/{projectId}/tasks
 *
 * @param projectId - 프로젝트 ID
 * @returns TaskFlatDto 배열
 */
export const fetchTasks = async (projectId: string): Promise<TaskFlatDto[]> => {
  return apiRequest<TaskFlatDto[]>(`/api/tasks/projects/${projectId}/tasks`);
};

/**
 * 새 작업 생성
 *
 * POST /api/tasks/projects/{projectId}/tasks
 *
 * @param projectId - 프로젝트 ID
 * @param taskData - 생성할 작업 데이터
 * @returns 생성된 TaskFlatDto
 */
export const createTask = async (
  projectId: string,
  taskData: CreateTaskDto
): Promise<TaskFlatDto> => {
  return apiRequest<TaskFlatDto>(`/api/tasks/projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
};

/**
 * 작업 수정
 *
 * PATCH /api/tasks/{taskId}
 *
 * @param taskId - 작업 ID (숫자)
 * @param updates - 수정할 필드들
 * @returns 수정된 TaskFlatDto
 */
export const updateTask = async (taskId: number, updates: UpdateTaskDto): Promise<TaskFlatDto> => {
  return apiRequest<TaskFlatDto>(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

/**
 * 작업 삭제
 *
 * DELETE /api/tasks/{taskId}
 *
 * @param taskId - 작업 ID (숫자)
 */
export const deleteTask = async (taskId: number): Promise<void> => {
  return apiRequest<void>(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  });
};
