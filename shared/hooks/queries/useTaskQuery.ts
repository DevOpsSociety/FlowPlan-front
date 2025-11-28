import { useToast } from '@/shared/hooks/useToast';
import { apiTaskToSvar } from '@/shared/lib/taskAdapters';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTask, deleteTask, fetchTasks, updateTask } from '@/shared/api/taskApi';
import type { CreateTaskDto, UpdateTaskDto } from '@/shared/api/taskTypes';

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
      const apiTasks = await fetchTasks(projectId);
      // API 응답을 SVAR 형식으로 변환
      return apiTasks.map(apiTaskToSvar);
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
