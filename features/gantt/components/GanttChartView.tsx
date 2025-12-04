'use client';

import { CreateTaskDto } from '@/shared/api/taskTypes';
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from '@/shared/hooks/queries/useTaskQuery';
import { useToast } from '@/shared/hooks/useToast';
import { svarToApiUpdate } from '@/shared/lib/taskAdapters';
import { Button } from '@/shared/ui/button';
import { Locale } from '@svar-ui/react-core';
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
import { format } from 'date-fns';
import { Calendar, CalendarDays, Plus, RefreshCw } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { GanttChartSkeleton } from '../skeletons/GanttChartSkeleton';

// SVAR Gantt 한국어 Localization (공식 문서 전체 키 포함)
const koreanLocale = {
  calendar: {
    monthFull: [
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
    monthShort: [
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
    dayFull: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    dayShort: ['일', '월', '화', '수', '목', '금', '토'],
    hours: '시간',
    minutes: '분',
    done: '완료',
    clear: '지우기',
    today: '오늘',
    am: ['오전', '오전'],
    pm: ['오후', '오후'],
    weekStart: 7,
    clockFormat: 24,
  },
  core: {
    ok: '확인',
    cancel: '취소',
    select: '선택',
    'No data': '데이터 없음',
  },
  formats: {
    dateFormat: '%Y.%m.%d',
    timeFormat: '%H:%i',
  },
  lang: 'ko-KR',
  gantt: {
    // Header / sidebar
    'Task name': '작업명',
    'Start date': '시작일',
    Duration: '기간',
    Task: '작업',
    Milestone: '마일스톤',
    'Summary task': '요약 작업',
    // Sidebar
    Save: '저장',
    Delete: '삭제',
    Name: '이름',
    Description: '설명',
    'Select type': '유형 선택',
    Type: '유형',
    'End date': '종료일',
    Progress: '진행률',
    Predecessors: '선행 작업',
    Successors: '후행 작업',
    'Add task name': '작업명 추가',
    'Add description': '설명 추가',
    'Select link type': '링크 유형 선택',
    'End-to-start': '종료-시작',
    'Start-to-start': '시작-시작',
    'End-to-end': '종료-종료',
    'Start-to-end': '시작-종료',
    // Context menu / toolbar
    Add: '추가',
    'Child task': '하위 작업',
    'Task above': '위에 작업',
    'Task below': '아래에 작업',
    'Convert to': '변환',
    Edit: '편집',
    Cut: '잘라내기',
    Copy: '복사',
    Paste: '붙여넣기',
    Move: '이동',
    Up: '위로',
    Down: '아래로',
    Indent: '들여쓰기',
    Outdent: '내어쓰기',
    'Split task': '작업 분할',
    // Toolbar
    'New task': '새 작업',
    'Move up': '위로 이동',
    'Move down': '아래로 이동',
  },
};

export function GanttChartView() {
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();
  const apiRef = useRef<IApi | null>(null);

  // API에서 작업 목록 조회 (이미 SVAR 형식으로 변환됨)
  const { data: tasks = [], isLoading, error, refetch } = useTasks(projectId);

  // 데이터 호출 확인용 콘솔 로그
  console.log('📅 [간트차트] 작업 데이터 조회:', {
    projectId,
    totalTasks: tasks.length,
    tasks,
    isLoading,
    error,
  });

  // Mutations
  const createTaskMutation = useCreateTask(projectId);
  const updateTaskMutation = useUpdateTask(projectId);
  const deleteTaskMutation = useDeleteTask(projectId);

  // API 초기화 상태 추적
  const [apiInitialized, setApiInitialized] = useState(false);

  // 뷰 모드 (일별/월별)
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');

  // 간트차트 스케일 설정 (한국어 날짜 형식)
  const scales = useMemo(() => {
    if (viewMode === 'day') {
      return [
        {
          unit: 'month',
          step: 1,
          format: (date: Date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`,
        },
        { unit: 'day', step: 1, format: 'd' },
      ];
    } else {
      return [
        { unit: 'year', step: 1, format: (date: Date) => `${date.getFullYear()}년` },
        { unit: 'month', step: 1, format: (date: Date) => `${date.getMonth() + 1}월` },
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

  // 작업 추가 핸들러
  const handleAddTask = () => {
    const today = new Date();

    const newTask: CreateTaskDto = {
      name: '새 작업',
      startDate: format(today, 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'), // duration=1이 되도록 시작일과 같게 설정
      status: 'TODO',
      progress: 0,
    };

    createTaskMutation.mutate(newTask);
  };

  // 모두 펼치기
  const handleExpandAll = () => {
    if (!apiRef.current) return;
    const state = apiRef.current.getState();
    const allTasks = state.tasks.serialize();

    allTasks.forEach((task: any) => {
      if (!task.open) {
        apiRef.current?.exec('open-task', { id: task.id, mode: true });
      }
    });
  };

  // 모두 접기
  const handleCollapseAll = () => {
    if (!apiRef.current) return;
    const state = apiRef.current.getState();
    const allTasks = state.tasks.serialize();

    allTasks.forEach((task: any) => {
      if (task.open) {
        apiRef.current?.exec('open-task', { id: task.id, mode: false });
      }
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
      // SVAR의 duration은 무시하고, start와 end로부터 올바른 duration 계산
      // duration = (end - start) + 1 (포함적 일수 계산)
      if (updatedTask.start && updatedTask.end) {
        const startDate = new Date(updatedTask.start);
        const endDate = new Date(updatedTask.end);
        const daysDiff = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        updatedTask.duration = daysDiff + 1; // 포함적 계산

        console.log('Duration 재계산:', {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          daysDiff,
          duration: updatedTask.duration,
        });
      }

      const updates = svarToApiUpdate(updatedTask);
      updateTaskMutation.mutate({ taskId, updates });
    }
  };

  // 작업 삭제 이벤트
  const handleDeleteTask = (ev: any) => {
    console.log('작업 삭제됨:', ev);
    // ev가 객체이면 id 속성 사용, 아니면 ev 자체를 id로 사용
    const taskId = typeof ev === 'object' ? ev.id : ev;

    if (taskId) {
      // ID를 숫자로 변환하여 전송
      deleteTaskMutation.mutate(Number(taskId));
    }
  };

  // 작업 추가 이벤트 (ContextMenu 등에서 발생)
  const handleAddTaskEvent = (ev: any) => {
    console.log('작업 추가됨 (이벤트):', ev);
    // Toolbar의 + 버튼은 handleAddTask를 통해 직접 API를 호출하므로,
    // 여기서는 ContextMenu 등을 통해 UI에 먼저 추가된 경우를 처리합니다.

    // 이미 ID가 있는 경우 (백엔드에서 온 데이터 로딩 시) 무시해야 하지만,
    // onaddtask는 보통 사용자 액션에 의해서만 발생함.
    // 하지만 안전을 위해 확인 필요. SVAR 임시 ID는 보통 숫자나 'new...' 형식이 아님.

    // API 호출
    const newTask: CreateTaskDto = {
      name: ev.text || '새 작업',
      startDate: ev.start_date
        ? format(new Date(ev.start_date), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      endDate: ev.end_date
        ? format(new Date(ev.end_date), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      status: 'TODO',
      progress: ev.progress || 0,
      // parent가 0이 아니면 parentId 설정 (SVAR에서 루트는 0)
      parentId: ev.parent && ev.parent !== 0 && ev.parent !== '0' ? Number(ev.parent) : undefined,
    };

    // 임시로 추가된 태스크는 리액트 쿼리 refetch 시 백엔드 데이터로 교체됨
    createTaskMutation.mutate(newTask);
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
    return <GanttChartSkeleton />;
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
    <Locale words={koreanLocale}>
      <div className="space-y-4">
        {/* 간트차트 컨트롤 */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">간트차트</h3>
          <div className="flex items-center space-x-2">
            {/* 1. 새로고침 */}
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>

            {/* 2. 일별/월별 */}
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

            {/* 3. 모두 펼치기 */}
            {/* <Button onClick={handleExpandAll} variant="outline" size="sm">
              <ChevronsDown className="h-4 w-4 mr-2" />
              모두 펼치기
            </Button> */}

            {/* 4. 모두 접기 */}
            {/* <Button onClick={handleCollapseAll} variant="outline" size="sm">
              <ChevronsUp className="h-4 w-4 mr-2" />
              모두 접기
            </Button> */}

            {/* 5. 작업 추가 */}
            <Button onClick={handleAddTask} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              작업 추가
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
                  items={[
                    ...defaultEditorItems
                      .filter(
                        (item: { key: string }) =>
                          item.key !== 'details' && item.key !== 'type' && item.key !== 'duration' // duration 필드 제거 - start/end로 자동 계산
                      )
                      .map((item: any) => {
                        // 한국어 label 적용
                        const koreanLabels: Record<string, string> = {
                          text: '작업명',
                          start: '시작일',
                          end: '종료일',
                          progress: '진행률 (%)',
                          links: '연결된 작업',
                        };
                        return {
                          ...item,
                          label: koreanLabels[item.key] || item.label,
                        };
                      }),
                    // Assignee 필드 추가
                    {
                      key: 'assignee',
                      type: 'text',
                      label: '담당자',
                    },
                  ]}
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
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onAddTask={handleAddTaskEvent}
                onMoveTask={handleMoveTask}
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
    </Locale>
  );
}
