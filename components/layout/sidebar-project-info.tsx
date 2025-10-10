import type { Project } from "@/lib/mock-data"

interface SidebarProjectInfoProps {
  collapsed: boolean
  project?: Project
}

export function SidebarProjectInfo({ collapsed, project }: SidebarProjectInfoProps) {
  if (collapsed || !project) return null

  return (
    <div className="p-4 border-b border-sidebar-border">
      <div className="text-xs text-muted-foreground mb-2">현재 프로젝트</div>
      <div className="text-sm font-medium text-foreground truncate" title={project.name}>
        {project.name}
      </div>
      <div className="text-xs text-muted-foreground mt-1">진행률: {project.progress}%</div>
    </div>
  )
}
