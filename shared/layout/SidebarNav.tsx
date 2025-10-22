'use client';

import Link from 'next/link';
import { Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/shared/ui/tooltip';

interface SidebarNavProps {
  collapsed: boolean;
}

const mainMenuItems = [
  {
    icon: Plus,
    label: '새 프로젝트 생성',
    href: '/new-project',
  },
  {
    icon: FolderOpen,
    label: '프로젝트 목록',
    href: '/projects',
  },
];

export function SidebarNav({ collapsed }: SidebarNavProps) {
  return (
    <TooltipProvider>
      <nav className="flex-1 p-4 space-y-2">
        {mainMenuItems.map((item, index) => {
          const Icon = item.icon;

          if (collapsed) {
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <Icon className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link key={index} href={item.href}>
              <Button variant="ghost" className="w-full justify-start h-10">
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
