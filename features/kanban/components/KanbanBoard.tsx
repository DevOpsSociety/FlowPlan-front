'use client';

import type { Task } from '@/shared/lib/apiTypes';
import { mockHierarchicalTasks } from '@/shared/lib/mockGanttData';
import { flattenTasks } from '@/shared/lib/taskAdapters';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Progress } from '@/shared/ui/progress';
import type { DropResult } from '@hello-pangea/dnd';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Calendar, Clock, ListChecks, Save } from 'lucide-react';
import { useState } from 'react';

interface KanbanColumn {
  id: 'todo' | 'in-progress' | 'done';
  title: string;
  color: string;
}

interface KanbanBoardProps {
  projectId: string;
}

// TaskStatus를 칸반 상태로 매핑
const taskStatusToKanbanStatus = (status: string): 'todo' | 'in-progress' | 'done' => {
  const mapping: Record<string, 'todo' | 'in-progress' | 'done'> = {
    할일: 'todo',
    진행중: 'in-progress',
    완료: 'done',
    보류: 'todo', // 보류는 할일로 매핑
  };
  return mapping[status] || 'todo';
};

// 칸반 상태를 TaskStatus로 매핑
const kanbanStatusToTaskStatus = (status: 'todo' | 'in-progress' | 'done'): string => {
  const mapping: Record<'todo' | 'in-progress' | 'done', string> = {
    todo: '할일',
    'in-progress': '진행중',
    done: '완료',
  };
  return mapping[status];
};

