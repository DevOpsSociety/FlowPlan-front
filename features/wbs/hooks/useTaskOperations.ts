'use client';

import type React from 'react';

import { useCallback } from 'react';
import { useToast } from '@/shared/hooks/useToast';
import { emitSyncEvent } from '@/shared/lib/storage';
import type { Task } from '@/shared/lib/apiTypes';

export function useTaskOperations(
  projectId: string,
  wbsTasks: Task[],
  setWbsTasks: React.Dispatch<React.SetStateAction<Task[]>>
) {
  const { toast } = useToast();

  const findTaskById = useCallback((tasks: Task[], taskId: string): Task | null => {
    for (const task of tasks) {
      if (task.task_id === taskId) return task;
      if (task.subtasks && task.subtasks.length > 0) {
        const found = findTaskById(task.subtasks, taskId);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const findTaskName = useCallback((tasks: Task[], id: string): string | undefined => {
    for (const task of tasks) {
      if (task.task_id === id) return task.name;
      if (task.subtasks) {
        const found = findTaskName(task.subtasks, id);
        if (found) return found;
      }
    }
    return undefined;
  }, []);

  const handleTaskUpdate = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      const updateTaskRecursively = (tasks: Task[]): Task[] => {
        return tasks.map((task) => {
          if (task.task_id === taskId) {
            const updatedTask = { ...task, ...updates };

            if (updates.status) {
              if (updates.status === '완료') {
                updatedTask.progress = 100;
              } else if (updates.status === '진행중' && task.progress === 0) {
                updatedTask.progress = 10;
              } else if (updates.status === '할일') {
                updatedTask.progress = 0;
              }
            }

            if (updates.duration_days && updates.duration_days !== task.duration_days) {
              const startDate = new Date(task.start_date);
              const newEndDate = new Date(startDate);
              newEndDate.setDate(startDate.getDate() + updates.duration_days - 1);
              updatedTask.end_date = newEndDate.toISOString().split('T')[0];
            }

            return updatedTask;
          }

          if (task.subtasks && task.subtasks.length > 0) {
            return {
              ...task,
              subtasks: updateTaskRecursively(task.subtasks),
            };
          }

          return task;
        });
      };

      setWbsTasks((prev) => {
        const updated = updateTaskRecursively(prev);

        emitSyncEvent({
          type: 'task_updated',
          projectId,
          taskId,
          data: updates,
          timestamp: Date.now(),
        });

        return updated;
      });

      toast({
        title: '작업이 업데이트되었습니다',
        description: `${findTaskName(wbsTasks, taskId)}이(가) 수정되었습니다.`,
      });
    },
    [wbsTasks, projectId, toast, setWbsTasks, findTaskName]
  );

  const handleTaskDelete = useCallback(
    (taskId: string) => {
      const deleteTaskRecursively = (tasks: Task[]): Task[] => {
        return tasks.filter((task) => {
          if (task.task_id === taskId) return false;
          if (task.subtasks && task.subtasks.length > 0) {
            task.subtasks = deleteTaskRecursively(task.subtasks);
          }
          return true;
        });
      };

      const taskName = findTaskName(wbsTasks, taskId);

      setWbsTasks((prev) => {
        const updated = deleteTaskRecursively(prev);

        emitSyncEvent({
          type: 'task_deleted',
          projectId,
          taskId,
          data: { taskName },
          timestamp: Date.now(),
        });

        return updated;
      });

      toast({
        title: '작업이 삭제되었습니다',
        description: `${taskName}이(가) 삭제되었습니다.`,
      });
    },
    [wbsTasks, projectId, toast, setWbsTasks, findTaskName]
  );

  const handleTaskAdd = useCallback(
    (parentId?: string, taskData?: Partial<Task>) => {
      // 부모 작업이 있는 경우 depth 체크 (최대 2단계)
      if (parentId) {
        const parentTask = findTaskById(wbsTasks, parentId);
        // parent_id가 null이 아니면 이미 1단계 하위이므로 더 이상 추가 불가
        if (parentTask && parentTask.parent_id !== null) {
          toast({
            title: '작업 추가 불가',
            description: '최대 2단계(1.0 → 1.1)까지만 작업을 추가할 수 있습니다.',
            variant: 'destructive',
          });
          return;
        }
      }

      const newTask: Task = {
        task_id: `task-new-${Date.now()}`,
        parent_id: parentId || null,
        name: taskData?.name || '새 작업',
        assignee: taskData?.assignee || '미지정',
        start_date: taskData?.start_date || new Date().toISOString().split('T')[0],
        end_date:
          taskData?.end_date ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration_days: taskData?.duration_days || 7,
        progress: taskData?.progress || 0,
        status: taskData?.status || '할일',
        subtasks: [],
      };

      if (parentId) {
        const addSubTaskRecursively = (tasks: Task[]): Task[] => {
          return tasks.map((task) => {
            if (task.task_id === parentId) {
              return {
                ...task,
                subtasks: [...(task.subtasks || []), newTask],
              };
            }
            if (task.subtasks && task.subtasks.length > 0) {
              return {
                ...task,
                subtasks: addSubTaskRecursively(task.subtasks),
              };
            }
            return task;
          });
        };
        setWbsTasks((prev) => {
          const updated = addSubTaskRecursively(prev);

          emitSyncEvent({
            type: 'task_added',
            projectId,
            taskId: newTask.task_id,
            data: { newTask, parentId },
            timestamp: Date.now(),
          });

          return updated;
        });
      } else {
        setWbsTasks((prev) => {
          const updated = [...prev, newTask];

          emitSyncEvent({
            type: 'task_added',
            projectId,
            taskId: newTask.task_id,
            data: { newTask },
            timestamp: Date.now(),
          });

          return updated;
        });
      }

      toast({
        title: parentId ? '새 하위 작업이 추가되었습니다' : '새 작업이 추가되었습니다',
        description: '작업 정보를 편집해주세요.',
      });
    },
    [projectId, toast, setWbsTasks, wbsTasks, findTaskById]
  );

  return {
    findTaskById,
    handleTaskUpdate,
    handleTaskDelete,
    handleTaskAdd,
  };
}
