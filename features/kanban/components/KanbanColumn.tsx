'use client';

import type { TaskFlatDto } from '@/shared/api/taskTypes';
import { Badge } from '@/shared/ui/badge';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import type { KanbanColumnId } from '../config/kanbanConfig';
import { getSubtasks } from '../utils/kanbanTransformers';
import { KanbanTaskCard } from './KanbanTaskCard';

interface KanbanColumnProps {
  column: {
    id: KanbanColumnId;
    title: string;
    color: string;
  };
  tasks: TaskFlatDto[];
  allTasks: TaskFlatDto[];
  expandedTasks: Set<number>;
  onToggleExpansion: (taskId: number) => void;
  onEditTask: (task: TaskFlatDto) => void;
  onDeleteTask: (taskId: number, taskName: string) => void;
  onAddSubtask: (parentId: number) => void;
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
  onEditTask,
  onDeleteTask,
  onAddSubtask,
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
            <div className="flex items-center mb-4">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-foreground">{column.title}</h4>
                <Badge variant="secondary" className="text-xs">
                  {tasks.length}
                </Badge>
              </div>
            </div>

            {/* 작업 목록 */}
            <div className="space-y-3">
              {tasks.map((task: TaskFlatDto, index: number) => {
                const subtasks = getSubtasks(allTasks, task.id);
                const hasSubtasks = subtasks.length > 0;
                const isExpanded = expandedTasks.has(task.id);

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
                            onAddSubtask={onAddSubtask}
                            isDragging={dragSnapshot.isDragging}
                            hasSubtasks={hasSubtasks}
                            isExpanded={isExpanded}
                            subtaskCount={subtasks.length}
                            onToggleExpand={() => onToggleExpansion(task.id)}
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
