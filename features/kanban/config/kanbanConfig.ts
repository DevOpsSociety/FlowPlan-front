/**
 * Kanban 보드 설정 파일
 * - 컬럼 정의 (할 일, 진행 중, 완료)
 * - 상태 매핑 상수
 */

// ===== 타입 정의 =====

export type KanbanColumnId = 'todo' | 'in-progress' | 'done';

export interface KanbanColumn {
  id: KanbanColumnId;
  title: string;
  color: string;
}

// ===== 컬럼 정의 =====

export const kanbanColumns: KanbanColumn[] = [
  {
    id: 'todo',
    title: '할 일',
    color: 'bg-slate-100 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/50',
  },
  {
    id: 'in-progress',
    title: '진행 중',
    color: 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30',
  },
  {
    id: 'done',
    title: '완료',
    color: 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30',
  },
];

// ===== 상태 매핑 상수 =====

/**
 * 작업 추가 시 컬럼에 따른 초기 상태 매핑
 */
export const STATUS_BY_COLUMN: Record<KanbanColumnId, string> = {
  todo: 'TODO',
  'in-progress': 'IN_PROGRESS',
  done: 'DONE',
};

/**
 * 작업 추가 시 컬럼에 따른 초기 진행률 매핑
 */
export const PROGRESS_BY_COLUMN: Record<KanbanColumnId, number> = {
  todo: 0,
  'in-progress': 1,
  done: 100,
};
