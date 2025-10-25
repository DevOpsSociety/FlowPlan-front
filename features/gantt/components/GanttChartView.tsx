'use client';

import { useToast } from '@/shared/hooks/useToast';
import type { Task } from '@/shared/lib/apiTypes';
import { mockHierarchicalTasks } from '@/shared/lib/mockGanttData';
import { getCurrentProject, saveProject, type StoredProject } from '@/shared/lib/storage';
import { toGanttTask, convertGanttTasksToHierarchical } from '@/shared/lib/taskAdapters';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import type { Task as GanttTask } from 'gantt-task-react';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Save } from 'lucide-react';
import { useState } from 'react';

// 계층 구조 Task를 평탄화하고 GanttTask로 변환
const convertToGanttTasks = (tasks: Task[]): GanttTask[] => {
  const result: GanttTask[] = [];

  const traverse = (taskList: Task[], parentId?: string) => {
    for (const task of taskList) {
      result.push(toGanttTask(task, parentId));
      if (task.subtasks && task.subtasks.length > 0) {
        traverse(task.subtasks, task.task_id);
      }
    }
  };

  traverse(tasks);
  return result;
};

// 커스텀 헤더 컴포넌트 (Name만 표시)
const TaskListHeader = () => {
  return (
    <div
      style={{
        display: 'flex',
        height: '50px',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderBottom: '2px solid #e5e7eb',
        fontWeight: 600,
        fontSize: '14px',
      }}
    >
      <div style={{ minWidth: '200px', width: '200px', padding: '0 12px' }}>Name</div>
    </div>
  );
};

interface GanttChartViewProps {
  projectId: string;
}

