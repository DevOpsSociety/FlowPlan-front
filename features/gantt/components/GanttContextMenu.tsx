import type { ContextMenuState } from '../hooks/useContextMenu';

interface GanttContextMenuProps {
  contextMenu: ContextMenuState;
  onEdit: () => void;
  onDelete: () => void;
  onCloseMenu: () => void;
}

/**
 * 간트 차트 컨텍스트 메뉴 컴포넌트
 * - 우클릭 시 표시
 * - 편집, 삭제 액션
 */
export function GanttContextMenu({
  contextMenu,
  onEdit,
  onDelete,
  onCloseMenu,
}: GanttContextMenuProps) {
  if (!contextMenu.visible) return null;

  return (
    <div
      className="fixed bg-popover border border-border rounded-md shadow-lg py-1 z-50 min-w-[160px]"
      style={{ left: contextMenu.x, top: contextMenu.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="w-full px-4 py-2 text-left text-sm hover:bg-accent" onClick={onEdit}>
        ✏️ 편집
      </button>
      <div className="border-t border-border my-1" />
      <button
        className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground"
        onClick={onDelete}
      >
        🗑️ 삭제
      </button>
    </div>
  );
}
