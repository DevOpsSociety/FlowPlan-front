'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { BarChart3, Kanban, Table } from 'lucide-react';

interface ViewNavigatorProps {
  projectId: string;
}

/**
 * 뷰 네비게이션 컴포넌트
 *
 * URL 기반으로 WBS/Gantt/Kanban 뷰를 전환합니다.
 */
export function ViewNavigator({ projectId }: ViewNavigatorProps) {
  const pathname = usePathname();
  const currentView = pathname.split('/').pop() || 'wbs-table';

  const views = [
    { id: 'wbs-table', label: 'WBS', icon: Table },
    { id: 'gantt-chart', label: '간트 차트', icon: BarChart3 },
    { id: 'kanban-board', label: '칸반 보드', icon: Kanban },
  ];

  return (
    <div className="flex gap-2">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;

        return (
          <Link key={view.id} href={`/project/${projectId}/${view.id}`}>
            <Button variant={isActive ? 'default' : 'outline'} size="sm" className="gap-2">
              <Icon className="h-4 w-4" />
              {view.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
