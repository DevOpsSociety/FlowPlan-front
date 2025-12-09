import { gantt } from 'dhtmlx-gantt';
import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';
import {
  ganttBaseConfig,
  ganttColumns,
  dayViewScales,
  monthViewScales,
} from '../config/ganttConfig';
import type { DhtmlxTask } from '../utils/ganttTransformers';

/**
 * dhtmlx-gantt 초기화 및 데이터 관리 훅
 * - 컨테이너에 Gantt 인스턴스 초기화
 * - 데이터 로드 및 업데이트
 * - 뷰 모드 변경 (일별/월별)
 */
export function useGanttChart(
  containerRef: RefObject<HTMLDivElement>,
  tasks: DhtmlxTask[],
  viewMode: 'day' | 'month',
  shouldInit: boolean = true
) {
  const ganttInitialized = useRef(false);

  // Gantt 초기화 (한 번만 실행, shouldInit이 true일 때만)
  useEffect(() => {
    if (!shouldInit || !containerRef.current || ganttInitialized.current) return;

    // 기본 설정 적용
    Object.assign(gantt.config, ganttBaseConfig);
    gantt.config.columns = ganttColumns as any;
    gantt.config.scales = dayViewScales as any;

    // Lightbox 섹션 설정 (작업 편집 창)
    gantt.config.lightbox.sections = [
      { name: 'description', height: 38, map_to: 'text', type: 'textarea', focus: true },
      {
        name: 'assignee_email',
        height: 38,
        map_to: 'assignee_email',
        type: 'textarea',
        default_value: '',
      },
      { name: 'time', type: 'duration', map_to: 'auto' },
    ];

    // Lightbox 라벨 한국어 설정
    gantt.locale.labels.section_description = '작업명';
    gantt.locale.labels.section_assignee_email = '담당자 이메일';
    gantt.locale.labels.section_time = '기간';

    // Gantt 초기화 및 데이터 로드
    gantt.init(containerRef.current);
    gantt.clearAll();
    gantt.parse({ data: tasks, links: [] });

    ganttInitialized.current = true;

    // Cleanup
    return () => {
      gantt.clearAll();
      ganttInitialized.current = false;
    };
  }, [containerRef, shouldInit, tasks]);

  // 뷰 모드 변경 (일별/월별)
  useEffect(() => {
    if (!ganttInitialized.current) return;

    if (viewMode === 'month') {
      gantt.config.scales = monthViewScales as any;
    } else {
      gantt.config.scales = dayViewScales as any;
    }
    gantt.config.scale_height = 50;
    gantt.render();
  }, [viewMode]);

  return { ganttInitialized };
}
