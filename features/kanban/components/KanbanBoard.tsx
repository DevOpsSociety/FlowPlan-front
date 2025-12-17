'use client';

import type { CreateTaskDto, TaskFlatDto } from '@/shared/api/taskTypes';
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from '@/shared/hooks/queries/useTaskQuery';
import { useToast } from '@/shared/hooks/useToast';
import { Button } from '@/shared/ui/button';
import { DragDropContext } from '@hello-pangea/dnd';
import { Plus, RefreshCw } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast as sonnerToast } from 'sonner';
import { kanbanColumns } from '../config/kanbanConfig';
import { useKanbanDragDrop } from '../hooks/useKanbanDragDrop';
import { useKanbanExpansion } from '../hooks/useKanbanExpansion';
import { KanbanBoardSkeleton } from '../skeletons/KanbanBoardSkeleton';
import { groupTasksByStatus } from '../utils/kanbanTransformers';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCreateDialog } from './KanbanCreateDialog';
import { KanbanEditDialog, type EditingTask } from './KanbanEditDialog';

export function KanbanBoard() {
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();

  // 작업 수정을 위한 state
  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // 작업 생성을 위한 state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createParentId, setCreateParentId] = useState<number | null>(null);

  // API에서 원본 데이터를 가져옴 (TaskFlatDto[] 직접 사용)
  const { data: tasks = [], isLoading, error, refetch } = useTasks(projectId);

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
    sonnerToast.success('데이터를 새로고침했습니다');
  };

  // 작업 생성 핸들러
  const handleCreateTask = (taskData: {
    name: string;
    assigneeEmail: string;
    parentId?: number;
  }) => {
    const today = new Date().toISOString().split('T')[0];

    const createData: CreateTaskDto = {
      name: taskData.name,
      status: 'TODO',
      progress: 0,
      startDate: today,
      endDate: today,
      ...(taskData.assigneeEmail && { assigneeEmail: taskData.assigneeEmail }),
      ...(taskData.parentId && { parentId: taskData.parentId }),
    };

    createTaskMutation.mutate(createData, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setCreateParentId(null);
        toast({
          title: taskData.parentId ? '하위 작업이 생성되었습니다' : '작업이 생성되었습니다',
        });
      },
    });
  };

  // 하위 작업 추가 핸들러
  const handleAddSubtask = (parentId: number) => {
    setCreateParentId(parentId);
    setIsCreateOpen(true);
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

    if (editingTask.name !== originalTask.name) {
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

    if (editingTask.startDate !== originalTask.start) {
      updates.startDate = editingTask.startDate;
    }

    if (editingTask.endDate !== originalTask.end) {
      updates.endDate = editingTask.endDate;
    }

    const originalEmail = originalTask.assigneeEmail || '';
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
  const openEditDialog = (task: TaskFlatDto) => {
    setEditingTask({
      id: task.id,
      name: task.name,
      progress: task.progress || 0,
      startDate: task.start,
      endDate: task.end,
      assigneeName: task.assigneeName || '',
      assigneeEmail: task.assigneeEmail || '',
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
            onClick={() => {
              setCreateParentId(null);
              setIsCreateOpen(true);
            }}
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
              onEditTask={openEditDialog}
              onDeleteTask={handleDeleteTask}
              onAddSubtask={handleAddSubtask}
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
        rawTasks={tasks}
      />

      {/* 작업 생성 다이얼로그 */}
      <KanbanCreateDialog
        isOpen={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setCreateParentId(null);
        }}
        onSubmit={handleCreateTask}
        isCreating={createTaskMutation.isPending}
        parentId={createParentId ?? undefined}
        parentName={createParentId ? tasks.find((t) => t.id === createParentId)?.name : undefined}
      />
    </div>
  );
}
