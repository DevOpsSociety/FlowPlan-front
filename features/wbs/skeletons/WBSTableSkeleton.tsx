import { Skeleton } from '@/shared/ui/skeleton';

/**
 * WBS Table 로딩 스켈레톤
 *
 * WBS 테이블이 로딩 중일 때 표시되는 스켈레톤 UI
 */
export function WBSTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* 헤더 행 */}
      <Skeleton className="h-10 w-full" />

      {/* 데이터 행들 */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
