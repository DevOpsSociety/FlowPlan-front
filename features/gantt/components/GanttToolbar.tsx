import { Button } from '@/shared/ui/button';
import { Calendar, CalendarDays, Plus, RefreshCw } from 'lucide-react';

interface GanttToolbarProps {
  viewMode: 'day' | 'month';
  onViewModeChange: (mode: 'day' | 'month') => void;
  onAddTask: () => void;
  onRefresh: () => void;
}

/**
 * 간트 차트 툴바 컴포넌트
 * - 제목
 * - 뷰 모드 전환 (일별/월별)
 * - 작업 추가 버튼
 */
export function GanttToolbar({
  viewMode,
  onViewModeChange,
  onAddTask,
  onRefresh,
}: GanttToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">간트차트</h3>
      <div className="flex items-center space-x-2">
        <div className="flex items-center border rounded-md">
          <Button
            onClick={() => onViewModeChange('day')}
            variant={viewMode === 'day' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-r-none"
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            일별
          </Button>
          <Button
            onClick={() => onViewModeChange('month')}
            variant={viewMode === 'month' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-l-none"
          >
            <Calendar className="h-4 w-4 mr-2" />
            월별
          </Button>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          새로고침
        </Button>
        <Button onClick={onAddTask} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          작업 추가
        </Button>
      </div>
    </div>
  );
}
