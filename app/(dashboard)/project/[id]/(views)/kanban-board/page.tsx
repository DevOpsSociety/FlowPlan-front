import { Suspense } from 'react';
import { KanbanBoard } from '@/features/kanban/components/KanbanBoard';
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
      <KanbanBoard />
    </Suspense>
  );
}
