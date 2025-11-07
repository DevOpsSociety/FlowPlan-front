'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { ChevronUp, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLoginButton, UserProfile } from '@/features/auth/components/GoogleLoginButton';

interface SidebarProfileProps {
  collapsed: boolean;
}

export function SidebarProfile({ collapsed }: SidebarProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  // Check auth status on mount and when storage changes
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (authToken && storedUser) {
        setIsAuthenticated(true);
        // setUser(JSON.parse(storedUser));
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setIsOpen(false);
  };

  const handleLoginSuccess = (loggedInUser: UserProfile, token: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setIsAuthenticated(true);
    setUser(loggedInUser);
    router.refresh();
  };

  const handleLoginError = () => {
    alert('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
  };
  // 1. 사이드바가 축소된 상태
  if (collapsed) {
    if (!isAuthenticated) {
      return (
        <div className="border-t border-sidebar-border">
          <div className="p-4">
            <GoogleLoginButton
              collapsed={true}
              onLoginSuccess={handleLoginSuccess}
              onLoginError={handleLoginError}
            />
          </div>

          <div className="px-4 pb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-full" asChild>
                    <Link href="/settings">
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">설정</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">설정</TooltipContent>
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
                    <AvatarImage alt={user?.name} />
                    <AvatarFallback>
                      {user?.name ? user.name[0].toUpperCase() : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{user?.name || '프로필'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isOpen && (
            <div className="mt-1 space-y-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-full" asChild>
                      <Link href="/profile">
                        <User className="h-4 w-4" />
                        <span className="sr-only">프로필</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">프로필</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-full" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      <span className="sr-only">로그아웃</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">로그아웃</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        <div className="px-4 pb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full" asChild>
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">설정</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">설정</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="border-t border-sidebar-border">
        {/* Google 로그인 버튼 */}
        <div className="p-4">
          <GoogleLoginButton
            collapsed={false}
            onLoginSuccess={handleLoginSuccess}
            onLoginError={handleLoginError}
          />
        </div>

        <div className="px-4 pb-4">
          <Button variant="ghost" className="w-full justify-start gap-3 px-2" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
              <span>설정</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-sidebar-border">
      <div className="p-4 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start h-auto py-2 px-2 hover:bg-accent"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-8 w-8">
              <AvatarImage alt={user?.name} />
              <AvatarFallback>
                {user?.name ? user.name[0].toUpperCase() : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium leading-none">{user?.name || '사용자 이름'}</p>
              <p className="text-xs text-muted-foreground mt-1">{user?.email || '이메일'}</p>
            </div>
            <ChevronUp
              className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
            />
          </div>
        </Button>

        {isOpen && (
          <div className="mt-1 space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-3 px-2" asChild>
              <Link href="/profile">
                <User className="h-4 w-4" />
                <span>프로필</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>로그아웃</span>
            </Button>
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <Button variant="ghost" className="w-full justify-start gap-3 px-2" asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4" />
            <span>설정</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
