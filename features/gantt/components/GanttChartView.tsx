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
import { Calendar, CalendarDays, Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GanttChartSkeleton } from '../skeletons/GanttChartSkeleton';

// dhtmlx-gantt 타입 정의
interface DhtmlxTask {
  id: number;
  text: string;
  start_date: string;
  duration: number;
  progress: number;
  parent?: number;
  open?: boolean;
}

// 컨텍스트 메뉴 상태 타입
interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  taskId: number | null;
}

/**
 * API 원본 데이터(TaskFlatDto) → dhtmlx-gantt 형식 변환
 */
const apiTaskToDhtmlx = (apiTask: any): DhtmlxTask => {
  const startDate = new Date(apiTask.start);
  const formattedDate = `${startDate.getDate().toString().padStart(2, '0')}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getFullYear()}`;

  return {
    id: apiTask.id,
    text: apiTask.name,
    start_date: formattedDate,
    duration: apiTask.duration || 1,
    progress: (apiTask.progress || 0) / 100,
    parent: apiTask.parent || 0,
    open: true,
  };
};

/**
 * dhtmlx-gantt 날짜 → API 형식 변환 (YYYY-MM-DD)
 */
const dhtmlxDateToApi = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;
};

export function GanttChartView() {
  const params = useParams();
  const projectId = params.id as string;
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttInitialized = useRef(false);

  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    taskId: null,
  });

  // API 데이터
  const { data: apiTasks = [], isLoading, error, refetch } = useTasks(projectId);
  const tasks: DhtmlxTask[] = useMemo(() => apiTasks.map(apiTaskToDhtmlx), [apiTasks]);

  // Mutations (useRef로 최신 값 유지)
  const createTaskMutation = useCreateTask(projectId);
  const updateTaskMutation = useUpdateTask(projectId);
  const deleteTaskMutation = useDeleteTask(projectId);

  const createMutationRef = useRef(createTaskMutation);
  createMutationRef.current = createTaskMutation;

  const updateMutationRef = useRef(updateTaskMutation);
  updateMutationRef.current = updateTaskMutation;

  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    const handleDocumentClick = () => closeContextMenu();
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [closeContextMenu]);

  // dhtmlx-gantt 초기화 (한 번만 실행)
  useEffect(() => {
    if (!containerRef.current || ganttInitialized.current) return;

    gantt.i18n.setLocale({
      date: {
        month_full: [
          '1월',
          '2월',
          '3월',
          '4월',
          '5월',
          '6월',
          '7월',
          '8월',
          '9월',
          '10월',
          '11월',
          '12월',
        ],
        month_short: [
          '1월',
          '2월',
          '3월',
          '4월',
          '5월',
          '6월',
          '7월',
          '8월',
          '9월',
          '10월',
          '11월',
          '12월',
        ],
        day_full: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
        day_short: ['일', '월', '화', '수', '목', '금', '토'],
      },
      labels: {
        new_task: '새 작업',
        icon_save: '저장',
        icon_cancel: '취소',
        icon_details: '상세',
        icon_edit: '편집',
        icon_delete: '삭제',
        confirm_closing: '변경사항이 저장되지 않습니다. 계속하시겠습니까?',
        confirm_deleting: '작업이 영구적으로 삭제됩니다. 계속하시겠습니까?',
        section_description: '설명',
        section_time: '기간',
        section_type: '유형',
        column_wbs: 'WBS',
        column_text: '작업명',
        column_start_date: '시작일',
        column_duration: '기간',
        column_add: '',
        type_task: '작업',
        type_project: '프로젝트',
        type_milestone: '마일스톤',
        minutes: '분',
        hours: '시간',
        days: '일',
        weeks: '주',
        months: '월',
        years: '년',
      },
    });

    gantt.config.date_format = '%d-%m-%Y';
    gantt.config.xml_date = '%d-%m-%Y';
    gantt.config.readonly = false;
    gantt.config.drag_progress = true;
    gantt.config.drag_resize = true;
    gantt.config.drag_move = true;
    gantt.config.details_on_dblclick = true;
    gantt.config.show_progress = true;

    gantt.config.columns = [
      { name: 'text', label: '작업명', tree: true, width: '*', resize: true },
      { name: 'start_date', label: '시작일', align: 'center', width: 100 },
      {
        name: 'progress',
        label: '진행률',
        align: 'center',
        width: 70,
        template: (task: any) => Math.round(task.progress * 100) + '%',
      },
      { name: 'add', label: '', width: 44 },
    ];

    gantt.config.scales = [
      { unit: 'month', step: 1, format: '%Y년 %m월' },
      { unit: 'day', step: 1, format: '%d' },
    ];

    gantt.init(containerRef.current);
    ganttInitialized.current = true;

    // 우클릭 컨텍스트 메뉴
    gantt.attachEvent('onContextMenu', (taskId: any, linkId: any, event: MouseEvent) => {
      if (taskId) {
        event.preventDefault();
        setContextMenu({ visible: true, x: event.clientX, y: event.clientY, taskId });
        return false;
      }
      return true;
    });

    // 새 작업 생성 시 기본값 설정 (오늘 날짜)
    gantt.attachEvent('onTaskCreated', (task: any) => {
      task.start_date = new Date();
      task.duration = 1;
      task.progress = 0;
      return true;
    });

    // 작업 수정 이벤트 (드래그, 라이트박스 저장 등)
    gantt.attachEvent('onAfterTaskUpdate', (id: any, task: any) => {
      console.log('📝 [Gantt] onAfterTaskUpdate:', { id, task, progress: task.progress });
      const startDateStr = gantt.templates.format_date(task.start_date);
      updateMutationRef.current.mutate({
        taskId: Number(id),
        updates: {
          name: task.text,
          startDate: dhtmlxDateToApi(startDateStr),
          progress: Math.round(task.progress * 100),
        },
      });
    });

    // 작업 추가 이벤트 (API 연동)
    gantt.attachEvent('onAfterTaskAdd', (id: any, task: any) => {
      const startDateStr = gantt.templates.format_date(task.start_date);
      createMutationRef.current.mutate({
        name: task.text,
        startDate: dhtmlxDateToApi(startDateStr),
        endDate: dhtmlxDateToApi(startDateStr),
        progress: Math.round(task.progress * 100),
        status: 'TODO',
      });
    });

    // 초기화 완료 후 현재 데이터 로드
    if (tasksRef.current.length > 0) {
      gantt.parse({ data: tasksRef.current, links: [] });
    }

    return () => {
      gantt.clearAll();
      ganttInitialized.current = false;
    };
  }, [isLoading]);

  // 데이터 로드 (tasks 변경 시 실행)
  useEffect(() => {
    if (!ganttInitialized.current) return;

    gantt.clearAll();
    gantt.parse({ data: tasks, links: [] });
  }, [tasks]);

  // 뷰 모드 변경
  useEffect(() => {
    if (!ganttInitialized.current) return;

    if (viewMode === 'month') {
      gantt.config.scales = [
        { unit: 'year', step: 1, format: '%Y년' },
        { unit: 'month', step: 1, format: '%m월' },
      ];
    } else {
      gantt.config.scales = [
        { unit: 'month', step: 1, format: '%Y년 %m월' },
        { unit: 'day', step: 1, format: '%d' },
      ];
    }
    gantt.config.scale_height = 50;
    gantt.render();
  }, [viewMode]);

  // 작업 추가 (onTaskCreated 이벤트에서 기본값 설정됨)
  const handleAddTask = useCallback(() => {
    gantt.createTask();
  }, []);

  // 편집 (라이트박스)
  const handleEditTask = useCallback(() => {
    if (contextMenu.taskId) gantt.showLightbox(contextMenu.taskId);
    closeContextMenu();
  }, [contextMenu.taskId, closeContextMenu]);

  // 삭제 (API 연동)
  const handleDeleteTask = useCallback(() => {
    if (contextMenu.taskId && window.confirm('이 작업을 삭제하시겠습니까?')) {
      deleteTaskMutation.mutate(Number(contextMenu.taskId), {
        onSuccess: () => {
          gantt.deleteTask(contextMenu.taskId!);
        },
      });
    }
    closeContextMenu();
  }, [contextMenu.taskId, closeContextMenu, deleteTaskMutation]);

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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">간트차트</h3>
        <div className="flex items-center space-x-2">
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
          <Button onClick={handleAddTask} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            작업 추가
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden relative">
        <div
          ref={containerRef}
          style={{ width: '100%', height: `${Math.max(400, tasks.length * 40 + 100)}px` }}
        />

        {contextMenu.visible && (
          <div
            className="fixed bg-popover border border-border rounded-md shadow-lg py-1 z-50 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-accent"
              onClick={handleEditTask}
            >
              ✏️ 편집
            </button>
            <div className="border-t border-border my-1" />
            <button
              className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleDeleteTask}
            >
              🗑️ 삭제
            </button>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        💡 더블클릭으로 작업 편집, 막대를 드래그하여 일정 조정, 우클릭으로 컨텍스트 메뉴
      </div>
    </div>
  );
}
