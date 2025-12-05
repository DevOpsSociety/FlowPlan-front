import { Skeleton } from '@/shared/ui/skeleton';

/**
 * Kanban Board 로딩 스켈레톤
 *
 * 칸반 보드가 로딩 중일 때 표시되는 스켈레톤 UI
 */
export function KanbanBoardSkeleton() {
  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* 칸반 보드 (3열) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, columnIndex) => (
          <div key={columnIndex} className="space-y-3">
            {/* 컬럼 헤더 */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-5 w-8" />
              </div>
            </div>

            {/* 카드들 */}
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <div key={cardIndex} className="p-4 rounded-lg border space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-2 w-full" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
