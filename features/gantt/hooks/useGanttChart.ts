import { gantt } from 'dhtmlx-gantt';
import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';
import {
  dayViewScales,
  ganttBaseConfig,
  ganttColumns,
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
      { name: 'description', height: 30, map_to: 'text', type: 'textarea', focus: true },
      {
        name: 'assignee_name',
        height: 40,
        map_to: 'assignee',
        type: 'template',
        default_value: '',
      },
      {
        name: 'assignee_email',
        height: 30,
        map_to: 'assignee_email',
        type: 'textarea',
        default_value: '',
      },
      { name: 'time', type: 'duration', map_to: 'auto' },
    ];

    // Lightbox 라벨 한국어 설정
    gantt.locale.labels.section_description = '작업명';
    gantt.locale.labels.section_assignee_name = '담당자 (읽기 전용)';
    gantt.locale.labels.section_assignee_email = '담당자 이메일';
    gantt.locale.labels.section_time = '기간';

    // 담당자 이름을 읽기 전용 텍스트로 표시하는 template 정의
    // eslint-disable-next-line @typescript-eslint/dot-notation
    if (gantt.form_blocks && gantt.form_blocks['template']) {
      gantt.form_blocks.template.render = function (sns: any) {
        const height = sns.height || 30;
        return `<div class='gantt_cal_ltext' style='height:${height}px; padding: 8px;'></div>`;
      };

      gantt.form_blocks.template.set_value = function (
        node: HTMLElement,
        value: any,
        _task: any,
        _section: any
      ) {
        const displayValue = value || '미배정';
        node.innerHTML = `<div style='padding: 4px 0;'>${displayValue}</div>`;
      };

      gantt.form_blocks.template.get_value = function (
        _node: HTMLElement,
        task: any,
        section: any
      ) {
        // 원래 값을 그대로 반환 (변경하지 않음)
        return task[section.map_to];
      };

      gantt.form_blocks.template.focus = function (_node: HTMLElement) {
        // 포커스 이벤트 무시 (편집 불가)
      };
    }

    // 상태별 태스크 색상 설정
    gantt.templates.task_class = function (start, end, task: any) {
      // task의 progress 값을 기반으로 상태 판단
      const progress = Math.round((task.progress || 0) * 100);

      let className = '';
      if (progress === 0) {
        className = 'gantt-task-todo'; // 회색
      } else if (progress === 100) {
        className = 'gantt-task-done'; // 초록색
      } else {
        className = 'gantt-task-in-progress'; // 파란색
      }

      console.log(`[Gantt] Task "${task.text}": progress=${progress}%, class=${className}`);
      return className;
    };

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
