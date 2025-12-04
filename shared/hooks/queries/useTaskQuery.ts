import { createTask, deleteTask, fetchTasks, updateTask } from '@/shared/api/taskApi';
import type { CreateTaskDto, TaskFlatDto, UpdateTaskDto } from '@/shared/api/taskTypes';
import { useToast } from '@/shared/hooks/useToast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ===== 조회 훅 =====

/**
 * 프로젝트 작업 목록 조회 훅
 *
 * 원본 API 데이터(TaskFlatDto[])를 그대로 반환
 * 각 뷰에서 필요한 형식으로 변환하여 사용
 */
export const useTasks = (projectId: string) => {
  return useQuery<TaskFlatDto[]>({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const response = await fetchTasks(projectId);
      return response.tasks;
    },
    staleTime: 1000 * 60,
  });
};

/**
 * 프로젝트 정보와 작업 목록을 함께 조회하는 훅
 * 원본 API 데이터를 그대로 반환
 */
export const useProjectWithTasks = (projectId: string) => {
  return useQuery({
    queryKey: ['projectWithTasks', projectId],
    queryFn: async () => {
      const response = await fetchTasks(projectId);
      return {
        project: {
          id: response.projectId,
          name: response.projectName,
          topic: response.projectTopic,
          memberCount: response.memberCount,
          expectedDurationMonths: response.expectedDurationMonths,
        },
        tasks: response.tasks,
      };
    },
    staleTime: 1000 * 60,
  });
};

// ===== Mutation 훅 =====

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
      queryClient.invalidateQueries({ queryKey: ['projectWithTasks', projectId] });
      toast({ title: '작업이 생성되었습니다' });
    },
    onError: (error: Error) => {
      toast({ title: '작업 생성 실패', description: error.message, variant: 'destructive' });
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
      queryClient.invalidateQueries({ queryKey: ['projectWithTasks', projectId] });
      toast({ title: '작업이 수정되었습니다' });
    },
    onError: (error: Error) => {
      toast({ title: '작업 수정 실패', description: error.message, variant: 'destructive' });
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
      queryClient.invalidateQueries({ queryKey: ['projectWithTasks', projectId] });
      toast({ title: '작업이 삭제되었습니다' });
    },
    onError: (error: Error) => {
      toast({ title: '작업 삭제 실패', description: error.message, variant: 'destructive' });
    },
  });
};
