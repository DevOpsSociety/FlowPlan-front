import { createTask, deleteTask, fetchTasks, updateTask } from '@/shared/api/taskApi';
import type { CreateTaskDto, TaskFlatDto, UpdateTaskDto } from '@/shared/api/taskTypes';
import { useToast } from '@/shared/hooks/useToast';
import { getStatusFromProgress } from '@/shared/utils/taskStatusUtils';
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
      if (
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

      // 2. 캐시 다시 가져오기 (최신 데이터)
      const refreshedCachedTasks = queryClient.getQueryData<TaskFlatDto[]>(['tasks', projectId]);
      console.log('📦 [TaskUpdate] 캐시 태스크 목록:', {
        총개수: refreshedCachedTasks?.length,
        updatedTaskParent: updatedTask.parent,
      });

      if (refreshedCachedTasks && updatedTask.parent) {
        // 3. 동일한 부모를 가진 모든 하위 태스크 찾기
        const siblings = refreshedCachedTasks.filter((task) => task.parent === updatedTask.parent);
        console.log('👥 [TaskUpdate] 형제 태스크 찾기:', {
          parentId: updatedTask.parent,
          siblingsCount: siblings.length,
          siblings: siblings.map((s) => ({ id: s.id, name: s.name, progress: s.progress })),
        });

        // 4. 업데이트된 태스크를 포함하여 진행률 계산
        const updatedSiblings = siblings.map((sibling) =>
          sibling.id === updatedTask.id ? updatedTask : sibling
        );

        console.log('🔄 [TaskUpdate] 업데이트된 형제 목록:', {
          siblings: updatedSiblings.map((s) => ({ id: s.id, name: s.name, progress: s.progress })),
        });

        // 5. 모든 하위 태스크의 진행률 평균 계산
        const totalProgress = updatedSiblings.reduce((sum, task) => sum + task.progress, 0);
        const parentProgress = Math.round(totalProgress / updatedSiblings.length);

        // 6. 진행률에 따른 상태 계산
        const parentStatus = getStatusFromProgress(parentProgress);

        console.log('📊 [TaskUpdate] 상위 태스크 계산 결과:', {
          parentId: updatedTask.parent,
          totalProgress,
          siblingsCount: updatedSiblings.length,
          parentProgress,
          parentStatus,
        });

        // 7. 상위 태스크의 진행률과 상태 업데이트
        try {
          await updateTask(updatedTask.parent, {
            progress: parentProgress,
            status: parentStatus,
          });
          console.log('✅ [TaskUpdate] 상위 태스크 업데이트 완료');
        } catch (error) {
          console.error('❌ [TaskUpdate] 상위 태스크 업데이트 실패:', error);
        }
      } else {
        console.log('ℹ️ [TaskUpdate] 상위 태스크 업데이트 스킵:', {
          hasCachedTasks: !!refreshedCachedTasks,
          hasParent: !!updatedTask.parent,
        });
      }

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
