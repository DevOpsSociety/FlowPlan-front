/**
 * API ↔ dhtmlx-gantt 데이터 변환 유틸리티
 */

import { getStatusFromProgress } from '@/shared/utils/taskStatusUtils';

// dhtmlx-gantt 타입 정의
export interface DhtmlxTask {
  id: number;
  text: string;
  start_date: string;
  duration: number;
  progress: number;
  parent?: number;
  open?: boolean;
  assignee?: string; // 담당자 이름 (표시용)
  assignee_email?: string; // 담당자 이메일 (API 전송용)
}

/**
 * API 원본 데이터(TaskFlatDto) → dhtmlx-gantt 형식 변환
 */
export const apiTaskToDhtmlx = (apiTask: any): DhtmlxTask => {
  const startDate = new Date(apiTask.start);
  const formattedDate = `${startDate.getDate().toString().padStart(2, '0')}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()}`;

  return {
    id: apiTask.id,
    text: apiTask.name,
    start_date: formattedDate,
    duration: apiTask.duration || 1,
    progress: (apiTask.progress || 0) / 100,
    parent: apiTask.parent || 0,
    open: true,
    assignee: apiTask.assigneeName || '', // 담당자 이름 (표시용)
    assignee_email: apiTask.assigneeEmail || '', // 담당자 이메일 (API 전송용)
  };
};

/**
 * dhtmlx-gantt 날짜 → API 형식 변환 (YYYY-MM-DD)
 */
export const dhtmlxDateToApi = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;
};

// Re-export for convenience
export { getStatusFromProgress };
