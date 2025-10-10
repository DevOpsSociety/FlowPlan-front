"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Clock, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { WBSTask } from "@/lib/mock-data"

interface KanbanColumn {
  id: string
  title: string
  status: WBSTask["status"]
  color: string
}

interface KanbanBoardProps {
  tasks: WBSTask[]
  onTaskStatusChange: (taskId: string, newStatus: WBSTask["status"]) => void
  onTaskSelect?: (taskId: string) => void
}

const columns: KanbanColumn[] = [
  {
    id: "todo",
    title: "할 일",
    status: "todo",
    color: "bg-slate-100 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/50",
  },
  {
    id: "in-progress",
    title: "진행 중",
    status: "in-progress",
    color: "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30",
  },
  {
    id: "done",
    title: "완료",
    status: "done",
    color: "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30",
  },
]

export function KanbanBoard({ tasks, onTaskStatusChange, onTaskSelect }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  const getTasksByStatus = (status: WBSTask["status"]) => {
    return tasks.filter((task) => task.status === status)
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, newStatus: WBSTask["status"]) => {
    e.preventDefault()
    if (draggedTask) {
      onTaskStatusChange(draggedTask, newStatus)
      setDraggedTask(null)
    }
  }

  const getAssigneeInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 50) return "bg-yellow-500"
    if (progress >= 20) return "bg-orange-500"
    return "bg-gray-300"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">칸반 보드</h3>
        <div className="text-sm text-muted-foreground">
          총 {tasks.length}개 작업 • 완료 {getTasksByStatus("done").length}개
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.status)

          return (
            <div
              key={column.id}
              className={`rounded-lg p-4 min-h-[500px] ${column.color}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {/* 컬럼 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-foreground">{column.title}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {columnTasks.length}
                  </Badge>
                </div>
              </div>

              {/* 작업 카드들 */}
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-pointer hover:shadow-md transition-shadow bg-background"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onTaskSelect?.(task.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <h5 className="font-medium text-sm leading-tight line-clamp-2">{task.name}</h5>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onTaskStatusChange(task.id, "todo")}>
                              할 일로 이동
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onTaskStatusChange(task.id, "in-progress")}>
                              진행 중으로 이동
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onTaskStatusChange(task.id, "done")}>
                              완료로 이동
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem onClick={() => onTaskStatusChange(task.id, "blocked")}>
                              차단됨으로 이동
                            </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* 진행률 바 */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">진행률</span>
                          <span className="text-xs font-medium">{task.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${getProgressColor(task.progress)}`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* 담당자 */}
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={`/ceholder-svg-height-24.jpg?height=24&width=24`} />
                          <AvatarFallback className="text-xs">{getAssigneeInitials(task.assignee)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{task.assignee}</span>
                      </div>

                      {/* 날짜 정보 */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(task.startDate)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{task.duration}일</span>
                        </div>
                      </div>

                      {/* 의존성 표시 */}
                      {task.dependencies.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-muted-foreground">의존성:</span>
                            <Badge variant="outline" className="text-xs">
                              {task.dependencies.length}개
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* 빈 상태 */}
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-sm">작업이 없습니다</div>
                    <div className="text-xs mt-1">작업을 여기로 드래그하세요</div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
