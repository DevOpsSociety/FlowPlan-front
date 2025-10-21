"use client"

import { useState } from "react"
import { Edit2, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WBSTask } from "@/lib/mock-data" // TODO: OpenAPI codegen으로 타입 생성 후 변경

interface WBSTableProps {
  tasks: WBSTask[]
  onTaskUpdate: (taskId: string, updates: Partial<WBSTask>) => void
  onTaskDelete: (taskId: string) => void
  onTaskAdd: () => void
  onTaskSelect?: (taskId: string) => void
}

export function WBSTable({ tasks, onTaskUpdate, onTaskDelete, onTaskAdd, onTaskSelect }: WBSTableProps) {
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<WBSTask>>({})

  const getStatusBadge = (status: WBSTask["status"]) => {
    const variants = {
      todo: "secondary",
      "in-progress": "default",
      done: "success",
      blocked: "destructive",
    } as const

    const labels = {
      todo: "할 일",
      "in-progress": "진행 중",
      done: "완료",
      blocked: "차단됨",
    }

    return <Badge variant={variants[status] as any}>{labels[status]}</Badge>
  }

  const handleEdit = (task: WBSTask) => {
    setEditingTask(task.id)
    setEditValues(task)
  }

  const handleSave = () => {
    if (editingTask && editValues) {
      onTaskUpdate(editingTask, editValues)
      setEditingTask(null)
      setEditValues({})
    }
  }

  const handleCancel = () => {
    setEditingTask(null)
    setEditValues({})
  }

  const formatDuration = (days: number) => {
    return `${days}일`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">작업 분해 구조 (WBS)</h3>
        <Button onClick={onTaskAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          작업 추가
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">작업명</TableHead>
              <TableHead className="w-[120px]">담당자</TableHead>
              <TableHead className="w-[120px]">시작일</TableHead>
              <TableHead className="w-[120px]">종료일</TableHead>
              <TableHead className="w-[80px]">기간</TableHead>
              <TableHead className="w-[80px]">진행률</TableHead>
              <TableHead className="w-[100px]">상태</TableHead>
              <TableHead className="w-[100px]">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onTaskSelect?.(task.id)}
              >
                <TableCell>
                  {editingTask === task.id ? (
                    <Input
                      value={editValues.name || ""}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{task.name}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {editingTask === task.id ? (
                    <Input
                      value={editValues.assignee || ""}
                      onChange={(e) => setEditValues({ ...editValues, assignee: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    task.assignee
                  )}
                </TableCell>
                <TableCell>
                  {editingTask === task.id ? (
                    <Input
                      type="date"
                      value={editValues.startDate || ""}
                      onChange={(e) => setEditValues({ ...editValues, startDate: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    task.startDate
                  )}
                </TableCell>
                <TableCell>
                  {editingTask === task.id ? (
                    <Input
                      type="date"
                      value={editValues.endDate || ""}
                      onChange={(e) => setEditValues({ ...editValues, endDate: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    task.endDate
                  )}
                </TableCell>
                <TableCell>{formatDuration(task.duration)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{task.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {editingTask === task.id ? (
                    <Select
                      value={editValues.status || task.status}
                      onValueChange={(value) => setEditValues({ ...editValues, status: value as WBSTask["status"] })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">할 일</SelectItem>
                        <SelectItem value="in-progress">진행 중</SelectItem>
                        <SelectItem value="done">완료</SelectItem>
                        <SelectItem value="blocked">차단됨</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    getStatusBadge(task.status)
                  )}
                </TableCell>
                <TableCell>
                  {editingTask === task.id ? (
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" onClick={handleSave}>
                        저장
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancel}>
                        취소
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(task)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onTaskDelete(task.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
