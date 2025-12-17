'use client';

import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useEffect, useState } from 'react';

interface KanbanCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (taskData: { name: string; assigneeEmail: string; parentId?: number }) => void;
  isCreating: boolean;
  parentId?: number;
  parentName?: string;
}

/**
 * 칸반 작업 생성 다이얼로그
 *
 * - 작업 이름과 담당자 이메일 입력
 * - 새 작업은 기본적으로 할일(TODO) 상태로 생성됨
 * - parentId가 있으면 하위 작업으로 생성
 */
export function KanbanCreateDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isCreating,
  parentId,
  parentName,
}: KanbanCreateDialogProps) {
  const [name, setName] = useState('');
  const [assigneeEmail, setAssigneeEmail] = useState('');

  // 다이얼로그가 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setName('');
      setAssigneeEmail('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      assigneeEmail: assigneeEmail.trim(),
      ...(parentId && { parentId }),
    });
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setName('');
      setAssigneeEmail('');
    }
    onOpenChange(open);
  };

  const isSubtask = !!parentId;
  const title = isSubtask ? `하위 작업 추가` : '새 작업 추가';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {isSubtask && parentName && (
            <p className="text-sm text-muted-foreground">상위 작업: {parentName}</p>
          )}
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* 작업 이름 */}
          <div className="space-y-2">
            <Label htmlFor="new-task-name">작업 이름 *</Label>
            <Input
              id="new-task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isSubtask ? '하위 작업 이름을 입력하세요' : '작업 이름을 입력하세요'}
              autoFocus
            />
          </div>

          {/* 담당자 이메일 */}
          <div className="space-y-2">
            <Label htmlFor="new-assignee-email">담당자 이메일</Label>
            <Input
              id="new-assignee-email"
              type="email"
              value={assigneeEmail}
              onChange={(e) => setAssigneeEmail(e.target.value)}
              placeholder="example@email.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating || !name.trim()}>
            {isCreating ? '생성 중...' : '추가'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
