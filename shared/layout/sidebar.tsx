'use client';

import { mockProjects, type Project } from '@/shared/lib/mockData';
import { getProjects } from '@/shared/lib/storage';
import { cn } from '@/shared/lib/utils';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { useEffect, useState } from 'react';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNav } from './SidebarNav';
import { SidebarProfile } from './SidebarProfile';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  useEffect(() => {
    const storedProjects = getProjects();
    const combinedProjects = [
      ...mockProjects,
      ...storedProjects.map((p) => ({
        id: p.id,
        name: p.title,
        description: p.description,
        status: 'active' as const,
        startDate: p.createdAt.split('T')[0],
        endDate: new Date(Date.now() + p.duration * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        progress: 0,
        teamMembers: [],
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    ];
    setProjects(combinedProjects);

    const projectId = localStorage.getItem('flowplan_current_project');
    setCurrentProjectId(projectId);
  }, []);

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          <SidebarHeader collapsed={collapsed} onToggle={onToggleCollapse} />
          {/* <SidebarProjectSelector
            collapsed={collapsed}
            projects={projects}
            currentProjectId={currentProjectId}
          /> */}
          <SidebarNav collapsed={collapsed} />
          <SidebarProfile collapsed={collapsed} />
        </div>
      </aside>
    </TooltipProvider>
  );
}
