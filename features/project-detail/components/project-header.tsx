"use client"

import { Save, Download, Users } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { useToast } from "@/shared/hooks/use-toast"
import { getCurrentProject, saveProject, type StoredProject } from "@/shared/lib/storage"
import type { HierarchicalWBSTask } from "@/shared/lib/mock-data"

interface ProjectHeaderProps {
  project: any
  wbsTasks: HierarchicalWBSTask[]
  onShowTeam?: () => void
}

export function ProjectHeader({ project, wbsTasks, onShowTeam }: ProjectHeaderProps) {
  const { toast } = useToast()

  const handleSaveProject = () => {
    try {
      const currentProject = getCurrentProject()
      if (currentProject) {
        const updatedProject: StoredProject = {
          ...currentProject,
          wbsTasks,
          updatedAt: new Date().toISOString(),
        }
        saveProject(updatedProject)

        toast({
          title: "프로젝트가 저장되었습니다",
          description: "모든 변경사항이 로컬 저장소에 저장되었습니다.",
        })
      } else {
        const newProject: StoredProject = {
          id: `project-${Date.now()}`,
          title: project.title || "새 프로젝트",
          description: project.description || "",
          teamSize: project.teamSize || 1,
          duration: project.duration || 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          wbsTasks,
        }
        saveProject(newProject)

        toast({
          title: "새 프로젝트가 생성되었습니다",
          description: "프로젝트가 로컬 저장소에 저장되었습니다.",
        })
      }
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "프로젝트 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleExportProject = () => {
    toast({
      title: "프로젝트를 내보내는 중...",
      description: "Excel 파일로 내보내기가 시작되었습니다.",
    })
  }

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div>
        <h1 className="text-3xl font-bold text-balance">{project.title}</h1>
        <p className="text-muted-foreground mt-1">
          {project.teamSize}명 • {project.duration}개월 예상 • AI 생성됨
        </p>
        <div className="flex items-center mt-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          실시간 동기화 활성화
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {onShowTeam && (
          <Button variant="outline" onClick={onShowTeam}>
            <Users className="h-4 w-4 mr-2" />팀 관리
          </Button>
        )}

        <Button onClick={handleSaveProject}>
          <Save className="h-4 w-4 mr-2" />
          저장
        </Button>
        <Button variant="outline" onClick={handleExportProject}>
          <Download className="h-4 w-4 mr-2" />
          내보내기
        </Button>
      </div>
    </div>
  )
}
