"use client"

import { useState, useEffect } from "react"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { Separator } from "@/shared/ui/separator"
import { Bell, CheckCheck, MessageSquare, UserPlus, Calendar, AlertCircle } from "lucide-react"
import { apiService } from "@/shared/lib/api-service"
import type { Notification } from "@/shared/lib/api-types"
import { useToast } from "@/shared/hooks/use-toast"

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await apiService.getNotifications()
      if (response.success && response.data) {
        setNotifications(response.data)
      }
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId)
      setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead()
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
      toast({
        title: "모든 알림을 읽음으로 표시했습니다",
      })
    } catch (error) {
      console.error("Failed to mark all as read:", error)
      toast({
        title: "알림 업데이트 실패",
        description: "알림을 업데이트하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "task_assigned":
        return <UserPlus className="h-4 w-4 text-blue-500" />
      case "comment_added":
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case "deadline_approaching":
        return <Calendar className="h-4 w-4 text-orange-500" />
      case "mention":
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      case "task_updated":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
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

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" type="button">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0"
        align="end"
        side="bottom"
        sideOffset={8}
        alignOffset={0}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">알림</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount}개의 읽지 않은 알림` : "모든 알림을 확인했습니다"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              모두 읽음
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">알림이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.isRead ? "bg-muted/30" : ""
                  }`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{notification.title}</p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(notification.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" className="w-full text-sm">
                모든 알림 보기
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
