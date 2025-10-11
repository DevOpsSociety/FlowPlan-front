"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Project } from "@/lib/mock-data"

interface SidebarProjectSelectorProps {
  collapsed: boolean
  projects: Project[]
  currentProjectId: string | null
}

export function SidebarProjectSelector({ collapsed, projects, currentProjectId }: SidebarProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const currentProject = projects.find((p) => p.id === currentProjectId)

  if (collapsed) return null

  return (
    <div className="border-b border-sidebar-border">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between h-12 px-4 hover:bg-accent"
      >
        <div className="flex items-center gap-2 min-w-0">
          <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-xs text-muted-foreground">프로젝트</span>
            <span className="text-sm font-medium truncate max-w-[150px]" title={currentProject?.name || "선택 안됨"}>
              {currentProject?.name || "프로젝트를 선택하세요"}
            </span>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="max-h-64 overflow-y-auto bg-sidebar-accent/50">
          {currentProject && (
            <div className="px-4 py-2 border-b border-sidebar-border">
              <div className="text-xs text-muted-foreground mb-1">진행률</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${currentProject.progress}%` }} />
                </div>
                <span className="text-xs font-medium">{currentProject.progress}%</span>
              </div>
            </div>
          )}

          <div className="py-1">
            {projects.slice(0, 5).map((project) => (
              <Link key={project.id} href={`/project/${project.id}`}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-9 px-4 text-sm",
                    currentProjectId === project.id && "bg-accent font-medium",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="truncate" title={project.name}>
                    {project.name}
                  </div>
                </Button>
              </Link>
            ))}
            {projects.length > 5 && (
              <Link href="/projects">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-9 px-4 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  모든 프로젝트 보기 →
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
