/**
 * Kanban 보드 데이터 변환 유틸리티
 * - API 상태 ↔ 칸반 컬럼 ID 변환
 * - 작업 그룹화 및 필터링
 */

import type { TaskFlatDto } from '@/shared/api/taskTypes';
import type { KanbanColumnId } from '../config/kanbanConfig';

// ===== 상태 변환 함수 =====

/**
 * API status를 칸반 컬럼 ID로 변환
 * @param status - API 상태 (TODO, IN_PROGRESS, DONE)
 * @returns 칸반 컬럼 ID
 */
export const apiStatusToKanban = (status: string): KanbanColumnId => {
  const mapping: Record<string, KanbanColumnId> = {
    TODO: 'todo',
    IN_PROGRESS: 'in-progress',
    DONE: 'done',
  };
  return mapping[status] || 'todo';
};

/**
 * 칸반 컬럼 ID를 API status로 변환
 * @param kanban - 칸반 컬럼 ID
 * @returns API 상태 문자열
 */
export const kanbanToApiStatus = (kanban: KanbanColumnId): string => {
  const mapping: Record<KanbanColumnId, string> = {
    todo: 'TODO',
    'in-progress': 'IN_PROGRESS',
    done: 'DONE',
  };
  return mapping[kanban];
};

// ===== 작업 그룹화 함수 =====

/**
 * TaskFlatDto 배열을 칸반 컬럼별로 그룹화 (최상위 작업만)
 * @param tasks - TaskFlatDto 배열
 * @returns 컬럼별로 그룹화된 작업 객체
 */
export const groupTasksByStatus = (tasks: TaskFlatDto[]): Record<KanbanColumnId, TaskFlatDto[]> => {
  // parent가 없는 최상위 작업만 사용
  const topLevelTasks = tasks.filter((t) => !t.parent);

  return {
    todo: topLevelTasks.filter((t) => apiStatusToKanban(t.status) === 'todo'),
    'in-progress': topLevelTasks.filter((t) => apiStatusToKanban(t.status) === 'in-progress'),
    done: topLevelTasks.filter((t) => apiStatusToKanban(t.status) === 'done'),
  };
};

/**
 * 특정 작업의 하위 작업 찾기
 * @param tasks - 전체 작업 배열
 * @param parentId - 부모 작업 ID
 * @returns 해당 부모의 하위 작업 배열
 */
export const getSubtasks = (tasks: TaskFlatDto[], parentId: number): TaskFlatDto[] => {
  return tasks.filter((t) => t.parent === parentId);
};
