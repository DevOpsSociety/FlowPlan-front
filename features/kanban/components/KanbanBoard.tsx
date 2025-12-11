'use client';

import type { CreateTaskDto } from '@/shared/api/taskTypes';
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from '@/shared/hooks/queries/useTaskQuery';
import { useToast } from '@/shared/hooks/useToast';
import { apiTaskToSvar } from '@/shared/lib/taskAdapters';
import { Button } from '@/shared/ui/button';
import { DragDropContext } from '@hello-pangea/dnd';
import type { ITask as SvarTask } from '@svar-ui/react-gantt';
import { Plus, RefreshCw } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { KanbanColumnId } from '../config/kanbanConfig';
import { PROGRESS_BY_COLUMN, STATUS_BY_COLUMN, kanbanColumns } from '../config/kanbanConfig';
import { useKanbanDragDrop } from '../hooks/useKanbanDragDrop';
import { useKanbanExpansion } from '../hooks/useKanbanExpansion';
import { KanbanBoardSkeleton } from '../skeletons/KanbanBoardSkeleton';
import { groupTasksByStatus } from '../utils/kanbanTransformers';
import { KanbanColumn } from './KanbanColumn';
import { KanbanEditDialog, type EditingTask } from './KanbanEditDialog';

export function KanbanBoard() {
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();

  // 새 작업 추가를 위한 state (컬럼별)
  const [newTaskInputs, setNewTaskInputs] = useState<
    Record<string, { name: string; assignee: string }>
  >({
    todo: { name: '', assignee: '' },
    'in-progress': { name: '', assignee: '' },
    done: { name: '', assignee: '' },
  });

  const [showNewTaskInput, setShowNewTaskInput] = useState<Record<string, boolean>>({
    todo: false,
    'in-progress': false,
    done: false,
  });

  // 작업 수정을 위한 state
  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // API에서 원본 데이터를 가져와서 SVAR 형식으로 변환
  const { data: rawTasks = [], isLoading, error, refetch } = useTasks(projectId);
  const tasks = useMemo(() => rawTasks.map(apiTaskToSvar), [rawTasks]);

  // Mutations
  const updateTaskMutation = useUpdateTask(projectId);
  const createTaskMutation = useCreateTask(projectId);
  const deleteTaskMutation = useDeleteTask(projectId);

  // 칸반 컬럼별로 그룹화
  const kanbanTasks = groupTasksByStatus(tasks);

  // ✅ 계층형 칸반: 접기/펼치기
  const { expandedTasks, toggleTaskExpansion } = useKanbanExpansion();

  // ✅ 드래그앤드롭 핸들러
  const { handleDragEnd } = useKanbanDragDrop({
    tasks,
    updateTaskMutation,
    toast,
  });

  // 데이터 새로고침
  const handleRefresh = () => {
    refetch();
    toast({
      title: '데이터를 새로고침했습니다',
      description: '최신 데이터를 불러왔습니다.',
    });
  };

  // 작업 추가 핸들러
  const handleAddTask = (columnId: KanbanColumnId) => {
    const taskName = newTaskInputs[columnId].name.trim();

    if (!taskName) {
      toast({
        title: '작업 이름을 입력하세요',
        variant: 'destructive',
      });
      return;
    }

    const today = new Date();

    const taskData: CreateTaskDto = {
      name: taskName,
      status: STATUS_BY_COLUMN[columnId],
      progress: PROGRESS_BY_COLUMN[columnId],
      startDate: today.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    };

    createTaskMutation.mutate(taskData, {
      onSuccess: () => {
        setNewTaskInputs((prev) => ({
          ...prev,
          [columnId]: { name: '', assignee: '' },
        }));
        setShowNewTaskInput((prev) => ({ ...prev, [columnId]: false }));
      },
    });
  };

  // 작업 삭제 핸들러
  const handleDeleteTask = (taskId: number, taskName: string) => {
    if (window.confirm(`"${taskName}" 작업을 삭제하시겠습니까?`)) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  // 작업 수정 핸들러 - 변경된 필드만 전송
  const handleEditTask = () => {
    if (!editingTask) return;

    const originalTask = tasks.find((t) => t.id === editingTask.id);
    if (!originalTask) {
      console.warn('⚠️ Original task not found for:', editingTask.id);
      return;
    }

    const updates: any = {};

    if (editingTask.name !== (originalTask.text || '')) {
      updates.name = editingTask.name;
    }

    const originalProgress = originalTask.progress || 0;
    if (editingTask.progress !== originalProgress) {
      updates.progress = editingTask.progress;

      let newStatus = 'TODO';
      if (editingTask.progress === 100) {
        newStatus = 'DONE';
      } else if (editingTask.progress > 0) {
        newStatus = 'IN_PROGRESS';
      }
      updates.status = newStatus;
    }

    const originalStartDate = originalTask.start
      ? originalTask.start.toISOString().split('T')[0]
      : '';
    if (editingTask.startDate !== originalStartDate) {
      updates.startDate = editingTask.startDate;
    }

    const originalEndDate = originalTask.end ? originalTask.end.toISOString().split('T')[0] : '';
    if (editingTask.endDate !== originalEndDate) {
      updates.endDate = editingTask.endDate;
    }

    const originalEmail = (originalTask as any).assigneeEmail || '';
    if (editingTask.assigneeEmail !== originalEmail) {
      if (editingTask.assigneeEmail) {
        updates.assigneeEmail = editingTask.assigneeEmail;
      }
    }

    if (Object.keys(updates).length === 0) {
      setIsEditOpen(false);
      setEditingTask(null);
      return;
    }

    updateTaskMutation.mutate(
      { taskId: editingTask.id, updates },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setEditingTask(null);
          toast({ title: '작업이 수정되었습니다' });
        },
      }
    );
  };

  // 수정 다이얼로그 열기
  const openEditDialog = (task: SvarTask) => {
    setEditingTask({
      id: Number(task.id),
      name: task.text || '',
      progress: task.progress || 0,
      startDate: task.start ? task.start.toISOString().split('T')[0] : '',
      endDate: task.end ? task.end.toISOString().split('T')[0] : '',
      assigneeName: (task as any).assigneeName || '',
      assigneeEmail: (task as any).assigneeEmail || '',
    });
    setIsEditOpen(true);
  };

  // 로딩 상태
  if (isLoading) {
    return <KanbanBoardSkeleton />;
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-destructive">데이터를 불러오는 중 오류가 발생했습니다</div>
        <div className="text-sm text-muted-foreground">{error.message}</div>
        <Button onClick={() => refetch()} variant="outline">
          다시 시도
        </Button>
      </div>
    );
  }

  // 전체 작업 수 계산
  const totalTasks =
    kanbanTasks.todo.length + kanbanTasks['in-progress'].length + kanbanTasks.done.length;

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">칸반 보드</h3>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            총 {totalTasks}개 작업 • 완료 {kanbanTasks.done.length}개
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button
            onClick={() =>
              setShowNewTaskInput((prev) => ({
                ...prev,
                todo: !prev.todo,
              }))
            }
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            작업 추가
          </Button>
        </div>
      </div>

      {/* 칸반 보드 */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kanbanColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={kanbanTasks[column.id]}
              allTasks={tasks}
              expandedTasks={expandedTasks}
              onToggleExpansion={toggleTaskExpansion}
              onAddTask={handleAddTask}
              onEditTask={openEditDialog}
              onDeleteTask={handleDeleteTask}
              showNewTaskInput={showNewTaskInput[column.id]}
              onToggleNewTaskInput={() =>
                setShowNewTaskInput((prev) => ({
                  ...prev,
                  [column.id]: !prev[column.id],
                }))
              }
              newTaskName={newTaskInputs[column.id].name}
              newTaskAssignee={newTaskInputs[column.id].assignee}
              onNewTaskNameChange={(value) =>
                setNewTaskInputs((prev) => ({
                  ...prev,
                  [column.id]: { ...prev[column.id], name: value },
                }))
              }
              onNewTaskAssigneeChange={(value) =>
                setNewTaskInputs((prev) => ({
                  ...prev,
                  [column.id]: { ...prev[column.id], assignee: value },
                }))
              }
              onCancelNewTask={() => {
                setShowNewTaskInput((prev) => ({ ...prev, [column.id]: false }));
                setNewTaskInputs((prev) => ({
                  ...prev,
                  [column.id]: { name: '', assignee: '' },
                }));
              }}
              isCreating={createTaskMutation.isPending}
            />
          ))}
        </div>
      </DragDropContext>

      {/* 작업 수정 다이얼로그 */}
      <KanbanEditDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        editingTask={editingTask}
        setEditingTask={setEditingTask}
        onSave={handleEditTask}
        isSaving={updateTaskMutation.isPending}
        rawTasks={rawTasks}
      />
    </div>
  );
}