// Task 배열을 칸반 컬럼별로 그룹화 (최상위 작업만)
const groupTasksByStatus = (tasks: Task[]) => {
  // subtasks를 제외하고 최상위 작업만 사용
  const topLevelTasks = tasks.filter((t) => t.parent_id === null);

  return {
    todo: topLevelTasks.filter((t) => taskStatusToKanbanStatus(t.status) === 'todo'),
    'in-progress': topLevelTasks.filter(
      (t) => taskStatusToKanbanStatus(t.status) === 'in-progress'
    ),
    done: topLevelTasks.filter((t) => taskStatusToKanbanStatus(t.status) === 'done'),
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

export function KanbanBoard({ projectId: _projectId }: KanbanBoardProps) {
  // 로컬 상태로 관리할 작업 데이터
  const [localTasks, setLocalTasks] = useState<Task[]>(mockHierarchicalTasks);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 칸반 컬럼별로 그룹화
  const kanbanTasks = groupTasksByStatus(localTasks);

  // 드래그앤드롭 핸들러
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // 드롭 위치가 없으면 무시
    if (!destination) return;

    // 같은 위치로 드롭하면 무시
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // 상태 변경 - 로컬 상태 업데이트
    const newStatus = kanbanStatusToTaskStatus(
      destination.droppableId as 'todo' | 'in-progress' | 'done'
    );

    console.log(`작업 상태 변경 (미저장): ${draggableId} -> ${newStatus}`);

    // 재귀적으로 작업 업데이트
    const updateTaskRecursively = (tasks: Task[]): Task[] => {
      return tasks.map((task) => {
        if (task.task_id === draggableId) {
          // 상태에 따른 자동 진행률 업데이트
          let updatedProgress = task.progress;
          if (newStatus === '완료') {
            updatedProgress = 100;
          } else if (newStatus === '진행중' && task.progress === 0) {
            updatedProgress = 10;
          } else if (newStatus === '할일') {
            updatedProgress = 0;
          }

          return { ...task, status: newStatus as Task['status'], progress: updatedProgress };
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

    setLocalTasks((prev) => updateTaskRecursively(prev));
    setHasUnsavedChanges(true); // 미저장 상태로 표시
  };

  // 저장 핸들러
  const handleSaveKanban = () => {
    console.log('=== 칸반보드 저장 시작 ===');
    console.log('저장할 작업 데이터:', JSON.stringify(localTasks, null, 2));

    // 각 상태별 작업 개수 출력
    const statusCounts = {
      할일: kanbanTasks.todo.length,
      진행중: kanbanTasks['in-progress'].length,
      완료: kanbanTasks.done.length,
    };
    console.log('상태별 작업 개수:', statusCounts);

    // 전체 작업 평균 진행률 계산
    const allTasks = flattenTasks(localTasks);
    const avgProgress =
      allTasks.length > 0
        ? (allTasks.reduce((sum, task) => sum + task.progress, 0) / allTasks.length).toFixed(1)
        : 0;
    console.log(`전체 작업 개수: ${allTasks.length}개`);
    console.log(`평균 진행률: ${avgProgress}%`);

    // 실제로는 여기서 saveProject 호출 (추후 구현)
    // const project = getCurrentProject();
    // if (project) {
    //   saveProject({
    //     ...project,
    //     wbsTasks: localTasks,
    //     updatedAt: new Date().toISOString(),
    //   });
    // }

    setHasUnsavedChanges(false);
    console.log('=== 칸반보드 저장 완료 ===');
  };

  const getAssigneeInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 하위 작업 상태 아이콘 생성
  const getSubtaskStatusIcons = (subtasks: Task[]) => {
    return subtasks.map((subtask) => {
      if (subtask.progress === 100) return '●'; // 완료
      if (subtask.progress > 0) return '◐'; // 진행중
      return '○'; // 미완료
    });
  };

  // 하위 작업 완료 상태 토글
  const toggleSubtaskCompletion = (parentTaskId: string, subtaskId: string) => {
    setLocalTasks((prev) => {
      return prev.map((task) => {
        if (task.task_id === parentTaskId && task.subtasks) {
          const updatedSubtasks = task.subtasks.map((subtask) => {
            if (subtask.task_id === subtaskId) {
              // 완료 상태 토글: 100% <-> 0%
              const newProgress = subtask.progress === 100 ? 0 : 100;
              const newStatus = newProgress === 100 ? '완료' : '할일';
              return { ...subtask, progress: newProgress, status: newStatus as Task['status'] };
            }
            return subtask;
          });

          // 부모 작업의 진행률 재계산
          const completedCount = updatedSubtasks.filter((s) => s.progress === 100).length;
          const parentProgress = Math.round((completedCount / updatedSubtasks.length) * 100);

          return { ...task, subtasks: updatedSubtasks, progress: parentProgress };
        }
        return task;
      });
    });
    setHasUnsavedChanges(true);
  };

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
          <Button
            onClick={handleSaveKanban}
            variant={hasUnsavedChanges ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            저장{hasUnsavedChanges && ' *'}
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
                        {columnTasks.map((task: Task, index: number) => (
                          <Draggable
                            key={`${column.id}-${task.task_id}`}
                            draggableId={String(task.task_id)}
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
                                        {task.name}
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
                                          {task.progress}%
                                        </span>
                                      </div>
                                      <Progress value={task.progress} className="h-1.5" />
                                    </div>

                                    {/* 담당자 */}
                                    <div className="flex items-center space-x-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                          {getAssigneeInitials(task.assignee)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs text-muted-foreground">
                                        {task.assignee}
                                      </span>
                                    </div>

                                    {/* 날짜 정보 */}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                      <div className="flex items-center space-x-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                          {formatDate(task.start_date)} ~{' '}
                                          {formatDate(task.end_date)}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{task.duration_days}일</span>
                                      </div>
                                    </div>

                                    {/* 하위 작업 체크리스트 (Popover) */}
                                    {task.subtasks && task.subtasks.length > 0 && (
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
                                                  task.subtasks.filter((s) => s.progress === 100)
                                                    .length
                                                }
                                                /{task.subtasks.length} 완료
                                              </span>
                                              <span className="flex gap-0.5 ml-auto">
                                                {getSubtaskStatusIcons(task.subtasks).map(
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
                                              {task.subtasks.map((subtask) => (
                                                <div
                                                  key={subtask.task_id}
                                                  className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                                                >
                                                  <Checkbox
                                                    checked={subtask.progress === 100}
                                                    onCheckedChange={() =>
                                                      toggleSubtaskCompletion(
                                                        task.task_id,
                                                        subtask.task_id
                                                      )
                                                    }
                                                    className="mt-0.5"
                                                  />
                                                  <div className="flex-1 space-y-1">
                                                    <p
                                                      className={`text-sm ${
                                                        subtask.progress === 100
                                                          ? 'line-through text-muted-foreground'
                                                          : ''
                                                      }`}
                                                    >
                                                      {subtask.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                      <span>{subtask.assignee}</span>
                                                      <span>•</span>
                                                      <span>{subtask.progress}%</span>
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
