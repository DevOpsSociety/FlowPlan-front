'use client';

import { useQuery } from '@tanstack/react-query';
import { getProject as getStoredProject } from '@/shared/lib/storage';
import { mockProjects } from '@/shared/lib/mockData';

/**
 * 쿼리 키 상수
 * TanStack Query의 캐시 키를 일관되게 관리
 */
export const QUERY_KEYS = {
  project: (id: string) => ['project', id] as const,
  tasks: (projectId: string) => ['tasks', projectId] as const,
};

/**
 * 클라이언트 컴포넌트에서 프로젝트 데이터를 조회하는 커스텀 훅
 *
 * 서버에서 HydrationBoundary로 prefetch된 데이터가 있으면 즉시 사용하고,
 * 없으면 이 queryFn이 실행됩니다.
 *
 * @param projectId - 프로젝트 ID
 * @returns TanStack Query 결과 (data, isLoading, error, etc.)
 *
 * @example
 * function ProjectView({ projectId }: { projectId: string }) {
 *   const { data: project, isLoading } = useProjectQuery(projectId)
 *   if (isLoading) return <div>Loading...</div>
 *   return <div>{project.title}</div>
 * }
 */
export function useProjectQuery(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.project(projectId),
    queryFn: async () => {
      // Mock 단계: localStorage에서 먼저 시도
      const storedProject = getStoredProject(projectId);
      if (storedProject) {
        return {
          id: storedProject.id,
          title: storedProject.title,
          description: storedProject.description,
          teamSize: storedProject.teamSize,
          duration: storedProject.duration,
          task_id: storedProject.task_id,
        };
      }

      // Mock 데이터에서 조회
      const mockProject = mockProjects.find((p) => p.id === projectId);
      if (mockProject) {
        return {
          id: mockProject.id,
          title: mockProject.name,
          description: mockProject.description,
          teamSize: mockProject.teamMembers.length,
          duration: 90,
          task_id: projectId,
        };
      }

      throw new Error('Project not found');
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
}

// 🔄 백엔드 연동 후 (다음 주) 아래 코드로 교체:
// import apiClient from '@/shared/lib/apiClient' // axios 인스턴스
//
// export function useProjectQuery(projectId: string) {
//   return useQuery({
//     queryKey: QUERY_KEYS.project(projectId),
//     queryFn: async () => {
//       const response = await apiClient.get(`/projects/${projectId}`)
//       return response.data
//     },
//     staleTime: 1000 * 60 * 5,
//   })
// }
