'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { HierarchicalWBSTable } from './HierarchicalWbsTable';
import { useTaskOperations } from '../hooks/useTaskOperations';
import { TaskDetailPanel } from '@/shared/components/project/TaskDetailPanel';
import type { Task } from '@/shared/lib/apiTypes';

/**
 * WBS Table View 컴포넌트
 *
 * 계층적 WBS 테이블을 렌더링합니다.
 */
export function WBSTableView() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  // Tasks 조회 (localStorage mock - 백엔드 연동 전)
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
  });

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
