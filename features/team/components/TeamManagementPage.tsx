'use client';

import { TeamManagementSkeleton } from '@/features/team/skeletons/TeamManagementSkeleton';
import { fetchProjectMembers, updateMemberRole } from '@/shared/api/memberApi';
import type { ProjectMemberDto, ProjectMemberRole } from '@/shared/api/memberTypes';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/DropdownMenu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Mail, MoreVertical, Shield, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { InviteMemberDialog } from './InviteMemberDialog';
import { TeamStatsCards } from './TeamStatsCards';

interface TeamManagementPageProps {
  projectId: string;
  onBack: () => void;
}

export function TeamManagementPage({ projectId, onBack }: TeamManagementPageProps) {
  const [teamMembers, setTeamMembers] = useState<ProjectMemberDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    loadTeamMembers();
  }, [projectId]);

  const loadTeamMembers = async () => {
    setIsLoading(true);
    try {
      const members = await fetchProjectMembers(projectId);
      setTeamMembers(members);

      // 현재 사용자의 역할 확인
      const currentUserEmail = getCurrentUserEmail();
      if (currentUserEmail) {
        const currentMember = members.find((m) => m.userEmail === currentUserEmail);
        setCurrentUserRole(currentMember?.role || null);
      }
    } catch (error) {
      console.error('Failed to load team members:', error);
      toast.error('팀원 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * localStorage에서 현재 로그인한 사용자의 이메일 가져오기
   */
  const getCurrentUserEmail = (): string | null => {
    if (typeof window === 'undefined') return null;

    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.email || null;
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
    }
    return null;
  };

  // 팀원 목록 새로고침 (초대 성공 시 호출)
  const handleInviteSuccess = () => {
    loadTeamMembers();
  };

  /**
   * 팀원 역할 변경 핸들러
   */
  const handleUpdateRole = async (memberId: number, newRole: ProjectMemberRole) => {
    setIsLoading(true);
    try {
      await updateMemberRole(projectId, memberId, newRole);
      toast.success('역할이 변경되었습니다');
      await loadTeamMembers();
    } catch (error) {
      console.error('Failed to update role:', error);
      const message = error instanceof Error ? error.message : '역할 변경에 실패했습니다';
      toast.error('역할 변경 실패', {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: 팀원 제거 API 연동 (3차 작업)
  // const handleRemoveMember = async (memberId: number) => {
  //   if (!confirm('정말로 이 팀원을 제거하시겠습니까?')) return;
  //
  //   setIsLoading(true);
  //   try {
  //     await removeMember(projectId, memberId);
  //     await loadTeamMembers();
  //     toast.success('팀원이 제거되었습니다');
  //   } catch (error) {
  //     console.error('Failed to remove member:', error);
  //     toast.error('팀원 제거에 실패했습니다');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'default';
      case 'MEMBER':
        return 'outline';
      case 'VIEWER':
        return 'secondary';
      case 'PENDING':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Shield className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER':
        return '관리자';
      case 'EDITOR':
        return '멤버';
      case 'VIEWER':
        return '뷰어';
      case 'PENDING':
        return '승인 대기';
      default:
        return role;
    }
  };

  if (isLoading && teamMembers.length === 0) {
    return <TeamManagementSkeleton />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              ← 뒤로가기
            </Button>
            <div>
              <h1 className="text-2xl font-bold">팀 관리</h1>
              <p className="text-sm text-muted-foreground">
                프로젝트 팀원을 관리하고 역할을 설정하세요
              </p>
            </div>
          </div>
          <InviteMemberDialog projectId={projectId} onSuccess={handleInviteSuccess} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Team Overview */}
          <TeamStatsCards teamMembers={teamMembers} />

          {/* Team Members Table */}
          <Card>
            <CardHeader>
              <CardTitle>팀원 목록</CardTitle>
              <CardDescription>프로젝트에 참여 중인 모든 팀원을 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>팀원</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.memberId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{member.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.userName}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{member.userEmail}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                          {getRoleIcon(member.role)}
                          {getRoleLabel(member.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {/* OWNER만 역할 변경/제거 UI 표시 (본인 제외) */}
                        {currentUserRole === 'OWNER' &&
                          member.userEmail !== getCurrentUserEmail() && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>작업</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(member.memberId, 'OWNER')}
                                  disabled={member.role === 'OWNER'}
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  관리자로 변경
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(member.memberId, 'EDITOR')}
                                  disabled={member.role === 'EDITOR'}
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  멤버로 변경
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(member.memberId, 'VIEWER')}
                                  disabled={member.role === 'VIEWER'}
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  뷰어로 변경
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem disabled className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  팀에서 제거 (추후 구현)
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
