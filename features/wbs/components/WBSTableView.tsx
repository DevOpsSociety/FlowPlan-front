'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState, useCallback, useMemo } from 'react';
import { HierarchicalWBSTable } from './HierarchicalWbsTable';
import { TaskDetailPanel } from '@/shared/components/project/TaskDetailPanel';
import type { Task, BackendTask } from '@/shared/lib/apiTypes';
import { useEffect } from 'react';
import { useTaskStore } from '@/shared/stores/taskStore';
import { WBSTableSkeleton } from '@/features/wbs/skeletons/WBSTableSkeleton';
import { useTasks } from '@/shared/hooks/queries/useTaskQuery';

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

  // Zustand Store Actions
  const setTasks = useTaskStore((state) => state.setTasks);

  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const addTask = useTaskStore((state) => state.addTask);
  const queryClient = useQueryClient();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  const { data: rawTasks = [], isLoading } = useTasks(projectId);

  const initialTasks = useMemo(() => {
    // buildTaskTree 함수가 없다면 아래에 정의해줘야 합니다.
    return buildTaskTree(rawTasks);
  }, [rawTasks]);

  const tasksFromStore = useTaskStore((state) => state.getTasks(projectId));

  useEffect(() => {
    if (initialTasks.length > 0) {
      console.log(`[WBS] API 데이터 수신: ${initialTasks.length}건. 스토어 동기화 시도.`);
      setTasks(projectId, initialTasks);
    }
  }, [initialTasks, projectId, setTasks]);

  // 렌더링용 데이터: 스토어에 데이터가 있으면 스토어 데이터 사용, 없으면 API 초기 데이터 사용 (깜빡임 방지)
  const tasks = tasksFromStore.length > 0 ? tasksFromStore : initialTasks;

  // Store 액션 래퍼 함수들 및 이벤트 핸들러
  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    updateTask(projectId, taskId, updates);
  };

  const handleTaskDelete = (taskId: string) => {
    deleteTask(projectId, taskId);
  };

  const handleTaskAdd = (parentId?: string, taskData?: Partial<Task>) => {
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
    addTask(projectId, newTask, parentId);
  };

  const handleTaskSelect = useCallback(
    (taskId: string) => {
      setSelectedTask(findTaskRecursive(tasks, taskId));
      setSelectedTaskId(taskId);
      setIsTaskDetailOpen(true);
    },
    [tasks]
  );

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
        onTaskSelect={handleTaskSelect}
      />

      <TaskDetailPanel
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        onUpdate={handleTaskUpdate}
      />
    </>
  );
}
