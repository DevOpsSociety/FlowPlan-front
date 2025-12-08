import type { RefObject } from 'react';
import type { ContextMenuState } from '../hooks/useContextMenu';
import type { DhtmlxTask } from '../utils/ganttTransformers';
import { GanttContextMenu } from './GanttContextMenu';

interface GanttCanvasProps {
  containerRef: RefObject<HTMLDivElement>;
  tasks: DhtmlxTask[];
  contextMenu: ContextMenuState;
  onEdit: () => void;
  onDelete: () => void;
  onCloseMenu: () => void;
}

/**
 * 간트 차트 캔버스 컴포넌트
 * - dhtmlx-gantt 렌더링 컨테이너
 * - 컨텍스트 메뉴
 * - 높이는 작업 개수에 비례
 */
export function GanttCanvas({
  containerRef,
  tasks,
  contextMenu,
  onEdit,
  onDelete,
  onCloseMenu,
}: GanttCanvasProps) {
  return (
    <div className="border rounded-lg bg-card overflow-hidden relative">
      <div
        ref={containerRef}
        style={{ width: '100%', height: `${Math.max(400, tasks.length * 40 + 100)}px` }}
      />

      <GanttContextMenu
        contextMenu={contextMenu}
        onEdit={onEdit}
        onDelete={onDelete}
        onCloseMenu={onCloseMenu}
      />
    </div>
  );
}
