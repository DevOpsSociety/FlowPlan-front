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
    // 변경 전 task 데이터를 저장할 Map
    const taskBeforeUpdate = new Map<any, any>();

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

    // 작업 수정 전 - 원본 데이터 저장
    const beforeTaskUpdateHandler = gantt.attachEvent(
      'onBeforeTaskUpdate',
      (id: any, task: any) => {
        // ✅ Level 1 개선: 하위 작업도 0-100% 자유롭게 설정 가능
        // 진행률 제한 검증 제거

        // ⚠️ 주의: 드래그 중에는 이 이벤트가 여러 번 호출될 수 있음
        // onBeforeTaskDrag에서 이미 초기값을 저장했으면 절대 덮어쓰지 않음!
        if (!taskBeforeUpdate.has(id)) {
          // Gantt 차트에서 현재 저장된 원본 데이터를 가져옴
          const originalTask = gantt.getTask(id);

          console.log('📋 [Debug] onBeforeTaskUpdate - Saving ORIGINAL state from gantt:', {
            id,
            originalProgress: originalTask.progress,
            taskProgress: task.progress,
            progressType: typeof originalTask.progress,
            progressRounded: Math.round((originalTask.progress || 0) * 100),
          });

          // 변경 전 상태를 저장
          taskBeforeUpdate.set(id, {
            text: originalTask.text,
            start_date: new Date(originalTask.start_date || new Date()),
            duration: originalTask.duration,
            progress: originalTask.progress || 0,
            assignee_email: originalTask.assignee_email,
          });
        } else {
          console.log('📋 [Debug] onBeforeTaskUpdate - SKIP! Already saved:', {
            id,
            savedProgress: taskBeforeUpdate.get(id).progress,
            savedProgressRounded: Math.round((taskBeforeUpdate.get(id).progress || 0) * 100),
          });
        }

        return true;
      }
    );

    // 작업 수정 후 - 변경된 필드만 추출해서 API 전송
    const taskUpdateHandler = gantt.attachEvent('onAfterTaskUpdate', (id: any, task: any) => {
      console.log('📝 [Gantt] onAfterTaskUpdate:', { id, task });

      // 이전 데이터 가져오기
      const before = taskBeforeUpdate.get(id);
      if (!before) {
        console.warn('⚠️ No before data found for task:', id);
        return;
      }

      // 변경된 필드만 추출
      const updates: any = {};

      // 1. 작업명 비교
      if (task.text !== before.text) {
        updates.name = task.text;
      }

      // 2. 시작일 비교
      const beforeStartStr = gantt.templates.format_date(before.start_date);
      const currentStartStr = gantt.templates.format_date(task.start_date);
      if (currentStartStr !== beforeStartStr) {
        updates.startDate = dhtmlxDateToApi(currentStartStr);
      }

      // 3. 기간/종료일 비교
      if (task.duration !== before.duration) {
        const endDate = gantt.calculateEndDate(task.start_date, task.duration);
        const endDateStr = gantt.templates.format_date(endDate);
        updates.endDate = dhtmlxDateToApi(endDateStr);
      }

      // 4. 진행률 비교
      console.log('🔍 [Debug] Progress comparison:', {
        taskProgress: task.progress,
        beforeProgress: before.progress,
        areEqual: task.progress === before.progress,
        taskProgressType: typeof task.progress,
        beforeProgressType: typeof before.progress,
        taskProgressRounded: Math.round(task.progress * 100),
        beforeProgressRounded: Math.round(before.progress * 100),
      });

      if (task.progress !== before.progress) {
        const progressValue = Math.round(task.progress * 100);
        updates.progress = progressValue;
        updates.status = getStatusFromProgress(progressValue);
        console.log('✅ [Debug] Progress change detected, adding to updates:', {
          progressValue,
          status: updates.status,
        });
      }

      // 5. 담당자 이메일 비교
      if (task.assignee_email !== before.assignee_email) {
        if (task.assignee_email) {
          updates.assigneeEmail = task.assignee_email;
        }
      }

      // 변경된 필드가 없으면 API 호출 안 함
      if (Object.keys(updates).length === 0) {
        console.log('✅ [Gantt] No changes detected, skipping API call');
        taskBeforeUpdate.delete(id);
        return;
      }

      console.log('📤 [Gantt] Sending only changed fields:', updates);

      updateMutationRef.current.mutate({
        taskId: Number(id),
        updates,
      });

      // 저장된 이전 데이터 제거
      taskBeforeUpdate.delete(id);
    });

    // 진행률 드래그 시작 전 검증 및 초기값 저장
    const beforeTaskDragHandler = gantt.attachEvent('onBeforeTaskDrag', (id: any, mode: any) => {
      const task = gantt.getTask(id);

      // 진행률 드래그 모드인 경우
      if (mode === 'progress') {
        // 하위 작업이 있는지 확인
        const hasSubtasks = gantt.hasChild(id);

        if (hasSubtasks) {
          toast.error(
            '하위 작업이 있는 상위 작업의 진행률은 자동으로 계산됩니다. 하위 작업을 수정하세요.'
          );
          return false; // 드래그 취소
        }

        // ✅ 드래그 시작 시점의 진행률을 저장 (이게 진짜 "before" 상태)
        // ⚠️ id를 Number로 변환해서 저장 (일관성 유지)
        const taskId = Number(id);
        console.log('🎯 [Debug] onBeforeTaskDrag - Saving INITIAL progress:', {
          id: taskId,
          idType: typeof taskId,
          initialProgress: task.progress,
          progressRounded: Math.round((task.progress || 0) * 100),
        });

        taskBeforeUpdate.set(taskId, {
          text: task.text,
          start_date: new Date(task.start_date || new Date()),
          duration: task.duration,
          progress: task.progress || 0, // 드래그 시작 시점의 진행률
          assignee_email: task.assignee_email,
        });
      }

      return true; // 드래그 허용
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
      gantt.detachEvent(beforeTaskUpdateHandler);
      gantt.detachEvent(taskUpdateHandler);
      gantt.detachEvent(beforeTaskDragHandler);
      gantt.detachEvent(taskAddHandler);
    };
  }, [projectId, createMutationRef, updateMutationRef, setContextMenu]);
}
