"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { User, Settings, LogOut, LogIn, ChevronUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface SidebarProfileProps {
  collapsed: boolean
}

export function SidebarProfile({ collapsed }: SidebarProfileProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check auth status on mount and when storage changes
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem("authToken")
      setIsAuthenticated(!!authToken)
    }

    checkAuth()

    // Listen for storage changes (for logout in other tabs)
    window.addEventListener("storage", checkAuth)
    return () => window.removeEventListener("storage", checkAuth)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    setIsAuthenticated(false)
    setIsOpen(false)
  }

  // Collapsed state
  if (collapsed) {
    if (!isAuthenticated) {
      return (
        <div className="p-4 border-t border-sidebar-border">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/login">
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <LogIn className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>로그인</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    }

    return (
      <div className="p-4 border-t border-sidebar-border">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setIsOpen(!isOpen)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="사용자" />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>프로필</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Dropdown menu for collapsed state */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute bottom-16 left-16 z-50 w-56 rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95">
              <Link href="/profile" onClick={() => setIsOpen(false)}>
                <button className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                  <User className="mr-2 h-4 w-4" />
                  <span>프로필 보기</span>
                </button>
              </Link>
              <Link href="/settings" onClick={() => setIsOpen(false)}>
                <button className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>설정</span>
                </button>
              </Link>
              <div className="h-px my-1 bg-border" />
              <button
                onClick={() => {
                  setIsOpen(false)
                  handleLogout()
                }}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>로그아웃</span>
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  // Expanded state - not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-4 border-t border-sidebar-border">
        <Link href="/login">
          <Button variant="default" className="w-full justify-start h-10">
            <LogIn className="mr-3 h-4 w-4" />
            로그인
          </Button>
        </Link>
      </div>
    )
  }

  // Expanded state - authenticated
  return (
    <div className="p-4 border-t border-sidebar-border">
      <div className="space-y-1">
        {/* Profile button */}
        <Button
          variant="ghost"
          className="w-full justify-start h-auto py-2 px-2 hover:bg-accent"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="사용자" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium leading-none">사용자 이름</p>
              <p className="text-xs text-muted-foreground mt-1">user@example.com</p>
            </div>
            <ChevronUp
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </Button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="pl-2 space-y-1 animate-in fade-in-0 slide-in-from-bottom-2">
            <Link href="/profile" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start h-9">
                <User className="mr-3 h-4 w-4" />
                프로필 보기
              </Button>
            </Link>
            <Link href="/settings" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start h-9">
                <Settings className="mr-3 h-4 w-4" />
                설정
              </Button>
            </Link>
            <div className="h-px my-1 bg-border" />
            <Button
              variant="ghost"
              className="w-full justify-start h-9 text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              로그아웃
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
