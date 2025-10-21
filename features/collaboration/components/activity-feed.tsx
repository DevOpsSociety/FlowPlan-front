"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Badge } from "@/shared/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { FileText, MessageSquare, UserPlus, Edit, Trash2, Upload, CheckCircle2 } from "lucide-react"
import { apiService } from "@/shared/lib/api-service"
import type { ActivityLog } from "@/shared/lib/api-types"

interface ActivityFeedProps {
  projectId: string
  maxHeight?: string
}

export function ActivityFeed({ projectId, maxHeight = "400px" }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [projectId])

  const loadActivities = async () => {
    setIsLoading(true)
    try {
      const response = await apiService.getActivityLog(projectId)
      if (response.success && response.data) {
        setActivities(response.data)
      }
    } catch (error) {
      console.error("Failed to load activities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "task_created":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "task_updated":
        return <Edit className="h-4 w-4 text-yellow-500" />
      case "task_deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />
      case "comment_added":
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case "file_uploaded":
        return <Upload className="h-4 w-4 text-purple-500" />
      case "member_added":
        return <UserPlus className="h-4 w-4 text-indigo-500" />
      default:
        return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "방금 전"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`
    return date.toLocaleDateString("ko-KR")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>활동 로그</CardTitle>
        <CardDescription>프로젝트의 최근 활동 내역</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">활동 내역이 없습니다</div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                  <div className="mt-1">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">{activity.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{activity.user.name}</span>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    {activity.metadata && (
                      <div className="flex gap-2 mt-1">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
