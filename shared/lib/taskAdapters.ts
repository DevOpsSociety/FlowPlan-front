import type { Task as GanttTask } from 'gantt-task-react';
import type { Task, TaskStatus } from '@/shared/lib/apiTypes';

/**
 * gantt-task-react의 Task 형식에서 우리의 Task 타입으로 변환
 * 간트차트에서 드래그로 날짜/진행률 변경 시 사용
 */
export const fromGanttTask = (ganttTask: GanttTask): Partial<Task> => {
  // 날짜를 YYYY-MM-DD 형식으로 변환
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // 기간 계산 (일 단위)
  const calculateDuration = (start: Date, end: Date): number => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return {
    start_date: formatDate(ganttTask.start),
    end_date: formatDate(ganttTask.end),
    duration_days: calculateDuration(ganttTask.start, ganttTask.end),
    progress: ganttTask.progress,
    name: ganttTask.name,
  };
};

/**
 * 우리의 Task 타입을 gantt-task-react의 Task 형식으로 변환
 * 간트차트 렌더링 시 사용
 * @param task - 변환할 Task 객체
 * @param parentId - 부모 작업 ID (계층 구조 평탄화 시 사용)
 */
export const toGanttTask = (task: Task, parentId?: string): GanttTask => {
  // subtasks가 있으면 'project', 없으면 'task'
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  return {
    id: task.task_id,
    name: task.name,
    start: new Date(task.start_date),
    end: new Date(task.end_date),
    progress: task.progress,
    type: hasSubtasks ? 'project' : 'task',
    dependencies: [], // 필요시 추가 구현
    project: parentId,
    hideChildren: false,
  };
};

/**
 * 칸반 상태를 Task의 status로 변환
 * 칸반보드에서 드래그앤드롭 시 사용
 */
export const kanbanStatusToTaskStatus = (
  kanbanStatus: 'todo' | 'in-progress' | 'done'
): TaskStatus => {
  const statusMapping: Record<'todo' | 'in-progress' | 'done', TaskStatus> = {
    todo: '할일',
    'in-progress': '진행중',
    done: '완료',
  };

  return statusMapping[kanbanStatus];
};

/**
 * Task의 status를 칸반 상태로 변환
 * 칸반보드는 3칸 레이아웃(할일/진행중/완료) 사용
 */
export const taskStatusToKanbanStatus = (status: string): 'todo' | 'in-progress' | 'done' => {
  const mapping: Record<string, 'todo' | 'in-progress' | 'done'> = {
    할일: 'todo',
    진행중: 'in-progress',
    완료: 'done',
  };
  return mapping[status] || 'todo';
};

/**
 * 상태에 따른 진행률 자동 계산
 * CLAUDE.md의 자동 계산 로직 구현
 */
export const calculateProgressFromStatus = (status: TaskStatus): number => {
  const progressMapping: Record<TaskStatus, number> = {
    할일: 0,
    진행중: 50,
    완료: 100,
  };

  return progressMapping[status];
};

/**
 * 기간(duration_days)으로부터 종료일 자동 계산
 * CLAUDE.md의 자동 계산 로직 구현
 */
export const calculateEndDateFromDuration = (startDate: string, durationDays: number): string => {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + durationDays);
  return end.toISOString().split('T')[0];
};

/**
 * 계층 구조의 Task 배열을 평탄화
 * Gantt 차트와 Kanban 보드에서 모든 작업을 단일 배열로 처리할 때 사용
 * @param tasks - 계층 구조를 가진 Task 배열
 * @returns 평탄화된 Task 배열
 */
export const flattenTasks = (tasks: Task[]): Task[] => {
  const result: Task[] = [];

  const traverse = (taskList: Task[]) => {
    for (const task of taskList) {
      result.push(task);
      if (task.subtasks && task.subtasks.length > 0) {
        traverse(task.subtasks);
      }
    }
  };

  traverse(tasks);
  return result;
};

/**
 * 평탄화된 GanttTask 배열을 계층 구조의 Task 배열로 역변환
 * Gantt 차트 저장 시 사용
 * @param ganttTasks - 평탄화된 GanttTask 배열
 * @param originalTasks - 원본 Task 배열 (구조 참조용)
 * @returns 계층 구조가 복원된 Task 배열
 */
export const convertGanttTasksToHierarchical = (
  ganttTasks: GanttTask[],
  originalTasks: Task[]
): Task[] => {
  // GanttTask를 task_id로 빠르게 찾기 위한 Map 생성
  const ganttTaskMap = new Map<string, GanttTask>();
  ganttTasks.forEach((gt) => {
    ganttTaskMap.set(gt.id, gt);
  });

  // 원본 Task를 순회하며 GanttTask의 변경사항을 적용
  const updateTask = (task: Task): Task => {
    const ganttTask = ganttTaskMap.get(task.task_id);

    // GanttTask가 있으면 변경사항 적용
    const updatedTask: Task = ganttTask
      ? {
          ...task,
          start_date: ganttTask.start.toISOString().split('T')[0],
          end_date: ganttTask.end.toISOString().split('T')[0],
          duration_days:
            Math.ceil(
              (ganttTask.end.getTime() - ganttTask.start.getTime()) / (1000 * 60 * 60 * 24)
            ) || 1,
          progress: ganttTask.progress,
          name: ganttTask.name,
        }
      : task;

    // subtasks가 있으면 재귀적으로 업데이트
    if (task.subtasks && task.subtasks.length > 0) {
      return {
        ...updatedTask,
        subtasks: task.subtasks.map(updateTask),
      };
    }

    return updatedTask;
  };

  return originalTasks.map(updateTask);
};
