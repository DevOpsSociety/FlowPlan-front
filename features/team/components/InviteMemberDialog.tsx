'use client';

import { inviteTeamMember } from '@/shared/api/invitationApi';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface InviteMemberDialogProps {
  projectId: string;
  onSuccess: () => void;
}

/**
 * 팀원 초대 다이얼로그 컴포넌트
 * - 이메일 입력을 통해 팀원 초대
 * - 성공/실패 시 토스트 메시지 표시
 */
export function InviteMemberDialog({ projectId, onSuccess }: InviteMemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error('이메일을 입력하세요');
      return;
    }

    setIsLoading(true);
    try {
      await inviteTeamMember(projectId, { email: email.trim() });
      toast.success('초대 메일을 전송했습니다', {
        description: `${email}로 초대 메일을 보냈습니다.`,
      });
      setIsOpen(false);
      setEmail('');
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : '초대에 실패했습니다';
      toast.error('초대 실패', {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEmail('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          팀원 초대
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>팀원 초대</DialogTitle>
          <DialogDescription>이메일 주소로 새로운 팀원을 초대하세요</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">이메일 주소</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleInvite();
                }
              }}
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            취소
          </Button>
          <Button onClick={handleInvite} disabled={isLoading || !email.trim()}>
            {isLoading ? '전송 중...' : '초대 보내기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
