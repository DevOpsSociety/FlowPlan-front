'use client';

import type { TaskFlatDto } from '@/shared/api/taskTypes';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

export interface EditingTask {
  id: number;
  name: string;
  progress: number;
  startDate: string;
  endDate: string;
  assigneeName: string;
  assigneeEmail: string;
}

interface KanbanEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask: EditingTask | null;
  setEditingTask: React.Dispatch<React.SetStateAction<EditingTask | null>>;
  onSave: () => void;
  isSaving: boolean;
  rawTasks: TaskFlatDto[];
}

/**
 * 칸반 작업 수정 다이얼로그
 *
 * - 작업 이름, 담당자, 진행률, 시작일, 종료일 수정
 * - 하위 작업이 있는 경우 진행률 수정 비활성화
 */
export function KanbanEditDialog({
  isOpen,
  onOpenChange,
  editingTask,
  setEditingTask,
  onSave,
  isSaving,
  rawTasks,
}: KanbanEditDialogProps) {
  if (!editingTask) return null;

  // 하위 작업이 있는 부모인지 확인 (진행률 수정 비활성화용)
  const isParentWithChildren =
    !rawTasks.find((t) => t.id === editingTask.id)?.parent &&
    rawTasks.some((t) => t.parent === editingTask.id);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>작업 수정</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* 작업 이름 */}
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

          {/* 담당자 이름 (읽기 전용) */}
          <div className="space-y-2">
            <Label htmlFor="assignee-name">담당자</Label>
            <Input
              id="assignee-name"
              value={editingTask.assigneeName}
              disabled
              className="bg-muted cursor-not-allowed"
            />
          </div>

          {/* 담당자 이메일 */}
          <div className="space-y-2">
            <Label htmlFor="assignee-email">담당자 이메일</Label>
            <Input
              id="assignee-email"
              type="email"
              placeholder="example@email.com"
              value={editingTask.assigneeEmail}
              onChange={(e) =>
                setEditingTask((prev) => (prev ? { ...prev, assigneeEmail: e.target.value } : null))
              }
            />
          </div>

          {/* 진행률 */}
          <div className="space-y-2">
            <Label htmlFor="task-progress">
              진행률 ({editingTask.progress}%)
              {isParentWithChildren && (
                <span className="ml-2 text-xs text-amber-600">(하위 작업이 있어 자동 계산됨)</span>
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
                disabled={isParentWithChildren}
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
                disabled={isParentWithChildren}
                onChange={(e) => {
                  const newProgress = Number(e.target.value);
                  setEditingTask((prev) => (prev ? { ...prev, progress: newProgress } : null));
                }}
                className="w-20"
              />
            </div>
          </div>

          {/* 날짜 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">시작일</Label>
              <Input
                id="start-date"
                type="date"
                value={editingTask.startDate}
                onChange={(e) =>
                  setEditingTask((prev) => (prev ? { ...prev, startDate: e.target.value } : null))
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
