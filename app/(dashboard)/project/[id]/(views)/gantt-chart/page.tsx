import { Suspense } from 'react';
import { GanttChartView } from '@/features/gantt/components/GanttChartView';
import { GanttChartSkeleton } from '@/features/gantt/skeletons/GanttChartSkeleton';

/**
 * Gantt Chart View Page
 *
 * URL: /project/[id]/gantt-chart
 * 간트 차트 타임라인 뷰를 렌더링합니다.
 */
export default function GanttChartPage() {
  return (
    <Suspense fallback={<GanttChartSkeleton />}>
      <GanttChartView />
    </Suspense>
  );
}
