import type { TaskFlatDto } from '@/shared/api/taskTypes';

/**
 * 하위 태스크들의 진행률을 기반으로 상위 태스크의 진행률을 계산합니다.
 *
 * @param subtasks - 하위 태스크 목록
 * @returns 계산된 진행률 (0-100)
 *
 * @example
 * // 하위 태스크 3개 중 1개만 완료(100)인 경우
 * const subtasks = [
 *   { progress: 100 },
 *   { progress: 0 },
 *   { progress: 0 }
 * ];
 * calculateParentProgress(subtasks); // 33
 *
 * @example
 * // 모든 하위 태스크가 완료인 경우
 * const subtasks = [
 *   { progress: 100 },
 *   { progress: 100 },
 *   { progress: 100 }
 * ];
 * calculateParentProgress(subtasks); // 100
 */
export const calculateParentProgress = (subtasks: { progress: number }[]): number => {
  if (subtasks.length === 0) return 0;

  // 모든 하위 태스크의 진행률을 평균내서 계산
  const totalProgress = subtasks.reduce((sum, task) => sum + task.progress, 0);
  const averageProgress = totalProgress / subtasks.length;

  return Math.round(averageProgress);
};

/**
 * 전체 태스크 목록에서 특정 부모 ID를 가진 하위 태스크들을 필터링합니다.
 *
 * @param tasks - 전체 태스크 목록
 * @param parentId - 부모 태스크 ID
 * @returns 해당 부모를 가진 하위 태스크 목록
 */
export const getSubtasksByParentId = (tasks: TaskFlatDto[], parentId: number): TaskFlatDto[] => {
  return tasks.filter((task) => task.parent === parentId);
};

/**
 * 태스크가 업데이트될 때 상위 태스크의 진행률도 함께 업데이트해야 하는지 확인하고,
 * 필요한 경우 상위 태스크의 새로운 진행률을 계산합니다.
 *
 * @param updatedTask - 업데이트된 태스크 정보
 * @param allTasks - 전체 태스크 목록
 * @returns 상위 태스크 업데이트가 필요한 경우 { parentId, newProgress }, 필요없으면 null
 */
export const getParentProgressUpdate = (
  updatedTask: TaskFlatDto,
  allTasks: TaskFlatDto[]
): { parentId: number; newProgress: number } | null => {
  // parent가 없으면 null 반환
  if (!updatedTask.parent) return null;

  // 같은 부모를 가진 모든 하위 태스크 찾기
  const siblings = getSubtasksByParentId(allTasks, updatedTask.parent);

  // 하위 태스크가 없으면 null 반환 (이론상 발생하지 않아야 함)
  if (siblings.length === 0) return null;

  // 업데이트된 태스크를 포함하여 진행률 계산
  const updatedSiblings = siblings.map((sibling) =>
    sibling.id === updatedTask.id ? updatedTask : sibling
  );

  const newProgress = calculateParentProgress(updatedSiblings);

  return {
    parentId: updatedTask.parent,
    newProgress,
  };
};
