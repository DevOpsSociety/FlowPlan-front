"use client"

import Link from "next/link"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

interface SidebarSettingsProps {
  collapsed: boolean
}

export function SidebarSettings({ collapsed }: SidebarSettingsProps) {
  return (
    <div className="p-4 border-t border-sidebar-border">
      <TooltipProvider>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>설정</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start h-10">
              <Settings className="mr-3 h-4 w-4" />
              설정
            </Button>
          </Link>
        )}
      </TooltipProvider>
    </div>
  )
}
