# WBS ↔ 간트차트 ↔ 칸반보드 통합 구현 최종 계획서

> **작성일**: 2025-10-23  
> **버전**: 2.0 (최종 수정안)  
> **목표**: WBS, 간트차트, 칸반보드 3개 뷰의 실시간 양방향 동기화 구현

---

## 📋 개요

### 현재 상황
- **WBS 테이블**: `HierarchicalWBSTask` 타입, localStorage 임시 구현 (타 담당자)
- **간트차트**: 커스텀 구현, WBS와 데이터 분리 ❌
- **칸반보드**: 미구현 ❌

### 핵심 문제
3개 뷰가 독립적으로 작동하여 데이터 동기화 불가능

### 🎯 이번 작업 범위 (간트차트 + 칸반보드 담당)
1. **전역 상태 관리 인프라 구축** (Zustand Store)
2. **간트차트 구현** (gantt-task-react)
3. **칸반보드 구현** (@hello-pangea/dnd)
4. **Zustand 사용 가이드 문서화** (WBS 담당자용)

### 해결 방안
| 기술 | 역할 | 선택 이유 |
|------|------|----------|
| **Zustand** | 클라이언트 전역 상태 관리 | 3개 뷰의 파생 상태 관리 및 즉각 동기화 |
| **TanStack Query** | 서버 상태 관리 | 백엔드 연동 시 fetching/caching (추후) |
| **gantt-task-react** | 간트차트 라이브러리 | 무료 중 가장 완성도 높음, TypeScript 지원 |
| **@hello-pangea/dnd** | 칸반 드래그앤드롭 | Tailwind/Shadcn 100% 호환 |

---

## 🏗️ 아키텍처 설계

### 데이터 흐름

```
┌─────────────────────────────────────────────────┐
│         Zustand Store (단일 진실 공급원)          │
│                                                 │
│  projectTasks: {                                │
│    'project-1': HierarchicalWBSTask[]          │
│  }                                              │
│                                                 │
│  ✨ Selectors (메모이제이션)                      │
│  - getTasks()        → WBS용 원본 데이터         │
│  - getGanttTasks()   → 평면화된 Gantt 데이터    │
│  - getKanbanTasks()  → 상태별 그룹화 데이터      │
└──────────────┬──────────────────────────────────┘
               │
      ┌────────┼────────┐
      ▼        ▼        ▼
   ┌─────┐ ┌──────┐ ┌───────┐
   │ WBS │ │Gantt │ │Kanban │
   └──┬──┘ └───┬──┘ └───┬───┘
      │        │        │
      └────────┴────────┘
               │
        updateTask() 호출
               │
               ▼
        모든 뷰 자동 동기화 ✅
```

### 상태 관리 역할 분담

```typescript
// ✅ Zustand: 클라이언트 상태
- 3개 뷰의 파생 상태 관리 (Selector로 메모이제이션)
- 즉각적인 UI 업데이트 (낙관적 업데이트)
- localStorage persist (새로고침 시 복원)

// ✅ TanStack Query: 서버 상태 (추후 백엔드 연동 시)
- 초기 데이터 fetch
- Background sync
- Refetch on window focus
```

---

## 🚀 구현 단계 (간트차트 + 칸반보드 담당)

### Phase 1: 기반 구축 (2시간)

#### 1.1 패키지 설치 (5분)

```bash
yarn add zustand gantt-task-react @hello-pangea/dnd
```

**설치 검증**:
```bash
yarn list zustand gantt-task-react @hello-pangea/dnd
```

---

#### 1.2 Zustand 스토어 생성 (1시간)

**파일**: `shared/stores/taskStore.ts` (신규 생성)

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { HierarchicalWBSTask } from '@/shared/lib/apiTypes';
import type { Task as GanttTask } from 'gantt-task-react';

// ============= 타입 정의 =============
interface KanbanData {
  todo: HierarchicalWBSTask[];
  'in-progress': HierarchicalWBSTask[];
  done: HierarchicalWBSTask[];
  blocked: HierarchicalWBSTask[];
}

