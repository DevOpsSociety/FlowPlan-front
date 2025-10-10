"use client"

import { useState, useEffect } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { SidebarToggle } from "./sidebar-toggle"
import { SidebarProjectInfo } from "./sidebar-project-info"
import { SidebarProjectList } from "./sidebar-project-list"
import { SidebarNav } from "./sidebar-nav"
import { SidebarSettings } from "./sidebar-settings"
import { getProjects } from "@/lib/storage"
import { mockProjects, type Project } from "@/lib/mock-data"

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)

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
        progress: 0,
        teamMembers: [],
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    ]
    setProjects(combinedProjects)

    const projectId = localStorage.getItem("flowplan_current_project")
    setCurrentProjectId(projectId)
  }, [])

  const currentProject = projects.find((p) => p.id === currentProjectId)

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="flex flex-col h-full">
          <SidebarToggle collapsed={collapsed} onToggle={onToggleCollapse} />
          <SidebarProjectInfo collapsed={collapsed} project={currentProject} />
          <SidebarProjectList collapsed={collapsed} projects={projects} currentProjectId={currentProjectId} />
          <SidebarNav collapsed={collapsed} />
          <SidebarSettings collapsed={collapsed} />
        </div>
      </aside>
    </TooltipProvider>
  )
}
