'use client';

import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from '@/shared/hooks/queries/useTaskQuery';
import { Button } from '@/shared/ui/button';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { useParams } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useContextMenu } from '../hooks/useContextMenu';
import { useGanttChart } from '../hooks/useGanttChart';
import { useGanttEvents } from '../hooks/useGanttEvents';
import { useGanttLocale } from '../hooks/useGanttLocale';
import { GanttChartSkeleton } from '../skeletons/GanttChartSkeleton';
import { apiTaskToDhtmlx } from '../utils/ganttTransformers';
import { GanttCanvas } from './GanttCanvas';
import { GanttToolbar } from './GanttToolbar';

/**
 * 간트 차트 뷰 컴포넌트
 * - 프로젝트의 작업들을 간트 차트로 시각화
 * - 작업 추가/수정/삭제
 * - 일별/월별 뷰 전환
 * - 드래그 앤 드롭으로 일정 조정
 */
export function GanttChartView() {
  const params = useParams();
  const projectId = params.id as string;
  const containerRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');

  // API 데이터
  const { data: apiTasks = [], isLoading, error, refetch } = useTasks(projectId);
  const tasks = useMemo(() => apiTasks.map(apiTaskToDhtmlx), [apiTasks]);

  // Mutations (useRef로 최신 값 유지)
  const createTaskMutation = useCreateTask(projectId);
  const updateTaskMutation = useUpdateTask(projectId);
  const deleteTaskMutation = useDeleteTask(projectId);

  const createMutationRef = useRef(createTaskMutation);
  createMutationRef.current = createTaskMutation;

  const updateMutationRef = useRef(updateTaskMutation);
  updateMutationRef.current = updateTaskMutation;

  // 커스텀 훅들
  useGanttLocale();
  const { contextMenu, setContextMenu, closeContextMenu } = useContextMenu();

  // 로딩 완료 후에만 Gantt 초기화
  const shouldInitGantt = !isLoading && tasks.length >= 0;
  useGanttChart(containerRef, tasks, viewMode, shouldInitGantt);
  useGanttEvents(projectId, createMutationRef, updateMutationRef, setContextMenu);

  // 액션 핸들러
  const handleAddTask = useCallback(() => {
    gantt.createTask();
  }, []);

  const handleEditTask = useCallback(() => {
    if (contextMenu.taskId) gantt.showLightbox(contextMenu.taskId);
    closeContextMenu();
  }, [contextMenu.taskId, closeContextMenu]);

  const handleDeleteTask = useCallback(() => {
    if (contextMenu.taskId && window.confirm('이 작업을 삭제하시겠습니까?')) {
      deleteTaskMutation.mutate(Number(contextMenu.taskId), {
        onSuccess: () => {
          gantt.deleteTask(contextMenu.taskId!);
          toast.success('작업이 삭제되었습니다');
        },
      });
    }
    closeContextMenu();
  }, [contextMenu.taskId, closeContextMenu, deleteTaskMutation]);

  const handleRefresh = useCallback(() => {
    refetch();
    toast.success('데이터를 새로고침했습니다');
  }, [refetch]);

  if (isLoading) return <GanttChartSkeleton />;

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
      <GanttToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddTask={handleAddTask}
        onRefresh={handleRefresh}
      />
      <GanttCanvas
        containerRef={containerRef}
        tasks={tasks}
        contextMenu={contextMenu}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onCloseMenu={closeContextMenu}
      />
      <div className="text-xs text-muted-foreground">
        💡 더블클릭으로 작업 편집, 막대를 드래그하여 일정 조정, 우클릭으로 컨텍스트 메뉴
      </div>
    </div>
  );
}
