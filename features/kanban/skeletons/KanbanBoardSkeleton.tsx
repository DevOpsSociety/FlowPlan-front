import { Skeleton } from '@/shared/ui/skeleton';

/**
 * Kanban Board 로딩 스켈레톤
 *
 * 칸반 보드가 로딩 중일 때 표시되는 스켈레톤 UI
 */
export function KanbanBoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto">
      {/* 4개의 칸반 컬럼 (todo, in-progress, done, blocked) */}
      {Array.from({ length: 4 }).map((_, columnIndex) => (
        <div key={columnIndex} className="flex-shrink-0 w-80 space-y-3">
          {/* 컬럼 헤더 */}
          <Skeleton className="h-10 w-full" />

          {/* 카드들 */}
          {Array.from({ length: 3 }).map((_, cardIndex) => (
            <Skeleton key={cardIndex} className="h-32 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
