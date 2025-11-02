'use client';

import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/ToggleGroup';
import { BarChart3, Kanban, Table } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ViewNavigatorProps {
  projectId: string;
}

/**
 * 뷰 네비게이션 컴포넌트
 *
 * URL 기반으로 WBS/Gantt/Kanban 뷰를 전환합니다.
 * 기존 ViewSelector와 동일한 ToggleGroup 디자인 + Link로 로딩 없는 전환
 */
export function ViewNavigator({ projectId }: ViewNavigatorProps) {
  const pathname = usePathname();
  const currentView = pathname.split('/').pop() || 'wbs-table';

  return (
    <ToggleGroup type="single" value={currentView}>
      <Link href={`/project/${projectId}/wbs-table`}>
        <ToggleGroupItem
          value="wbs-table"
          aria-label="WBS 테이블 뷰"
          className="hover:cursor-pointer"
        >
          <Table className="h-4 w-4 mr-2" />
          WBS
        </ToggleGroupItem>
      </Link>
      <Link href={`/project/${projectId}/gantt-chart`}>
        <ToggleGroupItem
          value="gantt-chart"
          aria-label="간트차트 뷰"
          className="hover:cursor-pointer"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Gantt
        </ToggleGroupItem>
      </Link>
      <Link href={`/project/${projectId}/kanban-board`}>
        <ToggleGroupItem
          value="kanban-board"
          aria-label="칸반 보드 뷰"
          className="hover:cursor-pointer"
        >
          <Kanban className="h-4 w-4 mr-2" />
          Kanban
        </ToggleGroupItem>
      </Link>
    </ToggleGroup>
  );
}
