'use client';

import { useQuery } from '@tanstack/react-query';
import { getProject as getStoredProject } from '@/shared/lib/storage';
import { mockProjects } from '@/shared/lib/mockData';

/**
 * 프로젝트 기본 정보 조회 훅
 *
 * localStorage mock 데이터 조회 (백엔드 연동 전 임시)
 */
export function useProjectQuery(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      // localStorage에서 먼저 시도
      const storedProject = getStoredProject(projectId);
      if (storedProject) {
        return {
          id: storedProject.id,
          title: storedProject.title,
          description: storedProject.description,
          teamSize: storedProject.teamSize,
          duration_days: storedProject.duration,
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
          duration_days: 90,
        };
      }

      throw new Error('Project not found');
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
}
