'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { HierarchicalWBSTable } from './HierarchicalWbsTable';
import type { Task, BackendTask } from '@/shared/lib/apiTypes';
import { WBSTableSkeleton } from '@/features/wbs/skeletons/WBSTableSkeleton';
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from '@/shared/hooks/queries/useTaskQuery';

// 재귀적으로 작업 찾기 헬퍼 함수
const findTaskRecursive = (tasks: Task[], taskId: string): Task | null => {
  for (const task of tasks) {
    if (task.task_id === taskId) {
      return task;
    }
    if (task.subtasks && task.subtasks.length > 0) {
      const found = findTaskRecursive(task.subtasks, taskId);
      if (found) return found;
    }
  }
  return null;
};

function buildTaskTree(backendTasks: any[]): Task[] {
  if (!backendTasks || !Array.isArray(backendTasks)) return [];

  const taskMap = new Map<string, Task>();
  const rootTasks: Task[] = [];

  // 1. 변환
  backendTasks.forEach((bt) => {
    // BackendTask(id: number)와 CollaborativeTask(id: string) 모두 대응
    const id = String(bt.id || bt.task_id);
    const parent = bt.parent || bt.parent_id;

    const task: Task = {
      task_id: id,
      parent_id: parent && parent !== id ? String(parent) : null,
      name: bt.name,
      start_date: bt.start || bt.start_date,
      end_date: bt.end || bt.end_date,
      duration_days: bt.duration || bt.duration_days || 1,
      progress: bt.progress || 0,
      status: bt.status === 'TODO' ? '할일' : bt.status === 'IN_PROGRESS' ? '진행중' : '완료',
      assignee: bt.assigneeEmail || bt.assignee || '',
      subtasks: [],
    };
    taskMap.set(task.task_id, task);
  });

  // 2. 구조화
  taskMap.forEach((task) => {
    if (task.parent_id && taskMap.has(task.parent_id)) {
      taskMap.get(task.parent_id)?.subtasks?.push(task);
    } else {
      rootTasks.push(task);
    }
  });

  return rootTasks;
}

interface WBSTableViewProps {
  projectId?: string;
}

export function WBSTableView({ projectId: propProjectId }: WBSTableViewProps) {
  const params = useParams();
  const projectId = propProjectId || (params.id as string);

  const createTaskMutation = useCreateTask(projectId);
  const updateTaskMutation = useUpdateTask(projectId);
  const deleteTaskMutation = useDeleteTask(projectId);

  const { data: rawTasks = [], isLoading } = useTasks(projectId);

  const initialTasks = useMemo(() => {
    // buildTaskTree 함수가 없다면 아래에 정의해줘야 합니다.
    return buildTaskTree(rawTasks);
  }, [rawTasks]);

  // 렌더링용 데이터: API 데이터 사용
  const tasks = initialTasks;

  // Store 액션 래퍼 함수들 및 이벤트 핸들러
  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    // 4. 상태나 진행률 변경 시 값 동기화 로직
    const newUpdates: any = { ...updates };

    // 상태 변경 시: 한글 상태를 백엔드 Enum으로 변환하고 진행률 동기화
    if (updates.status) {
      let backendStatus = updates.status as string;
      if (updates.status === '할일') backendStatus = 'TODO';
      else if (updates.status === '진행중') backendStatus = 'IN_PROGRESS';
      else if (updates.status === '완료') backendStatus = 'DONE';

      newUpdates.status = backendStatus;

      if (backendStatus === 'TODO') newUpdates.progress = 0;
      else if (backendStatus === 'IN_PROGRESS') newUpdates.progress = 1;
      else if (backendStatus === 'DONE') newUpdates.progress = 100;
    }

    // 진행률 변경 시: 상태 동기화
    if (updates.progress !== undefined) {
      if (updates.progress === 0) newUpdates.status = 'TODO';
      else if (updates.progress === 100) newUpdates.status = 'DONE';
      else newUpdates.status = 'IN_PROGRESS';
    }

    updateTaskMutation.mutate({ taskId: Number(taskId), updates: newUpdates });
  };

  const handleTaskDelete = (taskId: string) => {
    deleteTaskMutation.mutate(Number(taskId));
  };

  const handleTaskAdd = (parentId?: string, taskData?: Partial<Task>) => {
    // 상태 매핑 (한글 -> 백엔드 Enum)
    let backendStatus = 'TODO';
    if (taskData?.status === '진행중') backendStatus = 'IN_PROGRESS';
    else if (taskData?.status === '완료') backendStatus = 'DONE';

    const newTask: Task = {
      task_id: String(Date.now()), // 임시 ID 생성
      name: taskData?.name || '새 작업',
      start_date: taskData?.start_date || new Date().toISOString().split('T')[0],
      end_date: taskData?.end_date || new Date().toISOString().split('T')[0],
      duration_days: taskData?.duration_days || 1,
      progress: 0,
      status: '할일',
      assignee: taskData?.assignee || '',
      subtasks: [],
      parent_id: parentId || null,
      ...taskData,
    };
    // API 호출 시에는 필요한 데이터만 전송 (ID는 백엔드 생성)
    createTaskMutation.mutate({
      ...newTask,
      status: backendStatus,
      parent: parentId ? Number(parentId) : undefined,
    } as any);
  };

  if (isLoading) {
    return <WBSTableSkeleton />;
  }

  return (
    <>
      <HierarchicalWBSTable
        tasks={tasks}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
        onTaskAdd={handleTaskAdd}
      />
    </>
  );
}
