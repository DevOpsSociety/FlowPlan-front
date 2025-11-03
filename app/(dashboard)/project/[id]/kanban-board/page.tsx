import { Suspense } from 'react';
import { KanbanBoardView } from '@/features/kanban/components/KanbanBoardView';
import { KanbanBoardSkeleton } from '@/features/kanban/skeletons/KanbanBoardSkeleton';

/**
 * Kanban Board View Page
 *
 * URL: /project/[id]/kanban-board
 * 칸반 보드 뷰를 렌더링합니다.
 */
export default function KanbanBoardPage() {
  return (
    <Suspense fallback={<KanbanBoardSkeleton />}>
      <KanbanBoardView />
    </Suspense>
  );
}
