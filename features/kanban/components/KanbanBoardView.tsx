'use client';

import { useParams } from 'next/navigation';
import { KanbanBoard } from './KanbanBoard';

/**
 * Kanban Board View (Container Component)
 */
export function KanbanBoardView() {
  const params = useParams();
  const projectId = params.id as string;

  return <KanbanBoard projectId={projectId} />;
}
