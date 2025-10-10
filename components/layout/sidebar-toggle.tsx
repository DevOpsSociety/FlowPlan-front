"use client"

import { Menu, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarToggleProps {
  collapsed: boolean
  onToggle: () => void
}

export function SidebarToggle({ collapsed, onToggle }: SidebarToggleProps) {
  return (
    <div className="p-4 border-b border-sidebar-border">
      <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
        {collapsed ? <Menu className="h-4 w-4" /> : <ChevronRight className="h-4 w-4 rotate-180" />}
      </Button>
    </div>
  )
}
