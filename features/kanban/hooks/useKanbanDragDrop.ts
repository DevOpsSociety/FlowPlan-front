import type { TaskFlatDto } from '@/shared/api/taskTypes';
import type { DropResult } from '@hello-pangea/dnd';
import type { UseMutationResult } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { KanbanColumnId } from '../config/kanbanConfig';
import { getSubtasks, kanbanToApiStatus } from '../utils/kanbanTransformers';

interface UseKanbanDragDropParams {
  tasks: TaskFlatDto[];
  updateTaskMutation: UseMutationResult<any, Error, any, unknown>;
  toast: (options: { title: string; description?: string }) => void;
}

/**
 * 칸반 보드 드래그앤드롭 로직 관리 훅
 *
 * - 부모 작업 드래그 시 자식도 함께 이동
 * - 상태에 따른 진행률 자동 계산
 */
export function useKanbanDragDrop({ tasks, updateTaskMutation, toast }: UseKanbanDragDropParams) {
  /**
   * 새 상태에 따른 진행률 계산
   */
  const calculateNewProgress = useCallback(
    (currentProgress: number, newStatus: KanbanColumnId): number => {
      if (newStatus === 'done') return 100;
      if (newStatus === 'todo') return 0;
      // in-progress: 0 또는 100이면 1로, 그 외는 유지
      if (currentProgress === 0 || currentProgress === 100) return 1;
      return currentProgress;
    },
    []
  );

  /**
   * 드래그앤드롭 완료 핸들러
   */
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result;

      // 드롭 위치가 없으면 무시
      if (!destination) return;

      // 같은 위치로 드롭하면 무시
      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
      }

      // 새로운 상태
      const newKanbanStatus = destination.droppableId as KanbanColumnId;
      const newApiStatus = kanbanToApiStatus(newKanbanStatus);

      // draggableId에서 타입과 실제 ID 추출
      const [taskType, taskIdStr] = draggableId.split('-');
      const taskId = Number(taskIdStr);
      const isSubtask = taskType === 'subtask';

      // 부모 작업인 경우: 상위 작업만 수정 (백엔드에서 하위 작업 자동 처리)
      if (!isSubtask) {
        const subtasks = getSubtasks(tasks, taskId);
        const hasSubtasks = subtasks.length > 0;
        const task = tasks.find((t) => t.id === taskId);
        const newProgress = calculateNewProgress(task?.progress || 0, newKanbanStatus);

        // 상위 작업만 수정 요청 (하위 작업은 백엔드에서 자동 처리)
        updateTaskMutation.mutate({
          taskId,
          updates: {
            status: newApiStatus,
            progress: newProgress,
          },
        });

        if (hasSubtasks) {
          toast({
            title: '작업 상태 변경',
            description: `상위 작업과 ${subtasks.length}개의 하위 작업이 함께 이동됩니다.`,
          });
        }
      } else {
        // 자식 작업인 경우: 자식만 독립적으로 이동
        const task = tasks.find((t) => t.id === taskId);
        const newProgress = calculateNewProgress(task?.progress || 0, newKanbanStatus);

        updateTaskMutation.mutate({
          taskId,
          updates: {
            status: newApiStatus,
            progress: newProgress,
          },
        });
      }
    },
    [tasks, updateTaskMutation, toast, calculateNewProgress]
  );

  return { handleDragEnd };
}
