"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProjectView } from "@/features/project-detail/components/project-view"
import { getProject } from "@/shared/lib/storage"
import { mockProjects, mockProjectTasks } from "@/shared/lib/mock-data"

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [currentProject, setCurrentProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProject()
  }, [projectId, router])

  const loadProject = () => {
    setIsLoading(true)

    // Try to load from stored projects first
    const storedProject = getProject(projectId)
    if (storedProject) {
      setCurrentProject({
        id: storedProject.id,
        title: storedProject.title,
        description: storedProject.description,
        teamSize: storedProject.teamSize,
        duration: storedProject.duration,
        wbsTasks: storedProject.wbsTasks,
      })
      localStorage.setItem("flowplan_current_project", projectId)
      setIsLoading(false)
      return
    }

    // Try to load from mock projects
    const mockProject = mockProjects.find((p) => p.id === projectId)
    if (mockProject) {
      setCurrentProject({
        id: mockProject.id,
        title: mockProject.name,
        description: mockProject.description,
        teamSize: mockProject.teamMembers.length,
        duration: 90,
        wbsTasks: mockProjectTasks[projectId] || [],
      })
      localStorage.setItem("flowplan_current_project", projectId)
      setIsLoading(false)
    } else {
      // Project not found
      router.push("/")
    }
  }

  const handleShowTeam = () => {
    router.push(`/team/${projectId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">프로젝트 로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!currentProject) {
    return null
  }

  return (
    <div className="p-6">
      <ProjectView project={currentProject} onShowTeam={handleShowTeam} />
    </div>
  )
}
