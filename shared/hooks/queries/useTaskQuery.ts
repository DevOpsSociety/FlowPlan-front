import { createTask, deleteTask, fetchTasks, updateTask } from '@/shared/api/taskApi';
import type { CreateTaskDto, UpdateTaskDto } from '@/shared/api/taskTypes';
import { useToast } from '@/shared/hooks/useToast';
import { apiTaskToSvar } from '@/shared/lib/taskAdapters';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * 프로젝트 작업 목록 조회 훅
 *
 * API에서 받은 TaskFlatDto[]를 SVAR 형식으로 변환하여 반환
 * WBS, Gantt, Kanban 모든 뷰에서 사용
 */
export const useTasks = (projectId: string) => {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      console.log('🔄 [API] fetchTasks 호출 시작:', { projectId });
      const response = await fetchTasks(projectId);
      console.log('✅ [API] fetchTasks 응답:', {
        projectId,
        projectInfo: {
          projectId: response.projectId,
          projectName: response.projectName,
          projectTopic: response.projectTopic,
          memberCount: response.memberCount,
        },
        taskCount: response.tasks.length,
        tasks: response.tasks,
      });
      // API 응답의 tasks 배열을 SVAR 형식으로 변환
      const svarTasks = response.tasks.map(apiTaskToSvar);
      console.log('🔄 [API] SVAR 형식 변환 완료:', { count: svarTasks.length, svarTasks });
      return svarTasks;
    },
    staleTime: 1000 * 60, // 1분
  });
};

/**
 * 프로젝트 정보와 작업 목록을 함께 조회하는 훅
 *
 * ProjectWithTasksResponseDto를 받아서 프로젝트 정보와 SVAR 형식의 작업 목록을 반환
 * ProjectClient에서 사용
 */
export const useProjectWithTasks = (projectId: string) => {
  return useQuery({
    queryKey: ['projectWithTasks', projectId], // useTasks와 다른 키 사용
    queryFn: async () => {
      console.log('🔄 [API] fetchProjectWithTasks 호출 시작:', { projectId });
      const response = await fetchTasks(projectId);
      console.log('✅ [API] fetchProjectWithTasks 응답:', {
        projectId,
        projectInfo: {
          projectId: response.projectId,
          projectName: response.projectName,
          projectTopic: response.projectTopic,
          memberCount: response.memberCount,
        },
        taskCount: response.tasks.length,
      });

      // API 응답의 tasks 배열을 SVAR 형식으로 변환
      const svarTasks = response.tasks.map(apiTaskToSvar);

      return {
        project: {
          id: response.projectId,
          name: response.projectName,
          topic: response.projectTopic,
          memberCount: response.memberCount,
          expectedDurationMonths: response.expectedDurationMonths,
        },
        tasks: svarTasks,
      };
    },
    staleTime: 1000 * 60, // 1분
  });
};

/**
 * 작업 생성 mutation
 */
export const useCreateTask = (projectId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (taskData: CreateTaskDto) => createTask(projectId, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast({
        title: '작업이 생성되었습니다',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '작업 생성 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * 작업 수정 mutation
 */
export const useUpdateTask = (projectId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ taskId, updates }: { taskId: number; updates: UpdateTaskDto }) =>
      updateTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast({
        title: '작업이 수정되었습니다',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '작업 수정 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * 작업 삭제 mutation
 */
export const useDeleteTask = (projectId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (taskId: number) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast({
        title: '작업이 삭제되었습니다',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '작업 삭제 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * 여러 작업을 한번에 업데이트하는 mutation
 * SVAR에서 여러 작업이 동시에 변경될 때 사용
 */
export const useBatchUpdateTasks = (projectId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: Array<{ taskId: number; updates: UpdateTaskDto }>) => {
      // 모든 업데이트를 병렬로 실행
      await Promise.all(updates.map(({ taskId, updates }) => updateTask(taskId, updates)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast({
        title: '작업들이 수정되었습니다',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '작업 수정 실패',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
