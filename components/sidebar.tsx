"use client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { mockProjects, type Project } from "@/lib/mock-data";
import { getProjects } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, FolderOpen, Menu, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentProjectId?: string | null;
}

export function Sidebar({ collapsed, onToggle, currentProjectId }: SidebarProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectList, setShowProjectList] = useState(false);

  useEffect(() => {
    const storedProjects = getProjects();
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
    ];
    setProjects(combinedProjects);
  }, []);

  const mainMenuItems = [
    {
      icon: Plus,
      label: "새 프로젝트 생성",
      href: "/new-project",
    },
    {
      icon: FolderOpen,
      label: "프로젝트 목록",
      href: "/projects",
    },
  ];

  const settingsItem = {
    icon: Settings,
    label: "설정",
    href: "/settings",
  };

  const currentProject = projects.find((p) => p.id === currentProjectId);

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="flex flex-col h-full">
          {/* 사이드바 토글 버튼 */}
          <div className="p-4 border-b border-sidebar-border">
            <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
              {collapsed ? <Menu className="h-4 w-4" /> : <ChevronRight className="h-4 w-4 rotate-180" />}
            </Button>
          </div>

          {!collapsed && currentProject && (
            <div className="p-4 border-b border-sidebar-border">
              <div className="text-xs text-muted-foreground mb-2">현재 프로젝트</div>
              <div className="text-sm font-medium text-foreground truncate" title={currentProject.name}>
                {currentProject.name}
              </div>
              <div className="text-xs text-muted-foreground mt-1">진행률: {currentProject.progress}%</div>
            </div>
          )}

          {!collapsed && (
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
                        className={cn(
                          "w-full justify-start h-8 px-6 text-xs",
                          currentProjectId === project.id && "bg-accent",
                        )}
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
          )}

          {/* 메인 메뉴 항목들 */}
          <nav className="flex-1 p-4 space-y-2">
            {mainMenuItems.map((item, index) => {
              const Icon = item.icon;

              if (collapsed) {
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                          <Icon className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link key={index} href={item.href}>
                  <Button variant="ghost" className="w-full justify-start h-10">
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={settingsItem.href}>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{settingsItem.label}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link href={settingsItem.href}>
                <Button variant="ghost" className="w-full justify-start h-10">
                  <Settings className="mr-3 h-4 w-4" />
                  {settingsItem.label}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
