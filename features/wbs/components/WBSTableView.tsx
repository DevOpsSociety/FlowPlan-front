'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState, useCallback, useMemo } from 'react';
import { HierarchicalWBSTable } from './HierarchicalWbsTable';
import { useTaskOperations } from '../hooks/useTaskOperations';
import { TaskDetailPanel } from '@/shared/components/project/TaskDetailPanel';
import type { Task, BackendTask } from '@/shared/lib/apiTypes';
import { apiService } from '@/shared/lib/apiService';

/**
 * WBS Table View 컴포넌트
 *
 * 계층적 WBS 테이블을 렌더링합니다.
 */

// 컴포넌트 밖 (export function WBSTableView() 위쪽)

function buildTaskTree(backendTasks: BackendTask[]): Task[] {
  if (!backendTasks) return [];

  const taskMap = new Map<string, Task>();
  const rootTasks: Task[] = [];

  // 1. 변환
  backendTasks.forEach((bt) => {
    const task: Task = {
      task_id: String(bt.id),
      parent_id: bt.parent === bt.id || !bt.parent ? null : String(bt.parent),
      name: bt.name,
      start_date: bt.start,
      end_date: bt.end,
      duration_days: bt.duration,
      progress: bt.progress,
      status: bt.status === 'TODO' ? '할일' : bt.status === 'IN_PROGRESS' ? '진행중' : '완료', // 백엔드 값에 맞춰 수정 필요
      assignee: bt.assigneeEmail,
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

export function WBSTableView() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  const { data: rawTasks = [], isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => apiService.getProjectTasks(projectId), // 이 줄이 핵심입니다!
  });

  const tasks = useMemo(() => {
    // buildTaskTree 함수가 없다면 아래에 정의해줘야 합니다.
    return buildTaskTree(rawTasks);
  }, [rawTasks]);

  const { findTaskById, handleTaskUpdate, handleTaskDelete, handleTaskAdd } = useTaskOperations(
    projectId,
    tasks,
    (updatedTasks) => {
      queryClient.setQueryData(['tasks', projectId], updatedTasks);
    }
  );

  const handleTaskSelect = useCallback(
    (taskId: string) => {
      const task = findTaskById(tasks, taskId);
      if (task) {
        setSelectedTaskId(taskId);
        setSelectedTask(task);
        setIsTaskDetailOpen(true);
      }
    },
    [tasks, findTaskById]
  );

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
