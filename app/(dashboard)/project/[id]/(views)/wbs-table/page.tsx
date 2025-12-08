import { Suspense } from 'react';
import { WBSTableView } from '@/features/wbs/components/WBSTableView';
import { WBSTableSkeleton } from '@/features/wbs/skeletons/WBSTableSkeleton';

/**
 * WBS Table View Page
 *
 * URL: /project/[id]/wbs-table
 * 계층적 WBS 테이블 뷰를 렌더링합니다.
 */
export default function WBSTablePage() {
  return (
    <Suspense fallback={<WBSTableSkeleton />}>
      <WBSTableView />
    </Suspense>
  );
}
