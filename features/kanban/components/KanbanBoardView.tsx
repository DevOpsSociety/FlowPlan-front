'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { QUERY_KEYS } from '@/shared/hooks/queries/useProjectQuery';
import { KanbanBoard } from './KanbanBoard';

/**
 * Kanban Board View (Container Component)
 *
 * 역할:
 * - HydrationBoundary로 주입된 태스크 데이터를 사용
 * - Container 역할: 데이터 로딩 및 상태 관리
 * - KanbanBoard에 데이터와 상태 전달
 */
export function KanbanBoardView() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();

  // HydrationBoundary로 주입된 tasks 사용
  const { data: tasks = [] } = useQuery({
    queryKey: QUERY_KEYS.tasks(projectId),
  });

  return <KanbanBoard projectId={projectId} />;
}
