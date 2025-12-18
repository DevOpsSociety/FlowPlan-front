import type { Task, TaskStatus } from '@/shared/lib/apiTypes';
import { flattenTasks } from '@/shared/lib/taskAdapters';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Zustand 스토어 상태 타입
interface TaskState {
  // 프로젝트별 작업 저장: { 'project-1': Task[], 'project-2': Task[] }
  projectTasks: Record<string, Task[]>;

  // 기본 CRUD 액션
  getTasks: (projectId: string) => Task[];
  setTasks: (projectId: string, tasks: Task[]) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  addTask: (projectId: string, task: Task, parentId?: string) => void;
  deleteTask: (projectId: string, taskId: string) => void;

  // 유틸리티 함수
  findTaskById: (projectId: string, taskId: string) => Task | null;

  // Selector: 간트차트용 평탄화된 작업 목록
  getGanttTasks: (projectId: string) => Task[];

  // Selector: 칸반보드용 상태별 그룹화된 작업 목록
  getKanbanTasks: (projectId: string) => {
    todo: Task[];
    'in-progress': Task[];
    done: Task[];
  };
}

// 재귀적으로 작업 찾기 헬퍼 함수
const findTaskRecursive = (tasks: Task[], taskId: string): Task | null => {
  for (const task of tasks) {
    if (task.task_id === taskId) {
      return task;
    }
    if (task.subtasks && task.subtasks.length > 0) {
      const found = findTaskRecursive(task.subtasks, taskId);
      if (found) return found;
    }
  }
  return null;
};

// 재귀적으로 작업 업데이트 헬퍼 함수
const updateTaskRecursive = (tasks: Task[], taskId: string, updates: Partial<Task>): Task[] => {
  return tasks.map((task) => {
    if (task.task_id === taskId) {
      return { ...task, ...updates };
    }
    if (task.subtasks && task.subtasks.length > 0) {
      return {
        ...task,
        subtasks: updateTaskRecursive(task.subtasks, taskId, updates),
      };
    }
    return task;
  });
};

// 재귀적으로 작업 삭제 헬퍼 함수
const deleteTaskRecursive = (tasks: Task[], taskId: string): Task[] => {
  return tasks
    .filter((task) => task.task_id !== taskId)
    .map((task) => {
      if (task.subtasks && task.subtasks.length > 0) {
        return {
          ...task,
          subtasks: deleteTaskRecursive(task.subtasks, taskId),
        };
      }
      return task;
    });
};

// 재귀적으로 작업 추가 헬퍼 함수 (parentId가 있는 경우)
const addTaskRecursive = (tasks: Task[], newTask: Task, parentId?: string): Task[] => {
  if (!parentId) {
    // 최상위 레벨에 추가
    return [...tasks, newTask];
  }

  return tasks.map((task) => {
    if (task.task_id === parentId) {
      // 부모 작업을 찾았으면 subtasks에 추가
      return {
        ...task,
        subtasks: [...(task.subtasks || []), newTask],
      };
    }
    if (task.subtasks && task.subtasks.length > 0) {
      return {
        ...task,
        subtasks: addTaskRecursive(task.subtasks, newTask, parentId),
      };
    }
    return task;
  });
};

// 상태별 그룹화 헬퍼 함수 (칸반보드용)
const groupTasksByStatus = (tasks: Task[]) => {
  const flatTasks = flattenTasks(tasks);

  // Task의 status 타입을 칸반 상태로 매핑
  const statusMapping: Record<TaskStatus, 'todo' | 'in-progress' | 'done'> = {
    할일: 'todo',
    진행중: 'in-progress',
    완료: 'done',
  };

  return {
    todo: flatTasks.filter((t) => statusMapping[t.status] === 'todo'),
    'in-progress': flatTasks.filter((t) => statusMapping[t.status] === 'in-progress'),
    done: flatTasks.filter((t) => statusMapping[t.status] === 'done'),
  };
};

const EMPTY_ARRAY: Task[] = [];

// Zustand 스토어 생성
export const useTaskStore = create<TaskState>()(
  devtools(
    persist(
      (set, get) => ({
        projectTasks: {},

        getTasks: (projectId: string) => {
          return get().projectTasks[projectId] || EMPTY_ARRAY;
        },

        setTasks: (projectId: string, tasks: Task[]) => {
          const currentTasks = get().projectTasks[projectId];
          // 참조가 완전히 동일한 경우에만 업데이트 건너뜀
          if (currentTasks === tasks) return;

          set((state) => ({
            projectTasks: {
              ...state.projectTasks,
              [projectId]: tasks,
            },
          }));
        },

        updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => {
          const tasks = get().projectTasks[projectId];
          if (!tasks) return;

          const updatedTasks = updateTaskRecursive(tasks, taskId, updates);
          get().setTasks(projectId, updatedTasks);
        },

        addTask: (projectId: string, task: Task, parentId?: string) => {
          const tasks = get().projectTasks[projectId] || [];
          const updatedTasks = addTaskRecursive(tasks, task, parentId);
          get().setTasks(projectId, updatedTasks);
        },

        deleteTask: (projectId: string, taskId: string) => {
          const tasks = get().projectTasks[projectId];
          if (!tasks) return;

          const updatedTasks = deleteTaskRecursive(tasks, taskId);
          get().setTasks(projectId, updatedTasks);
        },

        findTaskById: (projectId: string, taskId: string) => {
          const tasks = get().projectTasks[projectId];
          if (!tasks) return null;

          return findTaskRecursive(tasks, taskId);
        },

        // Selector: 간트차트용 평탄화
        getGanttTasks: (projectId: string) => {
          const tasks = get().getTasks(projectId);
          return flattenTasks(tasks);
        },

        // Selector: 칸반보드용 상태별 그룹화
        getKanbanTasks: (projectId: string) => {
          const tasks = get().getTasks(projectId);
          return groupTasksByStatus(tasks);
        },
      }),
      {
        name: 'task-storage', // localStorage key
      }
    )
  )
);
