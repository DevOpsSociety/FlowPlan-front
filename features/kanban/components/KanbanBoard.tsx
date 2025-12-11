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
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Progress } from '@/shared/ui/progress';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import type { ITask as SvarTask } from '@svar-ui/react-gantt';
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { PROGRESS_BY_COLUMN, STATUS_BY_COLUMN, kanbanColumns } from '../config/kanbanConfig';
import { useKanbanDragDrop } from '../hooks/useKanbanDragDrop';
import { useKanbanExpansion } from '../hooks/useKanbanExpansion';
import { KanbanBoardSkeleton } from '../skeletons/KanbanBoardSkeleton';
import { getSubtasks, groupTasksByStatus } from '../utils/kanbanTransformers';

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
  const [editingTask, setEditingTask] = useState<{
    id: number;
    name: string;
    progress: number;
    startDate: string;
    endDate: string;
    assigneeName: string; // 담당자 이름 (읽기 전용 표시용)
    assigneeEmail: string; // 담당자 이메일 (수정 가능)
  } | null>(null);
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
  const handleAddTask = (columnId: 'todo' | 'in-progress' | 'done') => {
    const taskName = newTaskInputs[columnId].name.trim();
    // const assigneeName = newTaskInputs[columnId].assignee.trim();

    if (!taskName) {
      toast({
        title: '작업 이름을 입력하세요',
        variant: 'destructive',
      });
      return;
    }

    // 오늘 날짜 (duration=1이 되도록 시작일과 종료일을 같게 설정)
    const today = new Date();

    const taskData: CreateTaskDto = {
      name: taskName,
      status: STATUS_BY_COLUMN[columnId],
      progress: PROGRESS_BY_COLUMN[columnId],
      startDate: today.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0], // duration=1이 되도록 시작일과 같게 설정
      // API 스펙상 assigneeId(number)가 필요하지만, 현재 사용자 목록이 없으므로
      // UI에서 입력받은 이름을 임시로 처리하거나 추후 매핑 로직 필요
      // (현재는 타입 정의에 assignee 문자열 필드가 없으므로 전송되지 않음)
    };

    createTaskMutation.mutate(taskData, {
      onSuccess: () => {
        // 입력창 초기화 및 닫기
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

    // 원본 task 찾기
    const originalTask = tasks.find((t) => t.id === editingTask.id);
    if (!originalTask) {
      console.warn('⚠️ Original task not found for:', editingTask.id);
      return;
    }

    // ✅ Level 1 개선: 하위 작업도 0-100% 자유롭게 설정 가능
    // 진행률 검증 제거

    // 변경된 필드만 추출
    const updates: any = {};

    // 1. 작업명 비교
    if (editingTask.name !== (originalTask.text || '')) {
      updates.name = editingTask.name;
    }

    // 2. 진행률 비교
    const originalProgress = originalTask.progress || 0; // 이미 0-100 범위
    if (editingTask.progress !== originalProgress) {
      updates.progress = editingTask.progress;

      // 진행률에 따른 상태 결정
      let newStatus = 'TODO';
      if (editingTask.progress === 100) {
        newStatus = 'DONE';
      } else if (editingTask.progress > 0) {
        newStatus = 'IN_PROGRESS';
      }
      updates.status = newStatus;
    }

    // 3. 시작일 비교
    const originalStartDate = originalTask.start
      ? originalTask.start.toISOString().split('T')[0]
      : '';
    if (editingTask.startDate !== originalStartDate) {
      updates.startDate = editingTask.startDate;
    }

    // 4. 종료일 비교
    const originalEndDate = originalTask.end ? originalTask.end.toISOString().split('T')[0] : '';
    if (editingTask.endDate !== originalEndDate) {
      updates.endDate = editingTask.endDate;
    }

    // 5. 담당자 이메일 비교
    const originalEmail = (originalTask as any).assigneeEmail || '';
    if (editingTask.assigneeEmail !== originalEmail) {
      if (editingTask.assigneeEmail) {
        updates.assigneeEmail = editingTask.assigneeEmail;
      }
    }

    // 변경된 필드가 없으면 API 호출 안 함
    if (Object.keys(updates).length === 0) {
      console.log('✅ [Kanban] No changes detected, closing dialog');
      setIsEditOpen(false);
      setEditingTask(null);
      return;
    }

    console.log('📤 [Kanban] Sending only changed fields:', updates);

    updateTaskMutation.mutate(
      {
        taskId: editingTask.id,
        updates,
      },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setEditingTask(null);
          toast({
            title: '작업이 수정되었습니다',
          });
        },
      }
    );
  };

  const openEditDialog = (task: SvarTask) => {
    setEditingTask({
      id: Number(task.id),
      name: task.text || '',
      progress: task.progress || 0, // 이미 0-100 범위 (API에서 int32)
      startDate: task.start ? task.start.toISOString().split('T')[0] : '',
      endDate: task.end ? task.end.toISOString().split('T')[0] : '',
      assigneeName: (task as any).assigneeName || '', // 담당자 이름 (읽기 전용)
      assigneeEmail: (task as any).assigneeEmail || '', // 담당자 이메일 (수정 가능)
    });
    setIsEditOpen(true);
  };

  const getAssigneeInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kanbanColumns.map((column) => {
            const columnTasks = kanbanTasks[column.id];

            return (
              <div key={column.id}>
                <Droppable droppableId={String(column.id)}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-lg p-4 min-h-[500px] transition-colors ${column.color} ${
                        snapshot.isDraggingOver ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      {/* 컬럼 헤더 */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-foreground">{column.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {columnTasks.length}
                          </Badge>
                        </div>
                      </div>
                      {/* 새 작업 추가 입력창 */}
                      {showNewTaskInput[column.id] && (
                        <div className="mb-3 space-y-2">
                          <Input
                            placeholder="작업 이름 입력..."
                            value={newTaskInputs[column.id].name}
                            onChange={(e) =>
                              setNewTaskInputs((prev) => ({
                                ...prev,
                                [column.id]: { ...prev[column.id], name: e.target.value },
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddTask(column.id);
                              } else if (e.key === 'Escape') {
                                setShowNewTaskInput((prev) => ({
                                  ...prev,
                                  [column.id]: false,
                                }));
                                setNewTaskInputs((prev) => ({
                                  ...prev,
                                  [column.id]: { name: '', assignee: '' },
                                }));
                              }
                            }}
                            autoFocus
                            className="mb-2"
                          />
                          <Input
                            placeholder="담당자 이름 입력..."
                            value={newTaskInputs[column.id].assignee}
                            onChange={(e) =>
                              setNewTaskInputs((prev) => ({
                                ...prev,
                                [column.id]: { ...prev[column.id], assignee: e.target.value },
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddTask(column.id);
                              } else if (e.key === 'Escape') {
                                setShowNewTaskInput((prev) => ({
                                  ...prev,
                                  [column.id]: false,
                                }));
                                setNewTaskInputs((prev) => ({
                                  ...prev,
                                  [column.id]: { name: '', assignee: '' },
                                }));
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddTask(column.id)}
                              disabled={createTaskMutation.isPending}
                            >
                              추가
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setShowNewTaskInput((prev) => ({
                                  ...prev,
                                  [column.id]: false,
                                }));
                                setNewTaskInputs((prev) => ({
                                  ...prev,
                                  [column.id]: { name: '', assignee: '' },
                                }));
                              }}
                            >
                              취소
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* ✅ 계층형 칸반: 부모 + 자식 작업 카드들 */}
                      <div className="space-y-3">
                        {columnTasks.map((task: SvarTask, index: number) => {
                          const subtasks = getSubtasks(tasks, task.id);
                          const hasSubtasks = subtasks.length > 0;
                          const isExpanded = expandedTasks.has(Number(task.id));

                          return (
                            <div key={`task-group-${task.id}`} className="space-y-2">
                              {/* 부모 작업 카드 */}
                              <Draggable
                                key={`parent-${task.id}`}
                                draggableId={`parent-${task.id}`}
                                index={index}
                              >
                                {(dragProvided, dragSnapshot) => (
                                  <div
                                    ref={dragProvided.innerRef}
                                    {...dragProvided.draggableProps}
                                    {...dragProvided.dragHandleProps}
                                  >
                                    <Card
                                      className={`cursor-pointer hover:shadow-md transition-shadow bg-background ${
                                        dragSnapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                      }`}
                                    >
                                      <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                          <h5 className="font-medium text-sm leading-tight line-clamp-2 flex-1">
                                            {task.text}
                                          </h5>
                                          <div className="flex gap-1">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-6 w-6 p-0 hover:bg-muted"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openEditDialog(task);
                                              }}
                                            >
                                              <Pencil className="h-3 w-3 text-muted-foreground" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-6 w-6 p-0 hover:bg-destructive/10"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteTask(
                                                  task.id as number,
                                                  task.text ?? '이름 없는 작업'
                                                );
                                              }}
                                            >
                                              <Trash2 className="h-3 w-3 text-destructive" />
                                            </Button>
                                          </div>
                                        </div>
                                      </CardHeader>
                                      <CardContent className="pt-0 space-y-3">
                                        {/* 진행률 */}
                                        <div>
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-muted-foreground">
                                              진행률
                                            </span>
                                            <span className="text-xs font-medium">
                                              {task.progress || 0}%
                                            </span>
                                          </div>
                                          <Progress value={task.progress || 0} className="h-1.5" />
                                        </div>

                                        {/* 담당자 */}
                                        {(task as any).assigneeName && (
                                          <div className="flex items-center space-x-2">
                                            <Avatar className="h-6 w-6">
                                              <AvatarFallback className="text-xs">
                                                {getAssigneeInitials((task as any).assigneeName)}
                                              </AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-muted-foreground">
                                              {(task as any).assigneeName}
                                            </span>
                                          </div>
                                        )}

                                        {/* 날짜 정보 */}
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                          <div className="flex items-center space-x-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                              {formatDate(task.start)}
                                              {task.end && ` ~ ${formatDate(task.end)}`}
                                            </span>
                                          </div>
                                          <div className="flex items-center space-x-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{task.duration}일</span>
                                          </div>
                                        </div>

                                        {/* 하위 작업 펼치기/접기 버튼 */}
                                        {hasSubtasks && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full mt-2 h-7 text-xs hover:bg-accent"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleTaskExpansion(Number(task.id));
                                            }}
                                          >
                                            {isExpanded ? (
                                              <>
                                                <ChevronDown className="h-3 w-3 mr-1" />
                                                하위 작업 접기 ({subtasks.length})
                                              </>
                                            ) : (
                                              <>
                                                <ChevronRight className="h-3 w-3 mr-1" />
                                                하위 작업 펼치기 ({subtasks.length})
                                              </>
                                            )}
                                          </Button>
                                        )}
                                      </CardContent>
                                    </Card>
                                  </div>
                                )}
                              </Draggable>

                              {/* ✅ 하위 작업 카드들 (펼쳤을 때만 표시) */}
                              {hasSubtasks && isExpanded && (
                                <div className="ml-8 space-y-2">
                                  {subtasks.map((subtask, subIndex) => (
                                    <Draggable
                                      key={`subtask-${subtask.id}`}
                                      draggableId={`subtask-${subtask.id}`}
                                      index={subIndex}
                                    >
                                      {(subDragProvided, subDragSnapshot) => (
                                        <div
                                          ref={subDragProvided.innerRef}
                                          {...subDragProvided.draggableProps}
                                          {...subDragProvided.dragHandleProps}
                                        >
                                          <Card
                                            className={`cursor-pointer hover:shadow-md transition-shadow bg-background ${
                                              subDragSnapshot.isDragging ? 'shadow-lg rotate-1' : ''
                                            }`}
                                          >
                                            <CardHeader className="pb-2">
                                              <div className="flex items-start justify-between">
                                                <h5 className="font-medium text-sm leading-tight line-clamp-2 flex-1">
                                                  {subtask.text}
                                                </h5>
                                                <div className="flex gap-1">
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0 hover:bg-muted"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      openEditDialog(subtask);
                                                    }}
                                                  >
                                                    <Pencil className="h-3 w-3 text-muted-foreground" />
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0 hover:bg-destructive/10"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleDeleteTask(
                                                        subtask.id as number,
                                                        subtask.text ?? '이름 없는 하위 작업'
                                                      );
                                                    }}
                                                  >
                                                    <Trash2 className="h-3 w-3 text-destructive" />
                                                  </Button>
                                                </div>
                                              </div>
                                            </CardHeader>
                                            <CardContent className="pt-0 space-y-2">
                                              {/* 진행률 */}
                                              <div>
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-xs text-muted-foreground">
                                                    진행률
                                                  </span>
                                                  <span className="text-xs font-medium">
                                                    {subtask.progress || 0}%
                                                  </span>
                                                </div>
                                                <Progress
                                                  value={subtask.progress || 0}
                                                  className="h-1.5"
                                                />
                                              </div>

                                              {/* 담당자 */}
                                              {(subtask as any).assigneeName && (
                                                <div className="flex items-center space-x-2">
                                                  <Avatar className="h-5 w-5">
                                                    <AvatarFallback className="text-xs">
                                                      {getAssigneeInitials(
                                                        (subtask as any).assigneeName
                                                      )}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                  <span className="text-xs text-muted-foreground">
                                                    {(subtask as any).assigneeName}
                                                  </span>
                                                </div>
                                              )}

                                              {/* 날짜 정보 */}
                                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <div className="flex items-center space-x-1">
                                                  <Calendar className="h-3 w-3" />
                                                  <span>
                                                    {formatDate(subtask.start)}
                                                    {subtask.end && ` ~ ${formatDate(subtask.end)}`}
                                                  </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                  <Clock className="h-3 w-3" />
                                                  <span>{subtask.duration}일</span>
                                                </div>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {provided.placeholder}

                        {/* 빈 상태 */}
                        {columnTasks.length === 0 && !showNewTaskInput[column.id] && (
                          <div className="text-center py-8 text-muted-foreground">
                            <div className="text-sm">작업이 없습니다</div>
                            <div className="text-xs mt-1">작업을 여기로 드래그하세요</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* 작업 수정 다이얼로그 */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>작업 수정</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="task-name">작업 이름</Label>
                <Input
                  id="task-name"
                  value={editingTask.name}
                  onChange={(e) =>
                    setEditingTask((prev) => (prev ? { ...prev, name: e.target.value } : null))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignee-name">담당자</Label>
                <Input
                  id="assignee-name"
                  value={editingTask.assigneeName}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignee-email">담당자 이메일</Label>
                <Input
                  id="assignee-email"
                  type="email"
                  placeholder="example@email.com"
                  value={editingTask.assigneeEmail}
                  onChange={(e) =>
                    setEditingTask((prev) =>
                      prev ? { ...prev, assigneeEmail: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-progress">
                  진행률 ({editingTask.progress}%)
                  {!rawTasks.find((t) => t.id === editingTask.id)?.parent &&
                    rawTasks.some((t) => t.parent === editingTask.id) && (
                      <span className="ml-2 text-xs text-amber-600">
                        (하위 작업이 있어 자동 계산됨)
                      </span>
                    )}
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="task-progress"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={editingTask.progress}
                    disabled={
                      !rawTasks.find((t) => t.id === editingTask.id)?.parent &&
                      rawTasks.some((t) => t.parent === editingTask.id)
                    }
                    onChange={(e) => {
                      const newProgress = Number(e.target.value);
                      setEditingTask((prev) => (prev ? { ...prev, progress: newProgress } : null));
                    }}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editingTask.progress}
                    disabled={
                      !rawTasks.find((t) => t.id === editingTask.id)?.parent &&
                      rawTasks.some((t) => t.parent === editingTask.id)
                    }
                    onChange={(e) => {
                      const newProgress = Number(e.target.value);
                      setEditingTask((prev) => (prev ? { ...prev, progress: newProgress } : null));
                    }}
                    className="w-20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">시작일</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={editingTask.startDate}
                    onChange={(e) =>
                      setEditingTask((prev) =>
                        prev ? { ...prev, startDate: e.target.value } : null
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">종료일</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={editingTask.endDate}
                    onChange={(e) =>
                      setEditingTask((prev) => (prev ? { ...prev, endDate: e.target.value } : null))
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              취소
            </Button>
            <Button onClick={handleEditTask} disabled={updateTaskMutation.isPending}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
