'use client';

import { useToast } from '@/shared/hooks/useToast';
import { svarToApiUpdate } from '@/shared/lib/taskAdapters';
import { Button } from '@/shared/ui/button';
import {
  ContextMenu,
  defaultEditorItems,
  defaultToolbarButtons,
  Editor,
  Gantt,
  Toolbar,
  Willow,
  type IApi,
} from '@svar-ui/react-gantt';
import '@svar-ui/react-gantt/all.css';
import { Calendar, CalendarDays, RefreshCw } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { useDeleteTask, useTasks, useUpdateTask } from '@/shared/hooks/queries/useTaskQuery';

export function GanttChartView() {
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();
  const apiRef = useRef<IApi | null>(null);

  // API에서 작업 목록 조회 (이미 SVAR 형식으로 변환됨)
  const { data: tasks = [], isLoading, error, refetch } = useTasks(projectId);

  console.log('tasks', tasks);

  // Mutations
  const updateTaskMutation = useUpdateTask(projectId);
  const deleteTaskMutation = useDeleteTask(projectId);

  // API 초기화 상태 추적
  const [apiInitialized, setApiInitialized] = useState(false);

  // 뷰 모드 (일별/월별)
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');

  // 뷰 모드에 따른 스케일 설정
  const scales = useMemo(() => {
    if (viewMode === 'day') {
      return [
        { unit: 'month', step: 1, format: 'MMMM yyyy' },
        { unit: 'day', step: 1, format: 'd' },
      ];
    } else {
      return [
        { unit: 'year', step: 1, format: 'yyyy' },
        { unit: 'month', step: 1, format: 'MMM' },
      ];
    }
  }, [viewMode]);

  // 뷰 모드에 따른 셀 너비
  const cellWidth = viewMode === 'month' ? 120 : 50;

  // Toolbar 버튼 필터링 (add-task 제거)
  const toolbarItems = useMemo(() => {
    return defaultToolbarButtons.filter((button) => button.id !== 'add-task');
  }, []);

  // API 초기화
  const handleInit = (api: IApi) => {
    apiRef.current = api;
    setApiInitialized(true);
    console.log('SVAR Gantt API initialized:', api);
  };

  // 데이터 새로고침
  const handleRefresh = () => {
    refetch();
    toast({
      title: '데이터를 새로고침했습니다',
      description: '최신 데이터를 불러왔습니다.',
    });
  };

  // 작업 업데이트 이벤트
  const handleUpdateTask = (ev: any) => {
    console.log('작업 업데이트됨:', ev);

    // 변경된 작업의 ID와 데이터 추출
    const taskId = ev.id;
    const state = apiRef.current?.getState();
    const allTasks = state?.tasks.serialize();
    const updatedTask = allTasks?.find((t: any) => t.id === taskId);

    if (updatedTask) {
      const updates = svarToApiUpdate(updatedTask);
      updateTaskMutation.mutate({ taskId, updates });
    }
  };

  // 작업 삭제 이벤트
  const handleDeleteTask = (ev: any) => {
    console.log('작업 삭제됨:', ev);
    const taskId = ev.id;

    if (taskId) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  // 작업 이동 이벤트 (드래그앤드롭)
  const handleMoveTask = (ev: any) => {
    console.log('작업 이동됨:', ev);

    const taskId = ev.id;
    const state = apiRef.current?.getState();
    const allTasks = state?.tasks.serialize();
    const movedTask = allTasks?.find((t: any) => t.id === taskId);

    if (movedTask) {
      const updates = svarToApiUpdate(movedTask);
      updateTaskMutation.mutate({ taskId, updates });
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-destructive">데이터를 불러오는 중 오류가 발생했습니다</div>
        <div className="text-sm text-muted-foreground">{error.message}</div>
        <Button onClick={() => refetch()} variant="outline">
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 간트차트 컨트롤 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">간트차트</h3>
        <div className="flex items-center space-x-2">
          {/* 뷰 모드 전환 버튼 */}
          <div className="flex items-center border rounded-md">
            <Button
              onClick={() => setViewMode('day')}
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-r-none"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              일별
            </Button>
            <Button
              onClick={() => setViewMode('month')}
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-l-none"
            >
              <Calendar className="h-4 w-4 mr-2" />
              월별
            </Button>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>

      {/* SVAR Gantt 차트 */}
      <div className="border rounded-lg bg-card overflow-hidden">
        <Willow>
          <ContextMenu api={apiRef.current || undefined}>
            {apiInitialized && apiRef.current && (
              <Toolbar api={apiRef.current} items={toolbarItems} />
            )}
            {apiInitialized && apiRef.current && (
              <Editor
                api={apiRef.current}
                items={defaultEditorItems.filter(
                  (item: { key: string }) => item.key !== 'details' && item.key !== 'type'
                )}
              />
            )}
            <Gantt
              tasks={tasks}
              links={[]}
              columns={[
                { id: 'text', header: '작업명' },
                { id: 'action', header: '', width: 50, align: 'center' },
              ]}
              scales={scales}
              cellWidth={cellWidth}
              init={handleInit}
              onupdatetask={handleUpdateTask}
              ondeletetask={handleDeleteTask}
              onmovetask={handleMoveTask}
            />
          </ContextMenu>
        </Willow>
      </div>

      {/* 도움말 */}
      <div className="text-xs text-muted-foreground">
        💡 툴바의 + 버튼으로 작업 추가, 막대를 드래그하여 일정 조정, 진행률 바를 드래그하여 진행률
        수정
      </div>
    </div>
  );
}
