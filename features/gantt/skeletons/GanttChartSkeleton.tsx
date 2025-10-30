import { Skeleton } from '@/shared/ui/skeleton';

/**
 * Gantt Chart 로딩 스켈레톤
 *
 * 간트 차트가 로딩 중일 때 표시되는 스켈레톤 UI
 */
export function GanttChartSkeleton() {
  return (
    <div className="space-y-4">
      {/* 헤더 영역 */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* 간트 차트 메인 영역 */}
      <Skeleton className="h-[450px] w-full" />
    </div>
  );
}
