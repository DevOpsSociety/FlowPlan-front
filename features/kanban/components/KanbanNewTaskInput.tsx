'use client';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Plus, X } from 'lucide-react';
import type { KanbanColumnId } from '../config/kanbanConfig';

interface KanbanNewTaskInputProps {
  columnId: KanbanColumnId;
  taskName: string;
  assigneeName: string;
  onTaskNameChange: (value: string) => void;
  onAssigneeChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isCreating: boolean;
}

/**
 * 새 작업 추가 입력 폼
 *
 * - 작업 이름과 담당자 입력
 * - Enter로 추가, Escape로 취소
 */
export function KanbanNewTaskInput({
  taskName,
  assigneeName,
  onTaskNameChange,
  onAssigneeChange,
  onSubmit,
  onCancel,
  isCreating,
}: KanbanNewTaskInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="mb-3 space-y-2">
      <Input
        placeholder="작업 이름 입력..."
        value={taskName}
        onChange={(e) => onTaskNameChange(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        className="mb-2"
      />
      <Input
        placeholder="담당자 이름 입력..."
        value={assigneeName}
        onChange={(e) => onAssigneeChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={onSubmit} disabled={isCreating} className="flex-1">
          <Plus className="h-3 w-3 mr-1" />
          추가
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
