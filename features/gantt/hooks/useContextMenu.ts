import { useCallback, useEffect, useState } from 'react';

// 컨텍스트 메뉴 상태 타입
export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  taskId: number | null;
}

/**
 * 컨텍스트 메뉴 상태 관리 훅
 * - 메뉴 상태 관리
 * - 문서 클릭 시 자동 닫기
 */
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    taskId: null,
  });

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    const handleDocumentClick = () => closeContextMenu();
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [closeContextMenu]);

  return { contextMenu, setContextMenu, closeContextMenu };
}
