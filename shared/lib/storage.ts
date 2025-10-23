import type { Task } from './apiTypes';

const STORAGE_KEYS = {
  PROJECTS: 'flowplan_projects',
  CURRENT_PROJECT: 'flowplan_current_project',
  WBS_TASKS: 'flowplan_wbs_tasks',
};

export interface StoredProject {
  id: string;
  title: string;
  description: string;
  teamSize: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
  wbsTasks: Task[];
}

// 프로젝트 저장
export const saveProject = (project: StoredProject): void => {
  try {
    const projects = getProjects();
    const existingIndex = projects.findIndex((p) => p.id === project.id);

    const updatedProject = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      projects[existingIndex] = updatedProject;
    } else {
      projects.push(updatedProject);
    }

    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, project.id);
  } catch (error) {
    console.error('Failed to save project:', error);
  }
};

// 모든 프로젝트 가져오기
export const getProjects = (): StoredProject[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load projects:', error);
    return [];
  }
};

// 특정 프로젝트 가져오기
export const getProject = (projectId: string): StoredProject | null => {
  try {
    const projects = getProjects();
    return projects.find((p) => p.id === projectId) || null;
  } catch (error) {
    console.error('Failed to load project:', error);
    return null;
  }
};

// 현재 프로젝트 ID 가져오기
export const getCurrentProjectId = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
  } catch (error) {
    console.error('Failed to get current project ID:', error);
    return null;
  }
};

// 현재 프로젝트 가져오기
export const getCurrentProject = (): StoredProject | null => {
  const currentId = getCurrentProjectId();
  return currentId ? getProject(currentId) : null;
};

// 프로젝트 삭제
export const deleteProject = (projectId: string): void => {
  try {
    const projects = getProjects();
    const filtered = projects.filter((p) => p.id !== projectId);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));

    // 현재 프로젝트가 삭제된 경우 초기화
    if (getCurrentProjectId() === projectId) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT);
    }
  } catch (error) {
    console.error('Failed to delete project:', error);
  }
};

// WBS 작업 저장 (현재 프로젝트)
export const saveWBSTasks = (tasks: Task[]): void => {
  try {
    const currentProject = getCurrentProject();
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        wbsTasks: tasks,
        updatedAt: new Date().toISOString(),
      };
      saveProject(updatedProject);
    }
  } catch (error) {
    console.error('Failed to save WBS tasks:', error);
  }
};

// WBS 작업 가져오기 (현재 프로젝트)
export const getWBSTasks = (): Task[] => {
  try {
    const currentProject = getCurrentProject();
    return currentProject?.wbsTasks || [];
  } catch (error) {
    console.error('Failed to load WBS tasks:', error);
    return [];
  }
};

export interface SyncEvent {
  type: 'task_updated' | 'task_added' | 'task_deleted' | 'project_changed';
  projectId: string;
  taskId?: string;
  data?: any;
  timestamp: number;
}

// Event listeners for real-time sync
const syncListeners: ((event: SyncEvent) => void)[] = [];

export const addSyncListener = (listener: (event: SyncEvent) => void) => {
  syncListeners.push(listener);
  return () => {
    const index = syncListeners.indexOf(listener);
    if (index > -1) {
      syncListeners.splice(index, 1);
    }
  };
};

export const emitSyncEvent = (event: SyncEvent) => {
  syncListeners.forEach((listener) => {
    try {
      listener(event);
    } catch (error) {
      console.error('Sync listener error:', error);
    }
  });
};

// Enhanced WBS task saving with sync events
export const saveWBSTasksWithSync = (tasks: Task[], _projectId?: string): void => {
  try {
    const currentProject = getCurrentProject();
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        wbsTasks: tasks,
        updatedAt: new Date().toISOString(),
      };
      saveProject(updatedProject);

      // Emit sync event
      emitSyncEvent({
        type: 'project_changed',
        projectId: currentProject.id,
        data: { wbsTasks: tasks },
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.error('Failed to save WBS tasks with sync:', error);
  }
};

// Enhanced task update with sync events
export const updateTaskWithSync = (
  taskId: string,
  updates: Partial<Task>,
  _projectId?: string
): void => {
  try {
    const currentProject = getCurrentProject();
    if (currentProject) {
      const updateTaskRecursively = (tasks: Task[]): Task[] => {
        return tasks.map((task) => {
          if (task.task_id === taskId) {
            const updatedTask = { ...task, ...updates };

            // Auto-update progress based on status
            if (updates.status) {
              if (updates.status === '완료') {
                updatedTask.progress = 100;
              } else if (updates.status === '진행중' && task.progress === 0) {
                updatedTask.progress = 10;
              } else if (updates.status === '할일') {
                updatedTask.progress = 0;
              }
            }

            return updatedTask;
          }

          if (task.subtasks && task.subtasks.length > 0) {
            return {
              ...task,
              subtasks: updateTaskRecursively(task.subtasks),
            };
          }

          return task;
        });
      };

      const updatedTasks = updateTaskRecursively(currentProject.wbsTasks);
      const updatedProject = {
        ...currentProject,
        wbsTasks: updatedTasks,
        updatedAt: new Date().toISOString(),
      };

      saveProject(updatedProject);

      // Emit sync event
      emitSyncEvent({
        type: 'task_updated',
        projectId: currentProject.id,
        taskId,
        data: updates,
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.error('Failed to update task with sync:', error);
  }
};
