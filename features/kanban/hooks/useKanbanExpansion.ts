import { useCallback, useState } from 'react';

/**
 * Kanban 보드의 작업 접기/펼치기 상태 관리 훅
 *
 * 계층형 칸반에서 부모 작업 클릭 시 하위 작업 표시/숨김
 */
export function useKanbanExpansion() {
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());

  /**
   * 작업 펼치기/접기 토글
   */
  const toggleTaskExpansion = useCallback((taskId: number) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  /**
   * 특정 작업이 펼쳐져 있는지 확인
   */
  const isExpanded = useCallback((taskId: number) => expandedTasks.has(taskId), [expandedTasks]);

  /**
   * 모든 작업 펼치기
   */
  const expandAll = useCallback((taskIds: number[]) => {
    setExpandedTasks(new Set(taskIds));
  }, []);

  /**
   * 모든 작업 접기
   */
  const collapseAll = useCallback(() => {
    setExpandedTasks(new Set());
  }, []);

  return {
    expandedTasks,
    toggleTaskExpansion,
    isExpanded,
    expandAll,
    collapseAll,
  };
}
