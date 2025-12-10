import type { UseMutationResult } from '@tanstack/react-query';
import { gantt } from 'dhtmlx-gantt';
import type { MutableRefObject } from 'react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { dhtmlxDateToApi, getStatusFromProgress } from '../utils/ganttTransformers';
import type { ContextMenuState } from './useContextMenu';

/**
 * dhtmlx-gantt 이벤트 핸들러 등록 훅
 * - onContextMenu: 우클릭 컨텍스트 메뉴
 * - onTaskCreated: 새 작업 생성 시 기본값 설정
 * - onAfterTaskUpdate: 작업 수정 (라이트박스, 드래그)
 * - onAfterTaskDrag: 진행률 드래그
 * - onAfterTaskAdd: 작업 추가 (API 연동 + Depth 검증)
 */
export function useGanttEvents(
  projectId: string,
  createMutationRef: MutableRefObject<UseMutationResult<any, any, any, any>>,
  updateMutationRef: MutableRefObject<UseMutationResult<any, any, any, any>>,
  setContextMenu: (state: ContextMenuState | ((prev: ContextMenuState) => ContextMenuState)) => void
) {
  useEffect(() => {
    // 우클릭 컨텍스트 메뉴
    const contextMenuHandler = gantt.attachEvent(
      'onContextMenu',
      (taskId: any, linkId: any, event: MouseEvent) => {
        if (taskId) {
          event.preventDefault();
          setContextMenu({ visible: true, x: event.clientX, y: event.clientY, taskId });
          return false;
        }
        return true;
      }
    );

    // 새 작업 생성 시 기본값 설정 (오늘 날짜)
    const taskCreatedHandler = gantt.attachEvent('onTaskCreated', (task: any) => {
      task.start_date = new Date();
      task.duration = 1;
      task.progress = 0;
      return true;
    });

    // 작업 수정 이벤트 (드래그, 라이트박스 저장 등)
    const taskUpdateHandler = gantt.attachEvent('onAfterTaskUpdate', (id: any, task: any) => {
      console.log('📝 [Gantt] onAfterTaskUpdate:', { id, task, progress: task.progress });
      const startDateStr = gantt.templates.format_date(task.start_date);

      // endDate 계산: start_date + duration
      const endDate = gantt.calculateEndDate(task.start_date, task.duration);
      const endDateStr = gantt.templates.format_date(endDate);

      let progressValue = Math.round(task.progress * 100);

      // 하위 작업의 경우 진행률을 0 또는 100으로만 제한
      if (task.parent && task.parent !== 0) {
        if (progressValue !== 0 && progressValue !== 100) {
          // 50% 기준으로 0 또는 100으로 스냅
          progressValue = progressValue >= 50 ? 100 : 0;
          // Gantt 차트의 task도 업데이트하여 UI에 반영
          task.progress = progressValue / 100;
          gantt.updateTask(id);
          toast.info('하위 작업은 0% 또는 100%의 진행률만 선택 가능합니다.');
        }
      }

      updateMutationRef.current.mutate({
        taskId: Number(id),
        updates: {
          name: task.text,
          startDate: dhtmlxDateToApi(startDateStr),
          endDate: dhtmlxDateToApi(endDateStr),
          progress: progressValue,
          status: getStatusFromProgress(progressValue),
          assigneeEmail: task.assignee_email ? task.assignee_email : null,
        },
      });
    });

    // 진행률 드래그 시작 전 검증 (하위 작업이 있는 상위 작업 차단)
    const beforeTaskDragHandler = gantt.attachEvent('onBeforeTaskDrag', (id: any, mode: any) => {
      const task = gantt.getTask(id);

      // 진행률 드래그 모드인 경우에만 체크 (mode === 'progress')
      if (mode === 'progress') {
        // 하위 작업이 있는지 확인
        const hasSubtasks = gantt.hasChild(id);

        if (hasSubtasks) {
          toast.error(
            '하위 작업이 있는 상위 작업의 진행률은 자동으로 계산됩니다. 하위 작업을 수정하세요.'
          );
          return false; // 드래그 취소
        }
      }

      return true; // 드래그 허용
    });

    // 진행률 드래그 완료 이벤트 (drag_progress 사용 시)
    const taskDragHandler = gantt.attachEvent('onAfterTaskDrag', (id: any, mode: any, e: any) => {
      const task = gantt.getTask(id);
      console.log('🎯 [Gantt] onAfterTaskDrag:', { id, mode, progress: task.progress });

      const startDateStr = gantt.templates.format_date(task.start_date as Date);
      const endDate = gantt.calculateEndDate(task.start_date as Date, task.duration || 1);
      const endDateStr = gantt.templates.format_date(endDate as Date);

      let progressValue = Math.round((task.progress || 0) * 100);

      // 하위 작업의 경우 진행률을 0 또는 100으로만 제한
      if (task.parent && task.parent !== 0) {
        if (progressValue !== 0 && progressValue !== 100) {
          // 50% 기준으로 0 또는 100으로 스냅
          progressValue = progressValue >= 50 ? 100 : 0;
          // Gantt 차트의 task도 업데이트하여 UI에 반영
          task.progress = progressValue / 100;
          gantt.updateTask(id);
          toast.info('하위 작업은 0% 또는 100%의 진행률만 선택 가능합니다.');
        }
      }

      updateMutationRef.current.mutate({
        taskId: Number(id),
        updates: {
          name: task.text,
          startDate: dhtmlxDateToApi(startDateStr),
          endDate: dhtmlxDateToApi(endDateStr),
          progress: progressValue,
          status: getStatusFromProgress(progressValue),
          assigneeEmail: task.assignee_email ? task.assignee_email : null,
        },
      });
    });

    // 작업 추가 이벤트 (API 연동 + Depth 검증)
    const taskAddHandler = gantt.attachEvent('onAfterTaskAdd', (id: any, task: any) => {
      // ⚠️ Depth 제한 검증 (최대 1단계까지만 허용)
      if (task.parent && task.parent !== 0) {
        const parentTask = gantt.getTask(task.parent);

        // 부모의 부모가 있으면 = 2단계 하위 작업 시도 → 차단
        if (parentTask && parentTask.parent && parentTask.parent !== 0) {
          gantt.deleteTask(id); // dhtmlx-gantt에서 작업 삭제
          toast.error('하위 작업은 최대 1단계까지만 생성할 수 있습니다');
          return; // ⚠️ 조기 종료 - API 호출 안 함
        }
      }

      const startDateStr = gantt.templates.format_date(task.start_date);

      // 🎯 핵심: task.parent 추출 (0이면 null, 숫자면 해당 ID)
      const parentId = task.parent && task.parent !== 0 ? task.parent : null;

      createMutationRef.current.mutate({
        name: task.text,
        startDate: dhtmlxDateToApi(startDateStr),
        endDate: dhtmlxDateToApi(startDateStr),
        progress: Math.round(task.progress * 100),
        status: 'TODO',
        parentId: parentId, // ✅ parentId: null (최상위) 또는 숫자 (하위 작업)
      });
    });

    // Cleanup
    return () => {
      gantt.detachEvent(contextMenuHandler);
      gantt.detachEvent(taskCreatedHandler);
      gantt.detachEvent(taskUpdateHandler);
      gantt.detachEvent(beforeTaskDragHandler);
      gantt.detachEvent(taskDragHandler);
      gantt.detachEvent(taskAddHandler);
    };
  }, [projectId, createMutationRef, updateMutationRef, setContextMenu]);
}
