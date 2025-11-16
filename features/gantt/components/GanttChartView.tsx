'use client';

import { useToast } from '@/shared/hooks/useToast';
import { mockHierarchicalTasks } from '@/shared/lib/mockGanttData';
import { getCurrentProject, saveProject, type StoredProject } from '@/shared/lib/storage';
import { taskToGantt, ganttToTask } from '@/shared/lib/taskAdapters';
import { Button } from '@/shared/ui/button';
import {
  Gantt,
  Toolbar,
  Willow,
  ContextMenu,
  Editor,
  type ITask as SvarTask,
  type IApi,
} from '@svar-ui/react-gantt';
import '@svar-ui/react-gantt/all.css';
import { Save, RefreshCw } from 'lucide-react';
import { useState, useRef } from 'react';

interface GanttChartViewProps {
  projectId: string;
}

export function GanttChartView({ projectId: _projectId }: GanttChartViewProps) {
  const { toast } = useToast();
  const apiRef = useRef<IApi | null>(null);

  // 로컬 상태로 관리할 작업 데이터
  const [localTasks, setLocalTasks] = useState<SvarTask[]>(() => {
    const tasks = taskToGantt(mockHierarchicalTasks);
    console.log('=== SVAR Gantt 초기 데이터 ===');
    console.log('원본 Task 수:', mockHierarchicalTasks.length);
    console.log('변환된 SVAR Task 수:', tasks.length);
    console.log('변환된 데이터:', tasks);
    return tasks;
  });

  // 수정사항 추적
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // API 초기화 상태 추적
  const [apiInitialized, setApiInitialized] = useState(false);

  // API 초기화
  const handleInit = (api: IApi) => {
    apiRef.current = api;
    setApiInitialized(true);
    console.log('SVAR Gantt API initialized:', api);
  };

  // 저장 핸들러
  const handleSaveGantt = () => {
    try {
      if (!apiRef.current) {
        toast({
          title: '저장 실패',
          description: 'Gantt API가 초기화되지 않았습니다.',
          variant: 'destructive',
        });
        return;
      }

      // SVAR API에서 현재 작업 목록 가져오기
      const state = apiRef.current.getState();
      const currentSvarTasks = state.tasks.serialize();

      console.log('=== 간트차트 저장 데이터 ===');
      console.log('저장할 작업 목록:', currentSvarTasks);
      console.log('총 작업 수:', currentSvarTasks.length);

      const currentProject = getCurrentProject();
      if (currentProject) {
        // SVAR Task[]를 계층 구조의 Task[]로 역변환
        const convertedTasks = ganttToTask(currentSvarTasks as SvarTask[], mockHierarchicalTasks);

        const updatedProject: StoredProject = {
          ...currentProject,
          wbsTasks: convertedTasks,
          updatedAt: new Date().toISOString(),
        };
        saveProject(updatedProject);

        setHasUnsavedChanges(false);
        setLocalTasks(currentSvarTasks as SvarTask[]);

        toast({
          title: '간트차트가 저장되었습니다',
          description: `${currentSvarTasks.length}개의 작업이 저장되었습니다.`,
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

  // 데이터 새로고침
  const handleRefresh = () => {
    const freshTasks = taskToGantt(mockHierarchicalTasks);
    setLocalTasks(freshTasks);
    setHasUnsavedChanges(false);
    toast({
      title: '데이터를 새로고침했습니다',
      description: '최신 데이터를 불러왔습니다.',
    });
  };

  // 작업 추가 이벤트
  const handleAddTask = (ev: any) => {
    console.log('작업 추가됨:', ev);
    setHasUnsavedChanges(true);
  };

  // 작업 업데이트 이벤트
  const handleUpdateTask = (ev: any) => {
    console.log('작업 업데이트됨:', ev);
    setHasUnsavedChanges(true);
  };

  // 작업 삭제 이벤트
  const handleDeleteTask = (ev: any) => {
    console.log('작업 삭제됨:', ev);
    setHasUnsavedChanges(true);
  };

  // 작업 이동 이벤트 (드래그앤드롭)
  const handleMoveTask = (ev: any) => {
    console.log('작업 이동됨:', ev);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="space-y-4">
      {/* 간트차트 컨트롤 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">간트차트</h3>
        <div className="flex items-center space-x-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button onClick={handleSaveGantt} variant={hasUnsavedChanges ? 'default' : 'outline'}>
            <Save className="h-4 w-4 mr-2" />
            저장{hasUnsavedChanges ? ' *' : ''}
          </Button>
        </div>
      </div>

      {/* SVAR Gantt 차트 */}
      <div className="border rounded-lg bg-card overflow-hidden" style={{ minHeight: '600px' }}>
        <Willow>
          <ContextMenu api={apiRef.current || undefined}>
            {apiInitialized && apiRef.current && <Toolbar api={apiRef.current} />}
            {apiInitialized && apiRef.current && <Editor api={apiRef.current} />}
            <Gantt
              tasks={localTasks}
              links={[]}
              columns={[
                { id: 'text', header: '작업명' },
                { id: 'action', header: '', width: 50, align: 'center' },
              ]}
              scales={[
                { unit: 'month', step: 1, format: 'MMMM yyyy' },
                { unit: 'day', step: 1, format: 'd' },
              ]}
              init={handleInit}
              onaddtask={handleAddTask}
              onupdatetask={handleUpdateTask}
              ondeletetask={handleDeleteTask}
              onmovetask={handleMoveTask}
            />
          </ContextMenu>
        </Willow>
      </div>

      {/* 도움말 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="text-xs">
          💡 툴바의 + 버튼으로 작업 추가, 막대를 드래그하여 일정 조정, 진행률 바를 드래그하여 진행률
          수정
        </div>
        {hasUnsavedChanges && (
          <div className="text-xs text-orange-500 font-medium">
            * 저장되지 않은 변경사항이 있습니다
          </div>
        )}
      </div>
    </div>
  );
}
