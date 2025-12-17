'use client';

import type { TaskFlatDto } from '@/shared/api/taskTypes';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Calendar, ChevronDown, ChevronRight, Clock, Pencil, Plus, Trash2 } from 'lucide-react';

interface KanbanTaskCardProps {
  task: TaskFlatDto;
  onEdit: (task: TaskFlatDto) => void;
  onDelete: (taskId: number, taskName: string) => void;
  onAddSubtask?: (parentId: number) => void;
  isDragging?: boolean;
  // 부모 작업 전용 props
  hasSubtasks?: boolean;
  isExpanded?: boolean;
  subtaskCount?: number;
  onToggleExpand?: () => void;
  // 스타일 variant
  variant?: 'parent' | 'subtask';
}

/**
 * 칸반 작업 카드
 *
 * - 작업 정보 표시 (이름, 진행률, 담당자, 날짜)
 * - 수정/삭제 버튼
 * - 하위 작업 펼치기/접기 (부모 작업만)
 */
export function KanbanTaskCard({
  task,
  onEdit,
  onDelete,
  onAddSubtask,
  isDragging = false,
  hasSubtasks = false,
  isExpanded = false,
  subtaskCount = 0,
  onToggleExpand,
  variant = 'parent',
}: KanbanTaskCardProps) {
  const getAssigneeInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const rotateClass = variant === 'parent' ? 'rotate-2' : 'rotate-1';

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow bg-background ${
        isDragging ? `shadow-lg ${rotateClass}` : ''
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h5 className="font-medium text-sm leading-tight line-clamp-2 flex-1">{task.name}</h5>
          <div className="flex gap-1">
            {/* 상위 작업일 때만 추가 버튼 표시 */}
            {variant === 'parent' && onAddSubtask && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSubtask(task.id);
                }}
                title="하위 작업 추가"
              >
                <Plus className="h-3 w-3 text-muted-foreground" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
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
                onDelete(task.id, task.name ?? '이름 없는 작업');
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
            <span className="text-xs text-muted-foreground">진행률</span>
            <span className="text-xs font-medium">{task.progress || 0}%</span>
          </div>
          <Progress value={task.progress || 0} className="h-1.5" />
        </div>

        {/* 담당자 */}
        {task.assigneeName && (
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {getAssigneeInitials(task.assigneeName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{task.assigneeName}</span>
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

        {/* 하위 작업 펼치기/접기 버튼 (부모 작업만) */}
        {hasSubtasks && onToggleExpand && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 h-7 text-xs hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
          >
            {isExpanded ? (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                하위 작업 접기 ({subtaskCount})
              </>
            ) : (
              <>
                <ChevronRight className="h-3 w-3 mr-1" />
                하위 작업 펼치기 ({subtaskCount})
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
