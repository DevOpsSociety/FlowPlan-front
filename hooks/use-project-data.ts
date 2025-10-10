"use client"

import { useState, useEffect } from "react"
import { getWBSTasks, addSyncListener } from "@/lib/storage"
import { mockHierarchicalWBSTasks, type HierarchicalWBSTask } from "@/lib/mock-data"

export function useProjectData(projectId: string) {
  const [wbsTasks, setWbsTasks] = useState<HierarchicalWBSTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now())

  useEffect(() => {
    const loadData = () => {
      try {
        const storedTasks = getWBSTasks()
        if (storedTasks.length > 0) {
          setWbsTasks(storedTasks)
        } else {
          setWbsTasks(mockHierarchicalWBSTasks)
        }
      } catch (error) {
        console.error("Failed to load data:", error)
        setWbsTasks(mockHierarchicalWBSTasks)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    const unsubscribe = addSyncListener((event) => {
      if (event.projectId === projectId) {
        switch (event.type) {
          case "project_changed":
            if (event.data?.wbsTasks && event.timestamp > lastSyncTime) {
              setWbsTasks(event.data.wbsTasks)
              setLastSyncTime(event.timestamp)
            }
            break
          case "task_updated":
            if (event.timestamp > lastSyncTime) {
              loadData()
              setLastSyncTime(event.timestamp)
            }
            break
        }
      }
    })

    return unsubscribe
  }, [projectId, lastSyncTime])

  return { wbsTasks, setWbsTasks, isLoading }
}
