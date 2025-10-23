'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { ChevronUp, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Google 아이콘 컴포넌트
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

interface SidebarProfileProps {
  collapsed: boolean;
}

export function SidebarProfile({ collapsed }: SidebarProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status on mount and when storage changes
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken');
      setIsAuthenticated(!!authToken);
    };

    checkAuth();

    // Listen for storage changes (for logout in other tabs)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setIsOpen(false);
  };

  // Collapsed state
  if (collapsed) {
    if (!isAuthenticated) {
      return (
        <div className="border-t border-sidebar-border">
          {/* Google 로그인 버튼 */}
          <div className="p-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/login">
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <GoogleIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Google로 로그인</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* 설정 링크 */}
          <div className="px-4 pb-4">
            <TooltipProvider>
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
            </TooltipProvider>
          </div>
        </div>
      );
    }

    return (
      <div className="border-t border-sidebar-border">
        <div className="p-4">
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
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <div className="absolute bottom-16 left-16 z-50 w-56 rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95">
                <Link href="/profile" onClick={() => setIsOpen(false)}>
                  <button className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                    <User className="mr-2 h-4 w-4" />
                    <span>프로필 보기</span>
                  </button>
                </Link>
                <div className="h-px my-1 bg-border" />
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
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

        {/* 설정 링크 - 로그인 상태에서도 항상 표시 */}
        <div className="px-4 pb-4">
          <TooltipProvider>
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
          </TooltipProvider>
        </div>
      </div>
    );
  }

  // Expanded state - not authenticated
  if (!isAuthenticated) {
    return (
      <div className="border-t border-sidebar-border">
        {/* Google 로그인 버튼 */}
        <div className="p-4">
          <Link href="/login">
            <Button variant="default" className="w-full justify-start h-10">
              <GoogleIcon className="mr-3 h-4 w-4" />
              Google로 로그인
            </Button>
          </Link>
        </div>

        {/* 설정 링크 */}
        <div className="px-4 pb-4">
          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start h-10">
              <Settings className="mr-3 h-4 w-4" />
              설정
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Expanded state - authenticated
  return (
    <div className="border-t border-sidebar-border">
      <div className="p-4 space-y-1">
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
              className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
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

      {/* 설정 링크 - 로그인 상태에서도 항상 표시 */}
      <div className="px-4 pb-4">
        <Link href="/settings">
          <Button variant="ghost" className="w-full justify-start h-10">
            <Settings className="mr-3 h-4 w-4" />
            설정
          </Button>
        </Link>
      </div>
    </div>
  );
}