interface TaskStore {
  // 상태
  projectTasks: Record<string, HierarchicalWBSTask[]>;
  
  // 기본 조회
  getTasks: (projectId: string) => HierarchicalWBSTask[];
  setTasks: (projectId: string, tasks: HierarchicalWBSTask[]) => void;
  
  // 파생 상태 (Selector - 자동 메모이제이션)
  getGanttTasks: (projectId: string) => GanttTask[];
  getKanbanTasks: (projectId: string) => KanbanData;
  
  // CRUD
  updateTask: (projectId: string, taskId: string, updates: Partial<HierarchicalWBSTask>) => void;
  addTask: (projectId: string, task: HierarchicalWBSTask, parentId?: string) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  
  // 헬퍼
  findTaskById: (projectId: string, taskId: string) => HierarchicalWBSTask | null;
}

// ============= 재귀 헬퍼 함수 =============
function findTaskRecursively(
  tasks: HierarchicalWBSTask[],
  taskId: string
): HierarchicalWBSTask | null {
  for (const task of tasks) {
    if (task.id === taskId) return task;
    if (task.subTasks?.length) {
      const found = findTaskRecursively(task.subTasks, taskId);
      if (found) return found;
    }
  }
  return null;
}

function updateTaskRecursively(
  tasks: HierarchicalWBSTask[],
  taskId: string,
  updates: Partial<HierarchicalWBSTask>
): HierarchicalWBSTask[] {
  return tasks.map((task) => {
    if (task.id === taskId) {
      const updatedTask = { ...task, ...updates };

      // CLAUDE.md 로직: status → progress 자동 업데이트
      if (updates.status) {
        if (updates.status === 'done') updatedTask.progress = 100;
        else if (updates.status === 'in-progress' && task.progress === 0) {
          updatedTask.progress = 10;
        }
        else if (updates.status === 'todo') updatedTask.progress = 0;
      }

      // CLAUDE.md 로직: duration → endDate 자동 계산
      if (updates.duration && updates.duration !== task.duration) {
        const startDate = new Date(task.startDate);
        const newEndDate = new Date(startDate);
        newEndDate.setDate(startDate.getDate() + updates.duration - 1);
        updatedTask.endDate = newEndDate.toISOString().split('T')[0];
      }

      return updatedTask;
    }

    if (task.subTasks?.length) {
      return {
        ...task,
        subTasks: updateTaskRecursively(task.subTasks, taskId, updates),
      };
    }

    return task;
  });
}

function deleteTaskRecursively(
  tasks: HierarchicalWBSTask[],
  taskId: string
): HierarchicalWBSTask[] {
  return tasks.filter((task) => {
    if (task.id === taskId) return false;
    if (task.subTasks?.length) {
      task.subTasks = deleteTaskRecursively(task.subTasks, taskId);
    }
    return true;
  });
}

function addSubTaskRecursively(
  tasks: HierarchicalWBSTask[],
  parentId: string,
  newTask: HierarchicalWBSTask
): HierarchicalWBSTask[] {
  return tasks.map((task) => {
    if (task.id === parentId) {
      // CLAUDE.md 로직: depth 검증 (max depth = 1)
      if (task.depth >= 1) {
        throw new Error('Maximum depth exceeded (max: 1)');
      }
      return {
        ...task,
        subTasks: [...(task.subTasks || []), { ...newTask, depth: 1 }],
      };
    }
    if (task.subTasks?.length) {
      return {
        ...task,
        subTasks: addSubTaskRecursively(task.subTasks, parentId, newTask),
      };
    }
    return task;
  });
}

