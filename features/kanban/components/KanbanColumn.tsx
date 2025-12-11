'use client';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import type { ITask as SvarTask } from '@svar-ui/react-gantt';
import { Plus } from 'lucide-react';
import type { KanbanColumnId } from '../config/kanbanConfig';
import { getSubtasks } from '../utils/kanbanTransformers';
import { KanbanNewTaskInput } from './KanbanNewTaskInput';
import { KanbanTaskCard } from './KanbanTaskCard';

interface KanbanColumnProps {
  column: {
    id: KanbanColumnId;
    title: string;
    color: string;
  };
  tasks: SvarTask[];
  allTasks: SvarTask[];
  expandedTasks: Set<number>;
  onToggleExpansion: (taskId: number) => void;
  onAddTask: (columnId: KanbanColumnId) => void;
  onEditTask: (task: SvarTask) => void;
  onDeleteTask: (taskId: number, taskName: string) => void;
  // 새 작업 입력 관련
  showNewTaskInput: boolean;
  onToggleNewTaskInput: () => void;
  newTaskName: string;
  newTaskAssignee: string;
  onNewTaskNameChange: (value: string) => void;
  onNewTaskAssigneeChange: (value: string) => void;
  onCancelNewTask: () => void;
  isCreating: boolean;
}

/**
 * 칸반 컬럼 컴포넌트
 *
 * - Droppable 영역으로 드래그앤드롭 지원
 * - 컬럼 헤더, 새 작업 입력, 작업 카드 목록 포함
 */
export function KanbanColumn({
  column,
  tasks,
  allTasks,
  expandedTasks,
  onToggleExpansion,
  onAddTask,
  onEditTask,
  onDeleteTask,
  showNewTaskInput,
  onToggleNewTaskInput,
  newTaskName,
  newTaskAssignee,
  onNewTaskNameChange,
  onNewTaskAssigneeChange,
  onCancelNewTask,
  isCreating,
}: KanbanColumnProps) {
  return (
    <div>
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
                  {tasks.length}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={onToggleNewTaskInput}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* 새 작업 추가 입력창 */}
            {showNewTaskInput && (
              <KanbanNewTaskInput
                columnId={column.id}
                taskName={newTaskName}
                assigneeName={newTaskAssignee}
                onTaskNameChange={onNewTaskNameChange}
                onAssigneeChange={onNewTaskAssigneeChange}
                onSubmit={() => onAddTask(column.id)}
                onCancel={onCancelNewTask}
                isCreating={isCreating}
              />
            )}

            {/* 작업 목록 */}
            <div className="space-y-3">
              {tasks.map((task: SvarTask, index: number) => {
                const subtasks = getSubtasks(allTasks, task.id);
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
                          <KanbanTaskCard
                            task={task}
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                            isDragging={dragSnapshot.isDragging}
                            hasSubtasks={hasSubtasks}
                            isExpanded={isExpanded}
                            subtaskCount={subtasks.length}
                            onToggleExpand={() => onToggleExpansion(Number(task.id))}
                            variant="parent"
                          />
                        </div>
                      )}
                    </Draggable>

                    {/* 하위 작업 카드들 (펼쳤을 때만 표시) */}
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
                                <KanbanTaskCard
                                  task={subtask}
                                  onEdit={onEditTask}
                                  onDelete={onDeleteTask}
                                  isDragging={subDragSnapshot.isDragging}
                                  variant="subtask"
                                />
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
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
}
