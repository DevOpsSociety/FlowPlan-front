'use client';

import { GanttChartView } from '@/features/gantt/components/GanttChartView';
import { KanbanBoard } from '@/features/kanban/components/KanbanBoard';
import { ProjectHeader } from '@/features/project-detail/components/ProjectHeader';
import { TaskDetailPanel } from '@/features/project-detail/components/TaskDetailPanel';
import { ViewSelector } from '@/features/project-detail/components/ViewSelector';
import { ProjectViewSkeleton } from '@/features/project-detail/skeletons/ProjectViewSkeleton';
import { HierarchicalWBSTable } from '@/features/wbs/components/HierarchicalWbsTable';
import { useTaskOperations } from '@/features/wbs/hooks/useTaskOperations';
import { useProjectData } from '@/shared/hooks/useProjectData';
import type { Task } from '@/shared/lib/apiTypes';
import { saveWBSTasksWithSync } from '@/shared/lib/storage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { BarChart3, Kanban, Table } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface ProjectViewProps {
  project: any;
  onShowTeam?: () => void;
}

export function ProjectView({ project, onShowTeam }: ProjectViewProps) {
  const [currentView, setCurrentView] = useState<'wbs' | 'gantt' | 'kanban'>('wbs');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  const { wbsTasks, setWbsTasks, isLoading } = useProjectData(project.task_id);

  const { findTaskById, handleTaskUpdate, handleTaskDelete, handleTaskAdd } = useTaskOperations(
    project.task_id,
    wbsTasks,
    setWbsTasks
  );

  useEffect(() => {
    if (!isLoading && wbsTasks.length > 0) {
      const timeoutId = setTimeout(() => {
        saveWBSTasksWithSync(wbsTasks, project.task_id);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [wbsTasks, isLoading, project.task_id]);

  const handleTaskSelect = useCallback(
    (taskId: string) => {
      const task = findTaskById(wbsTasks, taskId);
      if (task) {
        setSelectedTaskId(taskId);
        setSelectedTask(task);
        setIsTaskDetailOpen(true);
      }
    },
    [wbsTasks, findTaskById]
  );

  const handleKanbanStatusChange = useCallback(
    (taskId: string, newStatus: Task['status']) => {
      handleTaskUpdate(taskId, { status: newStatus });
    },
    [handleTaskUpdate]
  );

  const getFlatTaskList = useCallback((tasks: Task[]): Task[] => {
    const flatTasks: Task[] = [];

    const flatten = (taskList: Task[]) => {
      taskList.forEach((task) => {
        flatTasks.push(task);
        if (task.subtasks && task.subtasks.length > 0) {
          flatten(task.subtasks);
        }
      });
    };

    flatten(tasks);
    return flatTasks;
  }, []);

  if (isLoading) {
    return <ProjectViewSkeleton />;
  }

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} wbsTasks={wbsTasks} onShowTeam={onShowTeam} />

      <div className="hidden md:flex justify-end">
        <ViewSelector currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {/* Desktop view */}
      <div className="hidden md:block">
        {currentView === 'wbs' && (
          <div className="min-h-[600px] rounded-lg border p-6">
            <HierarchicalWBSTable
              tasks={wbsTasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskAdd={handleTaskAdd}
              onTaskSelect={handleTaskSelect}
            />
          </div>
        )}

        {currentView === 'gantt' && (
          <div className="min-h-[600px] rounded-lg border p-6">
            <GanttChartView
              tasks={wbsTasks}
              onTaskSelect={handleTaskSelect}
              onTaskUpdate={handleTaskUpdate}
              selectedTaskId={selectedTaskId}
            />
          </div>
        )}

        {currentView === 'kanban' && (
          <div className="min-h-[600px] rounded-lg border p-6">
            <KanbanBoard
              tasks={getFlatTaskList(wbsTasks)}
              onTaskStatusChange={handleKanbanStatusChange}
              onTaskSelect={handleTaskSelect}
            />
          </div>
        )}
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="wbs">
              <Table className="h-4 w-4 mr-1" />
              WBS
            </TabsTrigger>
            <TabsTrigger value="gantt">
              <BarChart3 className="h-4 w-4 mr-1" />
              Gantt
            </TabsTrigger>
            <TabsTrigger value="kanban">
              <Kanban className="h-4 w-4 mr-1" />
              Kanban
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wbs" className="mt-6">
            <HierarchicalWBSTable
              tasks={wbsTasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskAdd={handleTaskAdd}
              onTaskSelect={handleTaskSelect}
            />
          </TabsContent>

          <TabsContent value="gantt" className="mt-6">
            <GanttChartView
              tasks={wbsTasks}
              onTaskSelect={handleTaskSelect}
              onTaskUpdate={handleTaskUpdate}
              selectedTaskId={selectedTaskId}
            />
          </TabsContent>

          <TabsContent value="kanban" className="mt-6">
            <KanbanBoard
              tasks={getFlatTaskList(wbsTasks)}
              onTaskStatusChange={handleKanbanStatusChange}
              onTaskSelect={handleTaskSelect}
            />
          </TabsContent>
        </Tabs>
      </div>

      <TaskDetailPanel
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        onUpdate={handleTaskUpdate}
      />
    </div>
  );
}
