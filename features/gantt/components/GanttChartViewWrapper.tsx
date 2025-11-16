'use client';

import { useParams } from 'next/navigation';
import { GanttChartView } from './GanttChartView';

/**
 * Gantt Chart View Wrapper (Container Component)
 *
 * 역할:
 * - projectId 파라미터 추출 및 전달
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

  return <GanttChartView projectId={projectId} />;
}
