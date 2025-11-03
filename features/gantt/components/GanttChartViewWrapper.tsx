'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { QUERY_KEYS } from '@/shared/hooks/queries/useProjectQuery';
import { GanttChartView } from './GanttChartView';

/**
 * Gantt Chart View Wrapper (Container Component)
 *
 * 역할:
 * - HydrationBoundary로 주입된 태스크 데이터를 사용
 * - Container 역할: 데이터 로딩 및 상태 관리
 * - 현재는 projectId만 전달하지만, 향후 리팩토링 시 데이터 props 전달 예정
 *
 * 향후 리팩토링 (백엔드 연동 시):
 * - GanttChartView 인터페이스 변경: { tasks, onTaskUpdate, ... }
 * - Container/Presentational 패턴 완전 구현
 * - GanttChartView 내부 데이터 로딩 로직 제거
 */
export function GanttChartViewWrapper() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();

  // HydrationBoundary로 주입된 tasks 사용
  // 현재는 GanttChartView가 내부에서 데이터를 다시 로드하지만,
  // 여기서 미리 fetch하여 캐시를 준비
  const { data: tasks = [] } = useQuery({
    queryKey: QUERY_KEYS.tasks(projectId),
  });

  // 현재: projectId만 전달 (기존 GanttChartView 인터페이스 유지)
  // TODO (백엔드 연동 시): tasks, onTaskUpdate 등 props 전달로 변경
  return <GanttChartView projectId={projectId} />;
}
