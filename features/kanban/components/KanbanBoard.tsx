'use client';

import type { CreateTaskDto } from '@/shared/api/taskTypes';
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from '@/shared/hooks/queries/useTaskQuery';
import { useToast } from '@/shared/hooks/useToast';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Progress } from '@/shared/ui/progress';
import type { DropResult } from '@hello-pangea/dnd';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import type { ITask as SvarTask } from '@svar-ui/react-gantt';
import { Calendar, Clock, ListChecks, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { KanbanBoardSkeleton } from '../skeletons/KanbanBoardSkeleton';

interface KanbanColumn {
  id: 'todo' | 'in-progress' | 'done';
  title: string;
  color: string;
}

// API status를 칸반 컬럼 ID로 변환
const apiStatusToKanban = (status: string): 'todo' | 'in-progress' | 'done' => {
  const mapping: Record<string, 'todo' | 'in-progress' | 'done'> = {
    TODO: 'todo',
    IN_PROGRESS: 'in-progress',
    DONE: 'done',
  };
  return mapping[status] || 'todo';
};

// 칸반 컬럼 ID를 API status로 변환
const kanbanToApiStatus = (kanban: 'todo' | 'in-progress' | 'done'): string => {
  const mapping: Record<'todo' | 'in-progress' | 'done', string> = {
    todo: 'TODO',
    'in-progress': 'IN_PROGRESS',
    done: 'DONE',
  };
  return mapping[kanban];
};

// SVAR Task 배열을 칸반 컬럼별로 그룹화 (최상위 작업만)
const groupTasksByStatus = (tasks: SvarTask[]) => {
  // parent가 없는 최상위 작업만 사용
  const topLevelTasks = tasks.filter((t) => !t.parent);

  return {
    todo: topLevelTasks.filter((t) => apiStatusToKanban((t as any).status) === 'todo'),
    'in-progress': topLevelTasks.filter(
      (t) => apiStatusToKanban((t as any).status) === 'in-progress'
    ),
    done: topLevelTasks.filter((t) => apiStatusToKanban((t as any).status) === 'done'),
  };
};

// 특정 작업의 하위 작업 찾기
const getSubtasks = (tasks: SvarTask[], parentId: number | string): SvarTask[] => {
  return tasks.filter((t) => t.parent === parentId);
};

const columns: KanbanColumn[] = [
  {
    id: 'todo',
    title: '할 일',
    color: 'bg-slate-100 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/50',
  },
  {
    id: 'in-progress',
    title: '진행 중',
    color: 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30',
  },
  {
    id: 'done',
    title: '완료',
    color: 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30',
  },
];

export function KanbanBoard() {
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();

  // 새 작업 추가를 위한 state (컬럼별)
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({
    todo: '',
    'in-progress': '',
    done: '',
  });

  const [showNewTaskInput, setShowNewTaskInput] = useState<Record<string, boolean>>({
    todo: false,
    'in-progress': false,
    done: false,
  });

  // API에서 작업 목록 조회 (SVAR 형식으로 변환됨)
  const { data: tasks = [], isLoading, error, refetch } = useTasks(projectId);

  // Mutations
  const updateTaskMutation = useUpdateTask(projectId);
  const createTaskMutation = useCreateTask(projectId);
  const deleteTaskMutation = useDeleteTask(projectId);

  // 칸반 컬럼별로 그룹화
  const kanbanTasks = groupTasksByStatus(tasks);

  // 하위 작업 기반 진행률 계산
  const calculateProgressFromSubtasks = (subtasks: SvarTask[]): number => {
    if (subtasks.length === 0) return 0;

    const completedCount = subtasks.filter((s) => (s as any).status === 'DONE').length;

    return Math.round((completedCount / subtasks.length) * 100);
  };

  // 드래그앤드롭 핸들러
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // 드롭 위치가 없으면 무시
    if (!destination) return;

    // 같은 위치로 드롭하면 무시
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // 새로운 상태
    const newKanbanStatus = destination.droppableId as 'todo' | 'in-progress' | 'done';
    const newApiStatus = kanbanToApiStatus(newKanbanStatus);

    // 하위 작업을 고려한 진행률 계산
    const taskId = Number(draggableId);
    const subtasks = getSubtasks(tasks, taskId);
    let newProgress: number;

    if (newKanbanStatus === 'done') {
      newProgress = 100;
    } else if (newKanbanStatus === 'todo') {
      newProgress = 0;
    } else if (newKanbanStatus === 'in-progress') {
      // 하위 작업이 있으면 하위 작업 기반 계산, 없으면 기존 진행률 유지
      if (subtasks.length > 0) {
        newProgress = calculateProgressFromSubtasks(subtasks);
      } else {
        const currentTask = tasks.find((t) => t.id === taskId);
        const currentProgress = currentTask?.progress ?? 0;

        // DONE(100%)에서 IN_PROGRESS로 오면 0으로, 나머지는 기존값 유지
        newProgress = currentProgress === 100 ? 0 : currentProgress;
      }
    } else {
      newProgress = 0;
    }

    // API 업데이트 (자동 저장)
    updateTaskMutation.mutate({
      taskId: Number(draggableId),
      updates: {
        status: newApiStatus,
        progress: newProgress,
      },
    });
  };

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
    const taskName = newTaskInputs[columnId].trim();
    if (!taskName) {
      toast({
        title: '작업 이름을 입력하세요',
        variant: 'destructive',
      });
      return;
    }

    // 상태에 따른 기본값
    const statusMapping: Record<'todo' | 'in-progress' | 'done', string> = {
      todo: 'TODO',
      'in-progress': 'IN_PROGRESS',
      done: 'DONE',
    };
    const progressMapping: Record<'todo' | 'in-progress' | 'done', number> = {
      todo: 0,
      'in-progress': 50,
      done: 100,
    };

    // 오늘 날짜 (duration=1이 되도록 시작일과 종료일을 같게 설정)
    const today = new Date();

    const taskData: CreateTaskDto = {
      name: taskName,
      status: statusMapping[columnId],
      progress: progressMapping[columnId],
      startDate: today.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0], // duration=1이 되도록 시작일과 같게 설정
    };

    createTaskMutation.mutate(taskData, {
      onSuccess: () => {
        // 입력창 초기화 및 닫기
        setNewTaskInputs((prev) => ({ ...prev, [columnId]: '' }));
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

  // 하위 작업 완료 상태 토글 (API 연동)
  const toggleSubtaskCompletion = (
    subtaskId: number,
    currentStatus: string,
    subtaskName: string,
    parentTaskId: number
  ) => {
    const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    const newProgress = newStatus === 'DONE' ? 100 : 0;

    console.log('📝 [하위 작업 상태 변경]', {
      subtaskId,
      subtaskName,
      oldStatus: currentStatus,
      newStatus,
      newProgress,
      parentTaskId,
    });

    updateTaskMutation.mutate(
      {
        taskId: subtaskId,
        updates: {
          status: newStatus,
          progress: newProgress,
        },
      },
      {
        onSuccess: () => {
          console.log('✅ [하위 작업 상태 변경 성공]', { subtaskId, subtaskName, newStatus });

          // 상위 작업의 진행률 자동 업데이트
          const allSubtasks = getSubtasks(tasks, parentTaskId);

          // 현재 변경된 하위 작업의 상태를 반영하여 계산
          const updatedSubtasks = allSubtasks.map((s) =>
            s.id === subtaskId ? { ...s, status: newStatus, progress: newProgress } : s
          );

          const parentProgress = calculateProgressFromSubtasks(updatedSubtasks as SvarTask[]);

          console.log('📊 [상위 작업 진행률 업데이트]', {
            parentTaskId,
            totalSubtasks: allSubtasks.length,
            completedSubtasks: updatedSubtasks.filter((s: any) => s.status === 'DONE').length,
            newProgress: parentProgress,
          });

          // 상위 작업 진행률 업데이트
          updateTaskMutation.mutate({
            taskId: parentTaskId,
            updates: {
              progress: parentProgress,
            },
          });
        },
        onError: (err) => {
          console.error('❌ [하위 작업 상태 변경 실패]', err);
          toast({
            title: '하위 작업 업데이트 실패',
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
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

  // 하위 작업 상태 아이콘 생성
  const getSubtaskStatusIcons = (subtasks: SvarTask[]) => {
    return subtasks.map((subtask) => {
      const progress = subtask.progress || 0;
      if (progress === 100) return '●'; // 완료
      if (progress > 0) return '◐'; // 진행중
      return '○'; // 미완료
    });
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
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => {
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setShowNewTaskInput((prev) => ({
                              ...prev,
                              [column.id]: !prev[column.id],
                            }))
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* 새 작업 추가 입력창 */}
                      {showNewTaskInput[column.id] && (
                        <div className="mb-3 space-y-2">
                          <Input
                            placeholder="작업 이름 입력..."
                            value={newTaskInputs[column.id]}
                            onChange={(e) =>
                              setNewTaskInputs((prev) => ({
                                ...prev,
                                [column.id]: e.target.value,
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
                                setNewTaskInputs((prev) => ({ ...prev, [column.id]: '' }));
                              }
                            }}
                            autoFocus
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
                                setNewTaskInputs((prev) => ({ ...prev, [column.id]: '' }));
                              }}
                            >
                              취소
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* 작업 카드들 */}
                      <div className="space-y-3">
                        {columnTasks.map((task: SvarTask, index: number) => {
                          const subtasks = getSubtasks(tasks, task.id);

                          return (
                            <Draggable
                              key={`${column.id}-${task.id}`}
                              draggableId={String(task.id)}
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
                                      {(task as any).assignee && (
                                        <div className="flex items-center space-x-2">
                                          <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-xs">
                                              {getAssigneeInitials((task as any).assignee)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="text-xs text-muted-foreground">
                                            {(task as any).assignee}
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

                                      {/* 하위 작업 체크리스트 (Popover) - API 연동 */}
                                      {subtasks.length > 0 && (
                                        <div className="pt-2 border-t border-border">
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-2 w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                                              >
                                                <ListChecks className="h-3.5 w-3.5" />
                                                <span>
                                                  {
                                                    subtasks.filter(
                                                      (s) => (s.progress || 0) === 100
                                                    ).length
                                                  }
                                                  /{subtasks.length} 완료
                                                </span>
                                                <span className="flex gap-0.5 ml-auto">
                                                  {getSubtaskStatusIcons(subtasks).map(
                                                    (icon, idx) => (
                                                      <span key={idx} className="text-xs">
                                                        {icon}
                                                      </span>
                                                    )
                                                  )}
                                                </span>
                                              </button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                              className="w-80 p-3"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <div className="space-y-2">
                                                <h6 className="font-medium text-sm mb-3">
                                                  하위 작업
                                                </h6>
                                                {subtasks.map((subtask) => (
                                                  <div
                                                    key={subtask.id}
                                                    className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                                                  >
                                                    <Checkbox
                                                      checked={(subtask as any).status === 'DONE'}
                                                      onCheckedChange={() =>
                                                        toggleSubtaskCompletion(
                                                          subtask.id as number,
                                                          (subtask as any).status,
                                                          subtask.text ?? '이름 없는 하위 작업',
                                                          task.id as number
                                                        )
                                                      }
                                                      className="mt-0.5"
                                                    />
                                                    <div className="flex-1 space-y-1">
                                                      <p
                                                        className={`text-sm ${
                                                          (subtask as any).status === 'DONE'
                                                            ? 'line-through text-muted-foreground'
                                                            : ''
                                                        }`}
                                                      >
                                                        {subtask.text}
                                                      </p>
                                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>
                                                          {(subtask as any).assignee || '미배정'}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{subtask.progress || 0}%</span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </PopoverContent>
                                          </Popover>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </Draggable>
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
    </div>
  );
}
