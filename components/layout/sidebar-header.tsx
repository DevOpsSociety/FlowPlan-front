"use client"

import { Menu, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarHeaderProps {
  collapsed: boolean
  onToggle: () => void
}

export function SidebarHeader({ collapsed, onToggle }: SidebarHeaderProps) {
  return (
    <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
      {!collapsed && (
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <span className="text-lg font-bold text-primary">🎯</span>
          </div>
          <h1 className="text-lg font-bold text-foreground">FlowPlan</h1>
        </div>
      )}
      {/* <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 shrink-0">
        {collapsed ? <Menu className="h-4 w-4" /> : <ChevronRight className="h-4 w-4 rotate-180" />}
      </Button> */}
    </div>
  )
}
