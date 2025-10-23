'use client';

import Link from 'next/link';

interface SidebarHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarHeader({ collapsed, onToggle }: SidebarHeaderProps) {
  return (
    <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
      {!collapsed && (
        <Link href="/">
          <h1 className="text-lg font-bold text-foreground">FlowPlan</h1>
        </Link>
      )}
      {/* <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 shrink-0">
        {collapsed ? <Menu className="h-4 w-4" /> : <ChevronRight className="h-4 w-4 rotate-180" />}
      </Button> */}
    </div>
  );
}
