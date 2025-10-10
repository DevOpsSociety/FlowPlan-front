"use client"

import type React from "react"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { HierarchicalWBSTask } from "@/lib/mock-data"

interface GanttChartViewProps {
  tasks: HierarchicalWBSTask[]
  onTaskSelect?: (taskId: string) => void
  onTaskUpdate?: (taskId: string, updates: Partial<HierarchicalWBSTask>) => void
  selectedTaskId?: string | null
}

export function GanttChartView({ tasks, onTaskSelect, onTaskUpdate, selectedTaskId }: GanttChartViewProps) {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day")
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1))
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  const getFlatTaskList = (
    taskList: HierarchicalWBSTask[],
    depth = 0,
  ): Array<HierarchicalWBSTask & { depth: number }> => {
    const flatTasks: Array<HierarchicalWBSTask & { depth: number }> = []

    taskList.forEach((task) => {
      flatTasks.push({ ...task, depth })
      if (task.subTasks && task.subTasks.length > 0) {
        flatTasks.push(...getFlatTaskList(task.subTasks, depth + 1))
      }
    })

    return flatTasks
  }

  const flatTasks = getFlatTaskList(tasks)

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (viewMode === "day") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
    } else if (viewMode === "week") {
      newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1))
    } else {
      newDate.setFullYear(currentDate.getFullYear() + (direction === "next" ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const getTaskColor = (task: HierarchicalWBSTask) => {
    if (task.status === "done") return "bg-green-500"
    if (task.status === "in-progress") return "bg-blue-500"
    if (task.status === "todo") return "bg-gray-400"
    return "bg-gray-400"
  }

  const calculateBarPosition = (task: HierarchicalWBSTask) => {
    const startDate = new Date(task.startDate)
    const endDate = new Date(task.endDate)

    const startDiff = Math.floor((startDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
    const duration = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 1000)) + 1

    const cellWidth = viewMode === "day" ? 60 : viewMode === "week" ? 80 : 120
    const left = Math.max(0, startDiff * cellWidth)
    const width = Math.max(cellWidth / 2, duration * cellWidth)

    return { left, width }
  }

  const handleTaskDragStart = (taskId: string, e: React.MouseEvent) => {
    e.preventDefault()
    setDraggedTask(taskId)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Calculate new position and update task dates
      const cellWidth = viewMode === "day" ? 60 : viewMode === "week" ? 80 : 120
      const deltaX = moveEvent.clientX - e.clientX
      const daysDelta = Math.round(deltaX / cellWidth)

      if (daysDelta !== 0 && onTaskUpdate) {
        const task = flatTasks.find((t) => t.id === taskId)
        if (task) {
          const newStartDate = new Date(task.startDate)
          const newEndDate = new Date(task.endDate)
          newStartDate.setDate(newStartDate.getDate() + daysDelta)
          newEndDate.setDate(newEndDate.getDate() + daysDelta)

          onTaskUpdate(taskId, {
            startDate: newStartDate.toISOString().split("T")[0],
            endDate: newEndDate.toISOString().split("T")[0],
          })
        }
      }
    }

    const handleMouseUp = () => {
      setDraggedTask(null)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleProgressClick = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onTaskUpdate) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const newProgress = Math.round((clickX / rect.width) * 100)

      let newStatus: HierarchicalWBSTask["status"] = "todo"
      if (newProgress >= 100) newStatus = "done"
      else if (newProgress > 0) newStatus = "in-progress"

      onTaskUpdate(taskId, { progress: newProgress, status: newStatus })
    }
  }

  const generateTimelineHeaders = () => {
    const headers = []
    const startDate = new Date(currentDate)
    const daysToShow = viewMode === "day" ? 30 : viewMode === "week" ? 12 : 6

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate)
      if (viewMode === "day") {
        date.setDate(startDate.getDate() + i)
        headers.push(date.getDate().toString())
      } else if (viewMode === "week") {
        date.setDate(startDate.getDate() + i * 7)
        headers.push(`${date.getMonth() + 1}/${date.getDate()}`)
      } else {
        date.setMonth(startDate.getMonth() + i)
        headers.push(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`)
      }
    }
    return headers
  }

  return (
    <div className="space-y-4">
      {/* 간트차트 컨트롤 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">간트차트</h3>
        <div className="flex items-center space-x-2">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">일별</SelectItem>
              <SelectItem value="week">주별</SelectItem>
              <SelectItem value="month">월별</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 간트차트 */}
      <div className="border rounded-lg bg-card p-6">
        <div className="grid grid-cols-[300px_1fr] gap-0 border rounded">
          {/* 작업명 열 */}
          <div className="border-r">
            <div className="p-3 bg-muted font-medium border-b">작업명</div>
            {flatTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedTaskId === task.id ? "bg-primary/10 border-primary/20" : ""
                }`}
                onClick={() => onTaskSelect?.(task.id)}
                style={{ paddingLeft: `${12 + task.depth * 20}px` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="truncate font-medium">{task.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">({task.assignee})</span>
                  </div>
                  {selectedTaskId === task.id && <Edit className="h-3 w-3 text-muted-foreground" />}
                </div>
                <div
                  className="mt-2 w-full bg-gray-200 rounded-full h-2 cursor-pointer hover:bg-gray-300 transition-colors"
                  onClick={(e) => handleProgressClick(task.id, e)}
                  title={`진행률: ${task.progress}% (클릭하여 수정)`}
                >
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {task.progress}% •{" "}
                  {task.status === "todo" ? "할 일" : task.status === "in-progress" ? "진행 중" : "완료"}
                </div>
              </div>
            ))}
          </div>

          {/* 타임라인 영역 */}
          <div className="min-w-0 overflow-x-auto">
            {/* 타임라인 헤더 */}
            <div className="flex border-b bg-muted min-w-max">
              {generateTimelineHeaders().map((header, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 p-3 text-center border-r font-medium"
                  style={{ width: viewMode === "day" ? 60 : viewMode === "week" ? 80 : 120 }}
                >
                  {header}
                </div>
              ))}
            </div>

            {/* 간트 막대 영역 */}
            <div className="relative min-w-max">
              {flatTasks.map((task, taskIndex) => {
                const { left, width } = calculateBarPosition(task)
                const isSelected = selectedTaskId === task.id
                const isDragging = draggedTask === task.id

                return (
                  <div key={task.id} className="relative border-b" style={{ height: 73 }}>
                    {/* 그리드 라인 */}
                    <div className="absolute inset-0 flex">
                      {generateTimelineHeaders().map((_, index) => (
                        <div
                          key={index}
                          className="border-r"
                          style={{ width: viewMode === "day" ? 60 : viewMode === "week" ? 80 : 120 }}
                        />
                      ))}
                    </div>

                    {/* 간트 막대 */}
                    {left >= 0 && (
                      <div
                        className={`absolute top-3 h-8 rounded shadow-sm transition-all duration-200 cursor-move select-none ${getTaskColor(
                          task,
                        )} ${isSelected ? "ring-2 ring-primary ring-offset-1" : ""} ${
                          isDragging ? "opacity-75 scale-105" : "hover:opacity-90"
                        }`}
                        style={{ left, width: Math.max(width, 20) }}
                        onClick={() => onTaskSelect?.(task.id)}
                        onMouseDown={(e) => handleTaskDragStart(task.id, e)}
                        title={`${task.name} (드래그하여 일정 조정)`}
                      >
                        <div className="px-2 py-1 text-xs text-white truncate flex items-center justify-between">
                          <span>{task.name}</span>
                          <span className="text-xs opacity-75">{task.progress}%</span>
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-1 left-2 text-xs text-muted-foreground">
                      <div>
                        {task.startDate} ~ {task.endDate}
                      </div>
                      <div className="text-xs opacity-75">
                        {task.duration}일 • {task.assignee}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 범례 및 도움말 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 rounded" />
            <span>할 일</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span>진행 중</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span>완료</span>
          </div>
        </div>
        <div className="text-xs">💡 막대를 드래그하여 일정 조정, 진행률 바를 클릭하여 진행률 수정</div>
      </div>
    </div>
  )
}