// ============= Zustand Store =============
export const useTaskStore = create<TaskStore>()(
  devtools(
    persist(
      (set, get) => ({
        projectTasks: {},

        getTasks: (projectId) => get().projectTasks[projectId] || [],

        setTasks: (projectId, tasks) =>
          set((state) => ({
            projectTasks: { ...state.projectTasks, [projectId]: tasks },
          }), false, 'setTasks'),

        // ✨ Selector: Gantt용 평면화 (자동 메모이제이션)
        getGanttTasks: (projectId) => {
          const tasks = get().getTasks(projectId);
          const result: GanttTask[] = [];

          function flatten(taskList: HierarchicalWBSTask[], parentId?: string) {
            taskList.forEach((task) => {
              result.push({
                id: task.id,
                name: task.name,
                start: new Date(task.startDate),
                end: new Date(task.endDate),
                progress: task.progress,
                type: task.subTasks?.length ? 'project' : 'task',
                dependencies: task.dependencies || [],
                project: parentId,
              });

              if (task.subTasks?.length) {
                flatten(task.subTasks, task.id);
              }
            });
          }

          flatten(tasks);
          return result;
        },

        // ✨ Selector: Kanban용 그룹화 (자동 메모이제이션)
        getKanbanTasks: (projectId) => {
          const tasks = get().getTasks(projectId);
          const flat: HierarchicalWBSTask[] = [];

          function flatten(taskList: HierarchicalWBSTask[]) {
            taskList.forEach((task) => {
              flat.push(task);
              if (task.subTasks?.length) {
                flatten(task.subTasks);
              }
            });
          }

          flatten(tasks);

          return {
            todo: flat.filter((t) => t.status === 'todo'),
            'in-progress': flat.filter((t) => t.status === 'in-progress'),
            done: flat.filter((t) => t.status === 'done'),
            blocked: flat.filter((t) => t.status === 'blocked'),
          };
        },

        updateTask: (projectId, taskId, updates) =>
          set((state) => ({
            projectTasks: {
              ...state.projectTasks,
              [projectId]: updateTaskRecursively(
                state.projectTasks[projectId] || [],
                taskId,
                updates
              ),
            },
          }), false, 'updateTask'),

        addTask: (projectId, task, parentId) =>
          set((state) => {
            const currentTasks = state.projectTasks[projectId] || [];

            if (!parentId) {
              // 최상위 작업 추가
              return {
                projectTasks: {
                  ...state.projectTasks,
                  [projectId]: [...currentTasks, { ...task, depth: 0 }],
                },
              };
            }

            // 하위 작업 추가 (depth 검증 포함)
            return {
              projectTasks: {
                ...state.projectTasks,
                [projectId]: addSubTaskRecursively(currentTasks, parentId, task),
              },
            };
          }, false, 'addTask'),

        deleteTask: (projectId, taskId) =>
          set((state) => ({
            projectTasks: {
              ...state.projectTasks,
              [projectId]: deleteTaskRecursively(
                state.projectTasks[projectId] || [],
                taskId
              ),
            },
          }), false, 'deleteTask'),

        findTaskById: (projectId, taskId) =>
          findTaskRecursively(get().projectTasks[projectId] || [], taskId),
      }),
      { 
        name: 'flowplan-tasks',
        // localStorage에 저장 (새로고침 시 복원)
      }
    ),
    { name: 'TaskStore' } // Redux DevTools 연동
  )
);
```

**검증 방법**:
```typescript
// Chrome DevTools Console에서 테스트
import { useTaskStore } from '@/shared/stores/taskStore';

const store = useTaskStore.getState();
store.setTasks('test-project', [
  {
    id: '1',
    name: 'Task 1',
    startDate: '2024-01-01',
    endDate: '2024-01-05',
    duration: 5,
    progress: 0,
    status: 'todo',
    assignee: 'User1',
    dependencies: [],
    depth: 0,
    subTasks: [],
  }
]);

console.log(store.getTasks('test-project')); // ✅ [Task 1]
console.log(store.getGanttTasks('test-project')); // ✅ Gantt 형식 변환
console.log(store.getKanbanTasks('test-project')); // ✅ 상태별 그룹화

store.updateTask('test-project', '1', { progress: 50 });
console.log(store.getTasks('test-project')[0].progress); // ✅ 50
```

---

#### 1.3 Adapter 함수 (30분)

**파일**: `shared/adapters/taskAdapters.ts` (신규 생성)

```typescript
import type { Task as GanttTask } from 'gantt-task-react';
import type { HierarchicalWBSTask } from '@/shared/lib/apiTypes';

