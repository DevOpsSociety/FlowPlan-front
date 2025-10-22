'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { ScrollArea } from '@/shared/ui/ScrollArea';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/ui/sheet';
import {
  Calendar,
  User,
  Paperclip,
  Send,
  Download,
  Trash2,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { apiService } from '@/shared/lib/apiService';
import type { Comment, FileAttachment } from '@/shared/lib/apiTypes';
import type { HierarchicalWBSTask } from '@/shared/lib/mockData';
import { useToast } from '@/shared/hooks/useToast';

interface TaskDetailPanelProps {
  task: HierarchicalWBSTask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (taskId: string, updates: Partial<HierarchicalWBSTask>) => void;
}

export function TaskDetailPanel({ task, isOpen, onClose, onUpdate }: TaskDetailPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (task && isOpen) {
      loadComments();
      loadAttachments();
    }
  }, [task, isOpen]);

  const loadComments = async () => {
    if (!task) return;

    setIsLoadingComments(true);
    try {
      const response = await apiService.getComments(task.id);
      if (response.success && response.data) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const loadAttachments = async () => {
    if (!task) return;

    // Mock attachments for now
    setAttachments([]);
  };

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await apiService.addComment(task.id, newComment);
      if (response.success && response.data) {
        setComments([...comments, response.data]);
        setNewComment('');
        toast({
          title: '댓글이 추가되었습니다',
          description: '새 댓글이 성공적으로 등록되었습니다.',
        });
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast({
        title: '댓글 추가 실패',
        description: '댓글을 추가하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !task) return;

    setIsUploadingFile(true);
    try {
      const response = await apiService.uploadFile(file, task.id);
      if (response.success && response.data) {
        setAttachments([...attachments, response.data]);
        toast({
          title: '파일이 업로드되었습니다',
          description: `${file.name}이(가) 성공적으로 업로드되었습니다.`,
        });
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast({
        title: '파일 업로드 실패',
        description: '파일을 업로드하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingFile(false);
      event.target.value = '';
    }
  };

  const handleDeleteAttachment = async (fileId: string) => {
    if (!confirm('이 파일을 삭제하시겠습니까?')) return;

    try {
      await apiService.deleteFile(fileId);
      setAttachments(attachments.filter((a) => a.id !== fileId));
      toast({
        title: '파일이 삭제되었습니다',
        description: '파일이 성공적으로 삭제되었습니다.',
      });
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast({
        title: '파일 삭제 실패',
        description: '파일을 삭제하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!task) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">{task.name}</SheetTitle>
          <SheetDescription>작업 상세 정보 및 협업</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Task Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  담당자
                </Label>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{task.assignee.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{task.assignee}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">상태</Label>
                <Badge
                  variant={
                    task.status === 'done'
                      ? 'default'
                      : task.status === 'in-progress'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {task.status === 'done'
                    ? '완료'
                    : task.status === 'in-progress'
                      ? '진행중'
                      : '대기'}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  시작일
                </Label>
                <p className="text-sm">{formatDate(task.startDate)}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  종료일
                </Label>
                <p className="text-sm">{formatDate(task.endDate)}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">기간</Label>
                <p className="text-sm">{task.duration}일</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">진행률</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{task.progress}%</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* File Attachments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                첨부 파일 ({attachments.length})
              </Label>
              <Button variant="outline" size="sm" disabled={isUploadingFile} asChild>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploadingFile}
                  />
                  {isUploadingFile ? '업로드 중...' : '파일 추가'}
                </label>
              </Button>
            </div>

            {attachments.length > 0 ? (
              <div className="space-y-2">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.fileSize)} • {formatDate(file.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={file.fileUrl} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAttachment(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                첨부된 파일이 없습니다
              </div>
            )}
          </div>

          <Separator />

          {/* Comments */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              댓글 ({comments.length})
            </Label>

            <ScrollArea className="h-[300px] pr-4">
              {isLoadingComments ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  댓글을 불러오는 중...
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author.avatar || '/placeholder.svg'} />
                          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{comment.author.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleString('ko-KR')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  아직 댓글이 없습니다
                </div>
              )}
            </ScrollArea>

            {/* Add Comment */}
            <div className="space-y-2">
              <Textarea
                placeholder="댓글을 입력하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmittingComment ? '전송 중...' : '댓글 작성'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
