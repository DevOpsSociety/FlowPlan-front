"use client"
import { HeaderLogo } from "./header-logo"
import { ThemeToggle } from "./theme-toggle"
import { UserMenu } from "./user-menu"
import { NotificationCenter } from "@/components/notification-center"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <HeaderLogo />
        <div className="flex items-center space-x-4">
          <NotificationCenter />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
