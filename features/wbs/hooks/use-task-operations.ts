"use client"

import type React from "react"

import { useCallback } from "react"
import { useToast } from "@/shared/hooks/use-toast" // TODO: shared/hooks로 이동 예정
import { emitSyncEvent } from "@/shared/lib/storage" // TODO: shared/lib로 이동 예정
import type { HierarchicalWBSTask } from "@/shared/lib/mock-data" // TODO: OpenAPI codegen으로 타입 생성 후 변경

export function useTaskOperations(
  projectId: string,
  wbsTasks: HierarchicalWBSTask[],
  setWbsTasks: React.Dispatch<React.SetStateAction<HierarchicalWBSTask[]>>,
) {
  const { toast } = useToast()

  const findTaskById = useCallback((tasks: HierarchicalWBSTask[], taskId: string): HierarchicalWBSTask | null => {
    for (const task of tasks) {
      if (task.id === taskId) return task
      if (task.subTasks && task.subTasks.length > 0) {
        const found = findTaskById(task.subTasks, taskId)
        if (found) return found
      }
    }
    return null
  }, [])

  const findTaskName = useCallback((tasks: HierarchicalWBSTask[], id: string): string | undefined => {
    for (const task of tasks) {
      if (task.id === id) return task.name
      if (task.subTasks) {
        const found = findTaskName(task.subTasks, id)
        if (found) return found
      }
    }
    return undefined
  }, [])

  const handleTaskUpdate = useCallback(
    (taskId: string, updates: Partial<HierarchicalWBSTask>) => {
      const updateTaskRecursively = (tasks: HierarchicalWBSTask[]): HierarchicalWBSTask[] => {
        return tasks.map((task) => {
          if (task.id === taskId) {
            const updatedTask = { ...task, ...updates }

            if (updates.status) {
              if (updates.status === "done") {
                updatedTask.progress = 100
              } else if (updates.status === "in-progress" && task.progress === 0) {
                updatedTask.progress = 10
              } else if (updates.status === "todo") {
                updatedTask.progress = 0
              }
            }

            if (updates.duration && updates.duration !== task.duration) {
              const startDate = new Date(task.startDate)
              const newEndDate = new Date(startDate)
              newEndDate.setDate(startDate.getDate() + updates.duration - 1)
              updatedTask.endDate = newEndDate.toISOString().split("T")[0]
            }

            return updatedTask
          }

          if (task.subTasks && task.subTasks.length > 0) {
            return {
              ...task,
              subTasks: updateTaskRecursively(task.subTasks),
            }
          }

          return task
        })
      }

      setWbsTasks((prev) => {
        const updated = updateTaskRecursively(prev)

        emitSyncEvent({
          type: "task_updated",
          projectId,
          taskId,
          data: updates,
          timestamp: Date.now(),
        })

        return updated
      })

      toast({
        title: "작업이 업데이트되었습니다",
        description: `${findTaskName(wbsTasks, taskId)}이(가) 수정되었습니다.`,
      })
    },
    [wbsTasks, projectId, toast, setWbsTasks, findTaskName],
  )

  const handleTaskDelete = useCallback(
    (taskId: string) => {
      const deleteTaskRecursively = (tasks: HierarchicalWBSTask[]): HierarchicalWBSTask[] => {
        return tasks.filter((task) => {
          if (task.id === taskId) return false
          if (task.subTasks && task.subTasks.length > 0) {
            task.subTasks = deleteTaskRecursively(task.subTasks)
          }
          return true
        })
      }

      const taskName = findTaskName(wbsTasks, taskId)

      setWbsTasks((prev) => {
        const updated = deleteTaskRecursively(prev)

        emitSyncEvent({
          type: "task_deleted",
          projectId,
          taskId,
          data: { taskName },
          timestamp: Date.now(),
        })

        return updated
      })

      toast({
        title: "작업이 삭제되었습니다",
        description: `${taskName}이(가) 삭제되었습니다.`,
      })
    },
    [wbsTasks, projectId, toast, setWbsTasks, findTaskName],
  )

  const handleTaskAdd = useCallback(
    (parentId?: string, taskData?: Partial<HierarchicalWBSTask>) => {
      // 부모 작업이 있는 경우 depth 체크
      if (parentId) {
        const parentTask = findTaskById(wbsTasks, parentId)
        if (parentTask && parentTask.depth >= 1) {
          toast({
            title: "작업 추가 불가",
            description: "최대 2단계(1.0 → 1.1)까지만 작업을 추가할 수 있습니다.",
            variant: "destructive",
          })
          return
        }
      }

      const newTask: HierarchicalWBSTask = {
        id: `task-new-${Date.now()}`,
        name: taskData?.name || "새 작업",
        assignee: taskData?.assignee || "미지정",
        startDate: taskData?.startDate || new Date().toISOString().split("T")[0],
        endDate: taskData?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        duration: taskData?.duration || 7,
        progress: taskData?.progress || 0,
        status: taskData?.status || "todo",
        dependencies: [],
        depth: parentId ? 1 : 0, // 부모가 있으면 depth 1, 없으면 0
        subTasks: [],
      }

      if (parentId) {
        const addSubTaskRecursively = (tasks: HierarchicalWBSTask[]): HierarchicalWBSTask[] => {
          return tasks.map((task) => {
            if (task.id === parentId) {
              return {
                ...task,
                subTasks: [...(task.subTasks || []), newTask],
              }
            }
            if (task.subTasks && task.subTasks.length > 0) {
              return {
                ...task,
                subTasks: addSubTaskRecursively(task.subTasks),
              }
            }
            return task
          })
        }
        setWbsTasks((prev) => {
          const updated = addSubTaskRecursively(prev)

          emitSyncEvent({
            type: "task_added",
            projectId,
            taskId: newTask.id,
            data: { newTask, parentId },
            timestamp: Date.now(),
          })

          return updated
        })
      } else {
        setWbsTasks((prev) => {
          const updated = [...prev, newTask]

          emitSyncEvent({
            type: "task_added",
            projectId,
            taskId: newTask.id,
            data: { newTask },
            timestamp: Date.now(),
          })

          return updated
        })
      }

      toast({
        title: parentId ? "새 하위 작업이 추가되었습니다" : "새 작업이 추가되었습니다",
        description: "작업 정보를 편집해주세요.",
      })
    },
    [projectId, toast, setWbsTasks],
  )

  return {
    findTaskById,
    handleTaskUpdate,
    handleTaskDelete,
    handleTaskAdd,
  }
}