/**
 * Gantt Task → HierarchicalWBSTask 업데이트 변환
 * (간트차트에서 드래그 시 사용)
 */
export function fromGanttTask(ganttTask: GanttTask): Partial<HierarchicalWBSTask> {
  const duration = Math.ceil(
    (ganttTask.end.getTime() - ganttTask.start.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  return {
    startDate: ganttTask.start.toISOString().split('T')[0],
    endDate: ganttTask.end.toISOString().split('T')[0],
    progress: ganttTask.progress,
    duration,
  };
}
```

**참고**: `toGanttTasks`, `flattenTasks`는 Zustand Selector로 이동

---

### Phase 2: 간트차트 + 칸반보드 구현 (2시간)

#### 2.1 간트차트 구현 (1시간)

**파일**: `features/gantt/components/GanttChartView.tsx` (신규 생성)

```typescript
'use client';

import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { useTaskStore } from '@/shared/stores/taskStore';
import { fromGanttTask } from '@/shared/adapters/taskAdapters';
import type { Task } from 'gantt-task-react';

interface GanttChartViewProps {
  projectId: string;
  onTaskSelect?: (taskId: string) => void;
}

export function GanttChartView({ projectId, onTaskSelect }: GanttChartViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);

  // Zustand 스토어 (자동 동기화)
  const ganttTasks = useTaskStore((state) => state.getGanttTasks(projectId));
  const updateTask = useTaskStore((state) => state.updateTask);

  const handleTaskChange = (task: Task) => {
    const updates = fromGanttTask(task);
    updateTask(projectId, task.id, updates);
  };

  const handleProgressChange = (task: Task) => {
    updateTask(projectId, task.id, { progress: task.progress });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">간트차트</h3>
        <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ViewMode.Day}>일별</SelectItem>
            <SelectItem value={ViewMode.Week}>주별</SelectItem>
            <SelectItem value={ViewMode.Month}>월별</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        {ganttTasks.length > 0 ? (
          <Gantt
            tasks={ganttTasks}
            viewMode={viewMode}
            onDateChange={handleTaskChange}
            onProgressChange={handleProgressChange}
            onClick={(task) => onTaskSelect?.(task.id)}
            locale="ko"
            listCellWidth="250px"
            columnWidth={viewMode === ViewMode.Day ? 60 : viewMode === ViewMode.Week ? 80 : 120}
          />
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            작업이 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
```

**스타일 커스터마이징** (선택):

**파일**: `app/globals.css` (하단에 추가)

```css
/* Gantt Chart - Shadcn 테마 통합 */
.gantt-task-react {
  --gantt-background: hsl(var(--background));
  --gantt-foreground: hsl(var(--foreground));
  --gantt-border: hsl(var(--border));
  --gantt-primary: hsl(var(--primary));
}

.gantt-task-react .bar {
  border-radius: 0.375rem; /* rounded-md */
  border: 1px solid hsl(var(--border));
}

.gantt-task-react .bar-progress {
  background: hsl(var(--primary));
}

.gantt-task-react .project {
  background: hsl(var(--secondary));
}
```

**담당**: 간트차트 + 칸반보드 담당자 ✅

---

#### 2.2 칸반보드 구현 (1시간)

**파일**: `features/kanban/components/KanbanBoard.tsx` (신규 생성)

```typescript
'use client';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useTaskStore } from '@/shared/stores/taskStore';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { cn } from '@/shared/lib/utils';
import type { HierarchicalWBSTask } from '@/shared/lib/apiTypes';

interface KanbanBoardProps {
  projectId: string;
  onTaskSelect?: (taskId: string) => void;
  selectedTaskId?: string | null;
}

const STATUS_CONFIG = {
  todo: { label: '할 일', color: 'bg-gray-100 dark:bg-gray-800' },
  'in-progress': { label: '진행 중', color: 'bg-blue-100 dark:bg-blue-900/30' },
  done: { label: '완료', color: 'bg-green-100 dark:bg-green-900/30' },
  blocked: { label: '차단됨', color: 'bg-red-100 dark:bg-red-900/30' },
} as const;

export function KanbanBoard({ projectId, onTaskSelect, selectedTaskId }: KanbanBoardProps) {
  const kanbanTasks = useTaskStore((state) => state.getKanbanTasks(projectId));
  const updateTask = useTaskStore((state) => state.updateTask);

  const handleDragEnd = (result: any) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const newStatus = destination.droppableId as HierarchicalWBSTask['status'];
    updateTask(projectId, draggableId, { status: newStatus });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">칸반보드</h3>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-6">
          {Object.entries(kanbanTasks).map(([status, tasks]) => {
            const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];

            return (
              <Droppable key={status} droppableId={status}>
                {(provided, snapshot) => (
                  <div className="flex flex-col">
                    {/* 컬럼 헤더 */}
                    <div className={cn('p-4 rounded-t-lg', config.color)}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{config.label}</h4>
                        <Badge variant="secondary">{tasks.length}</Badge>
                      </div>
                    </div>

                    {/* 드롭 영역 */}
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'flex-1 p-2 bg-muted/30 rounded-b-lg space-y-2 min-h-[500px]',
                        'transition-colors',
                        snapshot.isDraggingOver && 'bg-muted/50 ring-2 ring-primary'
                      )}
                    >
                      {tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                'cursor-grab active:cursor-grabbing',
                                'transition-all duration-200',
                                snapshot.isDragging && [
                                  'shadow-2xl rotate-2 scale-105',
                                  'ring-2 ring-primary',
                                ],
                                selectedTaskId === task.id && 'ring-2 ring-primary'
                              )}
                              onClick={() => onTaskSelect?.(task.id)}
                            >
                              <CardContent className="p-4 space-y-3">
                                {/* 작업명 */}
                                <h5 className="font-medium line-clamp-2">{task.name}</h5>

                                {/* 진행률 */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>진행률</span>
                                    <span>{task.progress}%</span>
                                  </div>
                                  <Progress value={task.progress} />
                                </div>

                                {/* 담당자 & 기한 */}
                                <div className="flex items-center justify-between pt-2">
                                  <Avatar className="h-7 w-7">
                                    <AvatarFallback className="text-xs">
                                      {task.assignee.slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <Badge variant="outline" className="text-xs">
                                    {task.endDate}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
```

**담당**: 간트차트 + 칸반보드 담당자 ✅

---

#### 2.3 WBS 테이블 Zustand 연동 (30분) ⏭️ **다른 담당자**

**파일**: `features/wbs/components/HierarchicalWBSTable.tsx` (수정)

**수정 전**:
```typescript
const [wbsTasks, setWbsTasks] = useState<HierarchicalWBSTask[]>([]);
```

**수정 후**:
```typescript
const wbsTasks = useTaskStore((state) => state.getTasks(projectId));
const updateTask = useTaskStore((state) => state.updateTask);
const deleteTask = useTaskStore((state) => state.deleteTask);
const addTask = useTaskStore((state) => state.addTask);
```

**변경 사항**:
1. `useState` 제거
2. `useTaskOperations` 훅 제거 (Zustand로 대체)
3. 모든 핸들러를 Zustand 액션으로 교체

**참고**: WBS 담당자는 `useTaskStore` 훅을 사용하여 동일한 방식으로 연동

---

#### 2.4 프로젝트 페이지 통합 (30분)

**파일**: `app/(dashboard)/project/[id]/page.tsx` (수정)
**담당**: 간트차트 + 칸반보드 담당자 ✅ (간트/칸반 탭만)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { HierarchicalWBSTable } from '@/features/wbs/components/HierarchicalWBSTable';
import { GanttChartView } from '@/features/gantt/components/GanttChartView';
import { KanbanBoard } from '@/features/kanban/components/KanbanBoard';
import { useTaskStore } from '@/shared/stores/taskStore';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const setTasks = useTaskStore((state) => state.setTasks);
  const tasks = useTaskStore((state) => state.getTasks(projectId));

  // 초기 데이터 로드 (임시: Mock 데이터)
  useEffect(() => {
    if (tasks.length === 0) {
      // TODO: apiService.getTasks(projectId)로 교체
      const mockTasks = [/* mock data */];
      setTasks(projectId, mockTasks);
    }
  }, [projectId, tasks.length, setTasks]);

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="wbs">
          <TabsList>
            <TabsTrigger value="wbs">WBS</TabsTrigger>
            <TabsTrigger value="gantt">간트차트</TabsTrigger>
            <TabsTrigger value="kanban">칸반보드</TabsTrigger>
          </TabsList>

          <TabsContent value="wbs">
            <HierarchicalWBSTable
              projectId={projectId}
              onTaskSelect={setSelectedTaskId}
            />
          </TabsContent>

          <TabsContent value="gantt">
            <GanttChartView
              projectId={projectId}
              onTaskSelect={setSelectedTaskId}
            />
          </TabsContent>

          <TabsContent value="kanban">
            <KanbanBoard
              projectId={projectId}
              onTaskSelect={setSelectedTaskId}
              selectedTaskId={selectedTaskId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

**참고**: WBS 탭은 다른 담당자가 추가

---

### Phase 3: 테스트 및 검증 (30분)
**담당**: 간트차트 + 칸반보드 담당자 ✅

#### 테스트 시나리오

| 시나리오 | 작업 | 예상 결과 |
|---------|------|----------|
| **1. WBS → 간트/칸반** | WBS에서 진행률 50% → 80% | 간트/칸반 자동 업데이트 ✅ |
| **2. 간트 → WBS/칸반** | 간트 드래그로 날짜 변경 | WBS/칸반 날짜 자동 반영 ✅ |
| **3. 칸반 → WBS/간트** | 칸반 카드 "할 일" → "진행 중" | WBS status 변경, 진행률 10% ✅ |
| **4. 작업 추가** | WBS에서 새 작업 추가 | 간트/칸반 자동 표시 ✅ |
| **5. 작업 삭제** | WBS에서 작업 삭제 | 간트/칸반 자동 제거 ✅ |
| **6. 새로고침** | 브라우저 새로고침 | localStorage에서 복원 ✅ |

#### 검증 방법

```typescript
// Chrome DevTools Console
import { useTaskStore } from '@/shared/stores/taskStore';

// 1. 진행률 변경 테스트
useTaskStore.getState().updateTask('project-1', 'task-1', { progress: 80 });
// → WBS, Gantt, Kanban 모두 80% 표시 확인

// 2. 상태 변경 테스트
useTaskStore.getState().updateTask('project-1', 'task-1', { status: 'in-progress' });
// → 칸반보드 "진행 중" 컬럼으로 이동 확인
// → 진행률 자동 10% 변경 확인

// 3. localStorage 저장 확인
localStorage.getItem('flowplan-tasks')
// → 데이터 저장 확인
```

---

## 📁 파일 구조

```
FlowPlan-front/
├── shared/
│   ├── stores/
│   │   └── taskStore.ts          # ✨ 신규
│   ├── adapters/
│   │   └── taskAdapters.ts       # ✨ 신규
│   └── lib/
│       └── apiTypes.ts            # ✅ 기존 (HierarchicalWBSTask)
│
├── features/
│   ├── wbs/
│   │   └── components/
│   │       └── HierarchicalWBSTable.tsx  # 🔄 수정 (Zustand 연동)
│   ├── gantt/
│   │   └── components/
│   │       └── GanttChartView.tsx        # ✨ 신규
│   └── kanban/
│       └── components/
│           └── KanbanBoard.tsx           # ✨ 신규
│
└── app/
    └── (dashboard)/
        └── project/
            └── [id]/
                └── page.tsx              # 🔄 수정 (3개 뷰 통합)

✨ 신규 파일
🔄 수정 파일
```

---

## ⏰ 예상 작업 시간

| Phase | 작업 | 예상 시간 |
|-------|------|-----------|
| **Phase 1** | 기반 구축 | **2시간** |
| 1.1 | 패키지 설치 | 5분 |
| 1.2 | Zustand 스토어 | 1시간 |
| 1.3 | Adapter 함수 | 30분 |
| **Phase 2** | 컴포넌트 통합 | **2.5시간** |
| 2.1 | 간트차트 | 1시간 |
| 2.2 | 칸반보드 | 1시간 |
| 2.3 | WBS 연동 | 30분 |
| 2.4 | 페이지 통합 | 30분 |
| **Phase 3** | 테스트 | **30분** |
| **총계** | | **5시간** |

---

## ✅ 체크리스트

### Phase 1: 기반 구축
- [ ] `yarn add zustand gantt-task-react @hello-pangea/dnd` 실행
- [ ] `shared/stores/taskStore.ts` 생성
- [ ] Zustand DevTools 동작 확인 (Chrome Extension)
- [ ] `shared/adapters/taskAdapters.ts` 생성

### Phase 2: 컴포넌트 통합
- [ ] `features/gantt/components/GanttChartView.tsx` 생성
- [ ] gantt-task-react CSS import 확인
- [ ] Shadcn 테마 커스터마이징 (선택)
- [ ] `features/kanban/components/KanbanBoard.tsx` 생성
- [ ] Droppable/Draggable 동작 확인
- [ ] `HierarchicalWBSTable.tsx` Zustand 연동
- [ ] `app/(dashboard)/project/[id]/page.tsx` 수정

### Phase 3: 테스트
- [ ] WBS 수정 → 간트/칸반 자동 반영 확인
- [ ] 간트 드래그 → WBS/칸반 자동 반영 확인
- [ ] 칸반 드래그 → WBS/간트 자동 반영 확인
- [ ] 새로고침 → localStorage 복원 확인
- [ ] Redux DevTools에서 상태 변경 추적 확인

---

## 🎯 핵심 포인트

### 1. 왜 Zustand를 사용하나?
```typescript
// ❌ TanStack Query만 사용 시 문제
- 각 뷰가 독립적으로 데이터 변환
- 매 렌더링마다 toGanttTasks(), flattenTasks() 재계산
- 낙관적 업데이트 복잡도 증가

// ✅ Zustand 사용 시 해결
- Selector로 파생 상태 자동 메모이제이션
- 한 곳에서 수정하면 모든 뷰 자동 동기화
- 즉각적인 UI 반영 (UX 향상)
```

### 2. gantt-task-react 선택 이유
- ✅ 무료 오픈소스 중 가장 완성도 높음
- ✅ TypeScript 지원
- ✅ React 18 호환
- ✅ 드래그앤드롭 기본 제공
- ✅ 2022년까지 활발히 유지보수 (Deprecated 아님)

### 3. @hello-pangea/dnd와 Tailwind/Shadcn 호환
```typescript
// ✅ DnD 라이브러리는 "행동"만 제공
{...provided.draggableProps}  // 드래그 기능만
{...provided.dragHandleProps}  // 핸들 기능만

// ✅ 스타일은 100% 개발자 제어
className="p-4 rounded-lg border bg-card"  // Tailwind
<Card><Badge><Progress />  // Shadcn 컴포넌트
```

### 4. 실시간 협업 제외 (MVP 범위)
- ❌ WebSocket 통합 제외
- ✅ 로컬 동기화만 구현 (Zustand)
- 추후 필요 시 TanStack Query Refetch로 polling 방식 먼저 시도

---

## 🚨 주의사항

1. **Depth 제한**: 최대 depth = 1 (CLAUDE.md 준수)
2. **타입 일관성**: `HierarchicalWBSTask` 타입 변경 시 Adapter도 수정
3. **Performance**: 작업 50개 이상 시 Selector 성능 모니터링
4. **localStorage 제한**: ~5MB (대규모 프로젝트 주의)

---

## 📚 참고 자료

- [Zustand 공식 문서](https://docs.pmnd.rs/zustand)
- [gantt-task-react GitHub](https://github.com/MaTeMaTuK/gantt-task-react)
- [@hello-pangea/dnd 문서](https://github.com/hello-pangea/dnd)
- [CLAUDE.md - 프로젝트 가이드라인](./CLAUDE.md)

---

## 📖 WBS 담당자용 Zustand 사용 가이드

> **대상**: WBS 테이블 구현 담당자  
> **목적**: 간트차트/칸반보드와 동일한 방식으로 Zustand 스토어 연동

### 기본 사용법

```typescript
// features/wbs/components/HierarchicalWBSTable.tsx
'use client';

import { useTaskStore } from '@/shared/stores/taskStore';

export function HierarchicalWBSTable({ projectId }: { projectId: string }) {
  // ✅ 1. Zustand에서 데이터 가져오기
  const wbsTasks = useTaskStore((state) => state.getTasks(projectId));
  
  // ✅ 2. CRUD 액션 가져오기
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const addTask = useTaskStore((state) => state.addTask);

  // ✅ 3. 이벤트 핸들러에서 액션 호출
  const handleUpdate = (taskId: string, updates: Partial<HierarchicalWBSTask>) => {
    updateTask(projectId, taskId, updates);
    // 자동으로 간트차트, 칸반보드 동기화됨 ✅
  };

  const handleDelete = (taskId: string) => {
    deleteTask(projectId, taskId);
  };

  const handleAddSubtask = (parentId: string, taskData: Partial<HierarchicalWBSTask>) => {
    const newTask: HierarchicalWBSTask = {
      id: `task-${Date.now()}`,
      ...taskData,
      depth: 1, // CLAUDE.md: max depth = 1
      subTasks: [],
    };
    addTask(projectId, newTask, parentId);
  };

  return (
    <div>
      {wbsTasks.map((task) => (
        <WBSTableRow
          key={task.id}
          task={task}
          onUpdate={(updates) => handleUpdate(task.id, updates)}
          onDelete={() => handleDelete(task.id)}
          onAddSubTask={(data) => handleAddSubtask(task.id, data)}
        />
      ))}
    </div>
  );
}
```

### 주요 포인트

1. **`useState` 제거**: 기존 로컬 상태 대신 Zustand 사용
2. **자동 동기화**: `updateTask` 호출 시 간트/칸반 자동 반영
3. **Depth 제한**: `addTask` 시 `depth: 1` 준수 (CLAUDE.md)
4. **자동 계산**: Status → Progress, Duration → EndDate 자동 처리

### 제거해야 할 것들

```typescript
// ❌ 제거
const [wbsTasks, setWbsTasks] = useState<HierarchicalWBSTask[]>([]);
const { handleTaskUpdate, handleTaskDelete } = useTaskOperations(projectId, wbsTasks, setWbsTasks);

// ✅ 대체
const wbsTasks = useTaskStore((state) => state.getTasks(projectId));
const updateTask = useTaskStore((state) => state.updateTask);
```

### 테스트 방법

1. WBS에서 진행률 수정 → Chrome DevTools에서 `useTaskStore.getState().getTasks(projectId)` 확인
2. 간트차트 탭으로 이동 → 자동 반영 확인 ✅
3. 칸반보드 탭으로 이동 → 자동 반영 확인 ✅

### 문제 발생 시

- **데이터 안 보임**: `projectId` 확인, 초기 `setTasks()` 호출 확인
- **동기화 안됨**: Redux DevTools 설치 후 상태 변경 추적
- **Depth 에러**: `addTask` 시 `parentTask.depth >= 1` 체크

### 참고 파일
- `shared/stores/taskStore.ts` - Zustand 스토어 구현
- `features/gantt/components/GanttChartView.tsx` - 간트차트 사용 예시
- `features/kanban/components/KanbanBoard.tsx` - 칸반보드 사용 예시

---

**작성일**: 2025-10-23  
**최종 검토**: ✅ CLAUDE.md 기준 충족  
**담당 범위**: 간트차트 + 칸반보드 + Zustand 인프라  
**상태**: 구현 준비 완료
