/**
 * dhtmlx-gantt 설정 파일
 * - Columns 설정
 * - Scales 설정 (일별/월별 뷰)
 * - 기본 설정
 */

/**
 * Gantt 차트 컬럼 정의
 */
export const ganttColumns = [
  { name: 'text', label: '작업명', tree: true, width: '*', resize: true },
  { name: 'start_date', label: '시작일', align: 'center', width: 100 },
  {
    name: 'assignee',
    label: '담당자',
    align: 'center',
    width: 80,
    template: (task: any) => task.assignee || '미배정',
  },
  {
    name: 'progress',
    label: '진행률',
    align: 'center',
    width: 65,
    template: (task: any) => Math.round(task.progress * 100) + '%',
  },
  { name: 'add', label: '', width: 44 },
];

/**
 * 일별 뷰 스케일
 */
export const dayViewScales = [
  { unit: 'month', step: 1, format: '%Y년 %m월' },
  { unit: 'day', step: 1, format: '%d' },
];

/**
 * 월별 뷰 스케일
 */
export const monthViewScales = [
  { unit: 'year', step: 1, format: '%Y년' },
  { unit: 'month', step: 1, format: '%m월' },
];

/**
 * Gantt 기본 설정
 */
export const ganttBaseConfig = {
  date_format: '%d-%m-%Y',
  xml_date: '%d-%m-%Y',
  readonly: false,
  drag_progress: true,
  drag_resize: true,
  drag_move: true,
  details_on_dblclick: true,
  show_progress: true,
  scale_height: 50,
  grid_width: 500, // 그리드(왼쪽 컬럼) 전체 너비
};
