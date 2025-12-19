'use client';

import { useQuery } from '@tanstack/react-query';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { HierarchicalWBSTable } from './HierarchicalWbsTable';
import type { Task, BackendTask } from '@/shared/lib/apiTypes';
import { WBSTableSkeleton } from '@/features/wbs/skeletons/WBSTableSkeleton';
import { fetchProjectMembers } from '@/shared/api/memberApi';

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
    const idVal = bt.id ?? bt.task_id;
    if (idVal === undefined || idVal === null) return; // ID가 없으면 건너뜀

    const id = String(idVal);
    const parentVal = bt.parent ?? bt.parent_id;

    const task: Task = {
      task_id: id,
      parent_id: parentVal && String(parentVal) !== id ? String(parentVal) : null,
      name: bt.name,
      start_date: bt.start || bt.start_date,
      end_date: bt.end || bt.end_date,
      duration_days: bt.duration || bt.duration_days || 1,
      progress: bt.progress || 0,
      status: bt.status === 'TODO' ? '할일' : bt.status === 'IN_PROGRESS' ? '진행중' : '완료',
      assignee: bt.assigneeName || bt.assigneeEmail || bt.assignee || '',
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

  // 팀원 목록 조회
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers', projectId],
    queryFn: async () => {
      const members = await fetchProjectMembers(projectId);
      return members.map((m: any) => ({
        id: String(m.memberId),
        name: m.userName,
        email: m.userEmail,
        role: m.role === 'OWNER' ? 'owner' : m.role === 'EDITOR' ? 'member' : 'viewer',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    },
  });

  const initialTasks = useMemo(() => {
    // buildTaskTree 함수가 없다면 아래에 정의해줘야 합니다.
    return buildTaskTree(rawTasks);
  }, [rawTasks]);

  // 렌더링용 데이터: API 데이터 사용
  const tasks = initialTasks;

  // Store 액션 래퍼 함수들 및 이벤트 핸들러
  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    const originalTask = findTaskRecursive(tasks, taskId);
    if (!originalTask) return;

    const payload: any = {};
    // 1. 날짜/기간/이름 변경 확인 (값이 변경된 경우에만 payload에 추가)
    if (updates.start_date && updates.start_date !== originalTask.start_date) {
      payload.startDate = updates.start_date;
    }
    if (updates.end_date && updates.end_date !== originalTask.end_date) {
      payload.endDate = updates.end_date;
    }
    if (
      updates.duration_days !== undefined &&
      updates.duration_days !== originalTask.duration_days
    ) {
      payload.duration = updates.duration_days;
    }
    if (updates.name && updates.name !== originalTask.name) {
      payload.name = updates.name;
    }

    // 2. 담당자 변경 확인 (변경된 경우에만 전송하여 불필요한 404 에러 방지)
    if (updates.assignee !== undefined && updates.assignee !== originalTask.assignee) {
      payload.assigneeEmail = updates.assignee;
    }
    // 3. 상태/진행률 변경 로직 (상호 의존성 처리)
    const statusChanged = updates.status && updates.status !== originalTask.status;
    const progressChanged =
      updates.progress !== undefined && updates.progress !== originalTask.progress;

    if (statusChanged || progressChanged) {
      let newStatus = updates.status || originalTask.status;
      let newProgress = updates.progress !== undefined ? updates.progress : originalTask.progress;

      if (statusChanged && !progressChanged) {
        if (newStatus === '할일') newProgress = 0;
        else if (newStatus === '진행중') newProgress = 1;
        else if (newStatus === '완료') newProgress = 100;
      } else if (progressChanged && !statusChanged) {
        if (newProgress === 0) newStatus = '할일';
        else if (newProgress === 100) newStatus = '완료';
        else newStatus = '진행중';
      }

      let backendStatus = 'TODO';
      if (newStatus === '진행중') backendStatus = 'IN_PROGRESS';
      else if (newStatus === '완료') backendStatus = 'DONE';

      payload.status = backendStatus;
      payload.progress = newProgress;
    }

    // 변경사항이 없으면 요청을 보내지 않음
    if (Object.keys(payload).length === 0) return;

    updateTaskMutation.mutate({ taskId: Number(taskId), updates: payload });
  };

  const handleTaskDelete = (taskId: string) => {
    deleteTaskMutation.mutate(Number(taskId));
  };

  const handleTaskAdd = (parentId?: string, taskData?: Partial<Task>) => {
    // 상태 매핑 (한글 -> 백엔드 Enum)
    let backendStatus = 'TODO';
    if (taskData?.status === '진행중') backendStatus = 'IN_PROGRESS';
    else if (taskData?.status === '완료') backendStatus = 'DONE';

    // 생성 시에는 필수 필드만 깔끔하게 전송
    const payload: any = {
      name: taskData?.name || '새 작업',
      status: backendStatus,
      parent: parentId ? Number(parentId) : undefined,
      startDate: taskData?.start_date || new Date().toISOString().split('T')[0],
      endDate: taskData?.end_date || new Date().toISOString().split('T')[0],
      duration: taskData?.duration_days || 1,
      assigneeEmail: taskData?.assignee || '',
      progress: 0,
    };

    // API 호출 시에는 필요한 데이터만 전송 (ID는 백엔드 생성)
    createTaskMutation.mutate(payload);
  };

  if (isLoading) {
    return <WBSTableSkeleton />;
  }

  return (
    <>
      <HierarchicalWBSTable
        tasks={tasks}
        members={teamMembers}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
        onTaskAdd={handleTaskAdd}
      />
    </>
  );
}
