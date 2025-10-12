"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserPlus, MoreVertical, Mail, Shield, Trash2, Crown } from "lucide-react"
import { TeamManagementSkeleton } from "@/components/skeletons/team-management-skeleton"
import { apiService } from "@/lib/api-service"
import type { TeamMember, UserRole } from "@/lib/api-types"

interface TeamManagementPageProps {
  projectId: string
  onBack: () => void
}

export function TeamManagementPage({ projectId, onBack }: TeamManagementPageProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<UserRole>("member")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadTeamMembers()
  }, [projectId])

  const loadTeamMembers = async () => {
    setIsLoading(true)
    try {
      const members = await apiService.getTeamMembers(projectId)
      setTeamMembers(members)
    } catch (error) {
      console.error("Failed to load team members:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMember = async () => {
    if (!inviteEmail) return

    setIsLoading(true)
    try {
      await apiService.inviteTeamMember(projectId, inviteEmail, inviteRole)
      setIsInviteDialogOpen(false)
      setInviteEmail("")
      setInviteRole("member")
      await loadTeamMembers()
    } catch (error) {
      console.error("Failed to invite member:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: UserRole) => {
    setIsLoading(true)
    try {
      await apiService.updateTeamMemberRole(projectId, memberId, newRole)
      await loadTeamMembers()
    } catch (error) {
      console.error("Failed to update role:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("정말로 이 팀원을 제거하시겠습니까?")) return

    setIsLoading(true)
    try {
      await apiService.removeTeamMember(projectId, memberId)
      await loadTeamMembers()
    } catch (error) {
      console.error("Failed to remove member:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "owner":
        return "default"
      case "admin":
        return "secondary"
      case "member":
        return "outline"
      default:
        return "outline"
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3" />
      case "admin":
        return <Shield className="h-3 w-3" />
      default:
        return null
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "owner":
        return "소유자"
      case "admin":
        return "관리자"
      case "member":
        return "멤버"
      default:
        return role
    }
  }

  if (isLoading && teamMembers.length === 0) {
    return <TeamManagementSkeleton />
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
              <p className="text-sm text-muted-foreground">프로젝트 팀원을 관리하고 역할을 설정하세요</p>
            </div>
          </div>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
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
                  <Label htmlFor="email">이메일 주소</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">역할</Label>
                  <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as UserRole)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">멤버</SelectItem>
                      <SelectItem value="admin">관리자</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleInviteMember} disabled={isLoading || !inviteEmail}>
                  초대 보내기
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Team Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">전체 팀원</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMembers.length}명</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">관리자</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {teamMembers.filter((m) => m.role === "admin" || m.role === "owner").length}명
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">활성 멤버</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMembers.filter((m) => m.status === "active").length}명</div>
              </CardContent>
            </Card>
          </div>

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
                    <TableHead>상태</TableHead>
                    <TableHead>참여일</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
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
                      <TableCell>
                        <Badge variant={member.status === "active" ? "default" : "secondary"}>
                          {member.status === "active" ? "활성" : "대기중"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(member.joinedAt).toLocaleDateString("ko-KR")}</TableCell>
                      <TableCell className="text-right">
                        {member.role !== "owner" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>작업</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "admin")}>
                                <Shield className="h-4 w-4 mr-2" />
                                관리자로 변경
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "member")}>
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
  )
}
