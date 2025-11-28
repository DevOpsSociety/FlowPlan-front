'use client';

import { useTasks, useUpdateTask } from '@/shared/hooks/queries/useTaskQuery';
import { useToast } from '@/shared/hooks/useToast';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import type { DropResult } from '@hello-pangea/dnd';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import type { ITask as SvarTask } from '@svar-ui/react-gantt';
import { Calendar, Clock, RefreshCw } from 'lucide-react';
import { useParams } from 'next/navigation';
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

  // API에서 작업 목록 조회 (SVAR 형식으로 변환됨)
  const { data: tasks = [], isLoading, error, refetch } = useTasks(projectId);

  // Mutations
  const updateTaskMutation = useUpdateTask(projectId);

  // 칸반 컬럼별로 그룹화
  const kanbanTasks = groupTasksByStatus(tasks);

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

    // 상태에 따른 자동 진행률 계산
    let newProgress: number | undefined;
    if (newKanbanStatus === 'done') {
      newProgress = 100;
    } else if (newKanbanStatus === 'in-progress') {
      newProgress = 50;
    } else if (newKanbanStatus === 'todo') {
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

  const getAssigneeInitials = (name: string) => {
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
                      </div>

                      {/* 작업 카드들 */}
                      <div className="space-y-3">
                        {columnTasks.map((task: SvarTask, index: number) => (
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
                                      <h5 className="font-medium text-sm leading-tight line-clamp-2">
                                        {task.text}
                                      </h5>
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
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {/* 빈 상태 */}
                        {columnTasks.length === 0 && (
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