export function GanttChartView({ projectId: _projectId }: GanttChartViewProps) {
  const [viewModeString, setViewModeString] = useState<string>('Day');
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // 로컬 상태로 관리할 작업 데이터 (수정사항이 여기에 반영됨)
  const [localTasks, setLocalTasks] = useState<GanttTask[]>(() =>
    convertToGanttTasks(mockHierarchicalTasks)
  );

  // 수정사항 추적
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 저장 핸들러 - 저장 버튼 클릭 시에만 실행
  const handleSaveGantt = () => {
    try {
      console.log('=== 간트차트 저장 데이터 ===');
      console.log('저장할 작업 목록:', localTasks);
      console.log('총 작업 수:', localTasks.length);
      console.log('수정된 작업들:');
      localTasks.forEach((task) => {
        console.log(`- [${task.id}] ${task.name}:`, {
          start: task.start,
          end: task.end,
          progress: task.progress,
          type: task.type,
        });
      });
      console.log('===========================');

      const currentProject = getCurrentProject();
      if (currentProject) {
        // localTasks(GanttTask[])를 계층 구조의 Task[]로 역변환
        const convertedTasks = convertGanttTasksToHierarchical(localTasks, mockHierarchicalTasks);

        const updatedProject: StoredProject = {
          ...currentProject,
          wbsTasks: convertedTasks,
          updatedAt: new Date().toISOString(),
        };
        saveProject(updatedProject);

        setHasUnsavedChanges(false);

        toast({
          title: '간트차트가 저장되었습니다',
          description: `${localTasks.length}개의 작업이 저장되었습니다. (콘솔 확인)`,
        });
      } else {
        toast({
          title: '저장할 프로젝트가 없습니다',
          description: '프로젝트를 먼저 생성해주세요.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('저장 오류:', error);
      toast({
        title: '저장 실패',
        description: '간트차트 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 접힌 프로젝트의 모든 하위 작업 ID 수집
  const getCollapsedTaskIds = () => {
    const hiddenIds = new Set<string>();
    collapsedTasks.forEach((collapsedId) => {
      localTasks.forEach((task) => {
        // task.project가 접힌 프로젝트 ID와 일치하면 숨김
        if (task.project === collapsedId) {
          hiddenIds.add(task.id);
        }
      });
    });
    return hiddenIds;
  };

  const hiddenTaskIds = getCollapsedTaskIds();

  // 접힌 작업의 하위 작업 필터링
  const ganttTaskList: GanttTask[] = localTasks
    .filter((task) => {
      // 자신의 ID가 hiddenTaskIds에 있으면 숨김
      if (hiddenTaskIds.has(task.id)) {
        return false;
      }
      return true;
    })
    .map((task) => {
      // task가 project이고 collapsed 상태면 hideChildren = true
      if (task.type === 'project' && collapsedTasks.has(task.id)) {
        return { ...task, hideChildren: true };
      }
      return task;
    });

  // 문자열을 ViewMode enum으로 변환
  const viewMode = ViewMode[viewModeString as keyof typeof ViewMode];

  // 커스텀 테이블 컴포넌트 (Name만 표시, 접기/펼치기 기능 포함)
  const TaskListTable = ({
    tasks,
    rowHeight,
    onExpanderClick,
  }: {
    tasks: GanttTask[];
    rowHeight: number;
    onExpanderClick: (task: GanttTask) => void;
  }) => {
    return (
      <div>
        {tasks.map((task) => {
          const isProject = task.type === 'project';
          const isMilestone = task.type === 'milestone';
          const isCollapsed = task.hideChildren === true;

          return (
            <div
              key={task.id}
              style={{
                display: 'flex',
                height: `${rowHeight}px`,
                alignItems: 'center',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: isProject ? '#f9fafb' : '#ffffff',
                fontSize: '13px',
                cursor: isProject ? 'pointer' : 'default',
              }}
              onClick={isProject ? () => onExpanderClick(task) : undefined}
            >
              <div
                style={{
                  minWidth: '200px',
                  width: '200px',
                  padding: '0 12px',
                  paddingLeft: isProject ? '12px' : isMilestone ? '24px' : '36px',
                  fontWeight: isProject ? 600 : 400,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={task.name}
              >
                {isProject && (isCollapsed ? '▶ ' : '▼ ')}
                {isMilestone && '◆ '}
                {task.name}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 접기/펼치기 토글 핸들러
  const handleExpanderClick = (task: GanttTask) => {
    setCollapsedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(task.id)) {
        newSet.delete(task.id);
      } else {
        newSet.add(task.id);
      }
      return newSet;
    });
  };

  // 간트차트에서 날짜 변경 시 (드래그) - 로컬 상태만 업데이트
  const handleTaskChange = (task: GanttTask) => {
    console.log('날짜 변경됨 (미저장):', task);
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, start: task.start, end: task.end } : t))
    );
    setHasUnsavedChanges(true);
  };

  // 진행률 변경 시 - 로컬 상태만 업데이트
  const handleProgressChange = (task: GanttTask) => {
    console.log('진행률 변경됨 (미저장):', task);
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, progress: task.progress } : t))
    );
    setHasUnsavedChanges(true);
  };

  // 날짜 더블클릭 시 (확장 기능 - 옵션)
  const handleDoubleClick = (task: GanttTask) => {
    console.log('Task double clicked:', task);
  };

  // 작업 선택 시
  const handleSelect = (task: GanttTask, isSelected: boolean) => {
    console.log('Task selected:', task, isSelected);
  };

  return (
    <div className="space-y-4">
      {/* 간트차트 컨트롤 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">간트차트</h3>
        <div className="flex items-center space-x-2">
          <Select value={viewModeString} onValueChange={setViewModeString}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hour">시간별</SelectItem>
              <SelectItem value="QuarterDay">6시간별</SelectItem>
              <SelectItem value="HalfDay">반일별</SelectItem>
              <SelectItem value="Day">일별</SelectItem>
              <SelectItem value="Week">주별</SelectItem>
              <SelectItem value="Month">월별</SelectItem>
              <SelectItem value="Year">년별</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSaveGantt} variant={hasUnsavedChanges ? 'default' : 'outline'}>
            <Save className="h-4 w-4 mr-2" />
            저장{hasUnsavedChanges ? ' *' : ''}
          </Button>
        </div>
      </div>

      {/* 간트차트 */}
      <div className="border rounded-lg bg-card p-6 overflow-x-auto">
        {ganttTaskList.length > 0 ? (
          <Gantt
            tasks={ganttTaskList}
            viewMode={viewMode}
            onDateChange={handleTaskChange}
            onProgressChange={handleProgressChange}
            onDoubleClick={handleDoubleClick}
            onSelect={handleSelect}
            listCellWidth="200px"
            columnWidth={viewMode === ViewMode.Month ? 300 : 65}
            locale="ko"
            todayColor="rgba(252, 248, 227, 0.5)"
            barProgressColor="#3b82f6"
            barBackgroundColor="#60a5fa"
            barBackgroundSelectedColor="#2563eb"
            arrowColor="#94a3b8"
            arrowIndent={20}
            TaskListHeader={TaskListHeader}
            TaskListTable={(props) => (
              <TaskListTable {...props} onExpanderClick={handleExpanderClick} />
            )}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            작업이 없습니다. WBS 테이블에서 작업을 추가해주세요.
          </div>
        )}
      </div>

      {/* 범례 및 도움말 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="text-xs">
          💡 막대를 드래그하여 일정 조정, 진행률 바를 드래그하여 진행률 수정
        </div>
      </div>
    </div>
  );
}
