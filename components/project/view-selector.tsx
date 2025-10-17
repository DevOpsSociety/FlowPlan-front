"use client"

import { BarChart3, Kanban, Table } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface ViewSelectorProps {
  currentView: "wbs" | "gantt" | "kanban"
  onViewChange: (view: "wbs" | "gantt" | "kanban") => void
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  return (
    <ToggleGroup type="single" value={currentView} onValueChange={(value) => value && onViewChange(value as any)}>
      <ToggleGroupItem value="wbs" aria-label="WBS 테이블 뷰">
        <Table className="h-4 w-4 mr-2" />
        WBS
      </ToggleGroupItem>
      <ToggleGroupItem value="gantt" aria-label="간트차트 뷰">
        <BarChart3 className="h-4 w-4 mr-2" />
        Gantt
      </ToggleGroupItem>
      <ToggleGroupItem value="kanban" aria-label="칸반 보드 뷰">
        <Kanban className="h-4 w-4 mr-2" />
        Kanban
      </ToggleGroupItem>
    </ToggleGroup>
  )
}