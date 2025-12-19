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
 * 작업 수정 mutation (상위 작업 진행률 자동 업데이트 포함)
 */
export const useUpdateTask = (projectId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: number; updates: UpdateTaskDto }) => {
      console.log('🔄 [TaskUpdate] 시작:', { taskId, updates });

      // 0. 캐시에서 전체 태스크 목록 가져오기
      const cachedTasks = queryClient.getQueryData<TaskFlatDto[]>(['tasks', projectId]);

      // ✅ Level 1 개선: 하위 작업도 0-100% 자유롭게 설정 가능
      // 진행률 제한 검증 제거 - 모든 작업이 동일하게 0-100% 사용 가능

      // 상위 작업의 진행률 수동 변경 차단 (하위 작업이 있는 경우)
      // 단, status가 함께 변경되는 경우(칸반 드래그 등)는 허용
      const isStatusChange = updates.status !== undefined;
      if (
        !isStatusChange &&
        !cachedTasks?.find((t) => t.id === taskId)?.parent &&
        updates.progress !== undefined &&
        cachedTasks
      ) {
        const hasSubtasks = cachedTasks.some((t) => t.parent === taskId);
        if (hasSubtasks) {
          toast({
            title: '상위 작업 진행률 제한',
            description:
              '하위 작업이 있는 상위 작업의 진행률은 자동으로 계산됩니다. 하위 작업을 수정하세요.',
            variant: 'destructive',
          });
          throw new Error('하위 작업이 있는 상위 작업의 진행률은 자동으로 계산됩니다.');
        }
      }

      // 1. 태스크 업데이트
      const updatedTask = await updateTask(taskId, updates);
      console.log('✅ [TaskUpdate] 업데이트 완료:', updatedTask);

      // 상위 작업 자동 계산 로직 제거 (디버깅용)
      // 백엔드에서 상위 작업 진행률을 자동으로 계산하는지 확인
      console.log('✅ [TaskUpdate] 완료 (상위 작업 후처리 없음):', updatedTask);

      return updatedTask;
    },
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
