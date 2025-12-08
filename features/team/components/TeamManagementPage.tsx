'use client';

import { TeamManagementSkeleton } from '@/features/team/skeletons/TeamManagementSkeleton';
import { apiService } from '@/shared/lib/apiService';
import type { TeamMember, UserRole } from '@/shared/lib/apiTypes';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
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
import { InviteMemberDialog } from './InviteMemberDialog';
import { TeamStatsCards } from './TeamStatsCards';

interface TeamManagementPageProps {
  projectId: string;
  onBack: () => void;
}

export function TeamManagementPage({ projectId, onBack }: TeamManagementPageProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTeamMembers();
  }, [projectId]);

  const loadTeamMembers = async () => {
    setIsLoading(true);
    try {
      const members = await apiService.getTeamMembers(projectId);
      setTeamMembers(members);
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 팀원 목록 새로고침 (초대 성공 시 호출)
  const handleInviteSuccess = () => {
    loadTeamMembers();
  };

  const handleUpdateRole = async (memberId: string, newRole: UserRole) => {
    setIsLoading(true);
    try {
      await apiService.updateTeamMemberRole(projectId, memberId, newRole);
      await loadTeamMembers();
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('정말로 이 팀원을 제거하시겠습니까?')) return;

    setIsLoading(true);
    try {
      await apiService.removeTeamMember(projectId, memberId);
      await loadTeamMembers();
    } catch (error) {
      console.error('Failed to remove member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'member':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      // case "owner":
      // return <Crown className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      // case "owner":
      // return "소유자";
      case 'admin':
        return '관리자';
      case 'member':
        return '멤버';
      case 'viewer':
        return '뷰어';
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
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={member.avatar || '/placeholder.svg'}
                              alt={member.name}
                            />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                          {getRoleIcon(member.role)}
                          {getRoleLabel(member.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {member.role !== 'owner' && (
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
                                onClick={() => handleUpdateRole(member.id, 'admin')}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                관리자로 변경
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateRole(member.id, 'member')}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                멤버로 변경
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                팀에서 제거
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
