"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip"
import type { TeamMember } from "@/shared/lib/api-types"

interface OnlineUsersProps {
  projectId: string
  teamMembers: TeamMember[]
}

export function OnlineUsers({ projectId, teamMembers }: OnlineUsersProps) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Simulate some users being online
    const simulateOnlineUsers = () => {
      const randomOnlineUsers = teamMembers.filter(() => Math.random() > 0.5).map((member) => member.id)
      setOnlineUsers(new Set(randomOnlineUsers))
    }

    simulateOnlineUsers()

    // Update online status every 30 seconds
    const interval = setInterval(simulateOnlineUsers, 30000)

    return () => clearInterval(interval)
  }, [teamMembers])

  const onlineMembers = teamMembers.filter((member) => onlineUsers.has(member.id))

  if (onlineMembers.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">온라인:</span>
      <TooltipProvider>
        <div className="flex -space-x-2">
          {onlineMembers.slice(0, 5).map((member) => (
            <Tooltip key={member.id}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                    <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {onlineMembers.length > 5 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted border-2 border-background">
                  <span className="text-xs font-medium">+{onlineMembers.length - 5}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{onlineMembers.length - 5}명 더 온라인</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </div>
  )
}
