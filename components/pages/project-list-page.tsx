"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Calendar, Users, MoreVertical, Eye, Edit, Trash2, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockProjects, type Project } from "@/lib/mock-data"
import { getProjects, deleteProject } from "@/lib/storage"

interface ProjectListPageProps {
  onBack: () => void
  onSelectProject?: (project: any) => void
}

export function ProjectListPage({ onBack, onSelectProject }: ProjectListPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const storedProjects = getProjects()
    const combinedProjects = [
      ...mockProjects,
      ...storedProjects.map((p) => ({
        id: p.id,
        name: p.title,
        description: p.description,
        status: "active" as const,
        startDate: p.createdAt.split("T")[0],
        endDate: new Date(Date.now() + p.duration * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        progress: Math.floor(Math.random() * 100), // Random progress for demo
        teamMembers: [`팀원 ${Math.floor(Math.random() * 5) + 1}명`],
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    ]
    setProjects(combinedProjects)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "active":
        return "bg-blue-500"
      case "on-hold":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "완료"
      case "active":
        return "진행중"
      case "on-hold":
        return "보류"
      case "cancelled":
        return "취소"
      default:
        return "알 수 없음"
    }
  }

  const handleDeleteProject = (projectId: string) => {
    if (confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
      deleteProject(projectId)
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="flex items-center gap-4 p-6">
          <div>
            <h1 className="text-2xl font-bold">프로젝트 목록</h1>
            <p className="text-muted-foreground">모든 프로젝트를 관리하고 추적하세요</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 검색 및 필터 */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="프로젝트 이름 또는 설명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="active">진행중</SelectItem>
              <SelectItem value="completed">완료</SelectItem>
              <SelectItem value="on-hold">보류</SelectItem>
              <SelectItem value="cancelled">취소</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 프로젝트 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSelectProject?.(project)}>
                        <Eye className="h-4 w-4 mr-2" />
                        보기
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        편집
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProject(project.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 상태 */}
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(project.status)} text-white`}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>

                {/* 진행률 */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>진행률</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* 프로젝트 정보 */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {project.startDate} ~ {project.endDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{project.teamMembers.length}명 참여</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">검색 결과가 없습니다</p>
              <p>다른 검색어나 필터를 시도해보세요</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
