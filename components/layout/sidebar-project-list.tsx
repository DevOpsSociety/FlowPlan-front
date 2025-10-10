"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Project } from "@/lib/mock-data"

interface SidebarProjectListProps {
  collapsed: boolean
  projects: Project[]
  currentProjectId: string | null
}

export function SidebarProjectList({ collapsed, projects, currentProjectId }: SidebarProjectListProps) {
  const [showProjectList, setShowProjectList] = useState(false)

  if (collapsed) return null

  return (
    <div className="border-b border-sidebar-border">
      <Button
        variant="ghost"
        onClick={() => setShowProjectList(!showProjectList)}
        className="w-full justify-between h-10 px-4"
      >
        <span className="text-sm">프로젝트</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", showProjectList && "rotate-180")} />
      </Button>
      {showProjectList && (
        <div className="max-h-48 overflow-y-auto">
          {projects.slice(0, 5).map((project) => (
            <Link key={project.id} href={`/project/${project.id}`}>
              <Button
                variant="ghost"
                className={cn("w-full justify-start h-8 px-6 text-xs", currentProjectId === project.id && "bg-accent")}
              >
                <div className="truncate" title={project.name}>
                  {project.name}
                </div>
              </Button>
            </Link>
          ))}
          {projects.length > 5 && (
            <Link href="/projects">
              <Button variant="ghost" className="w-full justify-start h-8 px-6 text-xs text-muted-foreground">
                더 보기...
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
