import { cache } from 'react';
import { getProject as getStoredProject } from '@/shared/lib/storage';
import { mockProjects, mockProjectTasks } from '@/shared/lib/mockData';

/**
 * 서버 컴포넌트 전용: 프로젝트 상세 정보 조회
 *
 * React의 cache()를 사용하여 하나의 요청 동안 중복 호출 방지
 *
 * @param projectId - 프로젝트 ID
 * @returns 프로젝트 상세 정보
 *
 * @example
 * // layout.tsx (서버 컴포넌트)
 * const project = await getProjectById(params.id)
 */
export const getProjectById = cache(async (projectId: string) => {
  // 클라이언트 환경에서만 localStorage 접근
  if (typeof window !== 'undefined') {
    const storedProject = getStoredProject(projectId);
    if (storedProject) {
      return {
        id: storedProject.id,
        title: storedProject.title,
        description: storedProject.description,
        teamSize: storedProject.teamSize,
        duration: storedProject.duration,
      };
    }
  }

  // Mock 데이터에서 조회 (서버/클라이언트 모두 가능)
  const mockProject = mockProjects.find((p) => p.id === projectId);
  if (mockProject) {
    return {
      id: mockProject.id,
      title: mockProject.name,
      description: mockProject.description,
      teamSize: mockProject.teamMembers.length,
      duration: 90,
    };
  }

  throw new Error('Project not found');
});

// 🔄 백엔드 연동 후 (다음 주) 아래 코드로 교체:
// export const getProjectById = cache(async (projectId: string) => {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     // Next.js 캐싱 옵션 (1시간 캐시)
//     next: { revalidate: 3600 },
//   });
//
//   if (!res.ok) {
//     throw new Error('Failed to fetch project data');
//   }
//
//   return res.json();
// });

/**
 * 서버 컴포넌트 전용: 프로젝트의 WBS 태스크 목록 조회
 *
 * @param projectId - 프로젝트 ID
 * @returns WBS 태스크 목록
 */
export const getProjectTasks = cache(async (projectId: string) => {
  // Mock 단계: mockProjectTasks에서 조회
  const tasks = mockProjectTasks[projectId] || [];
  return tasks;
});

// 🔄 백엔드 연동 후:
// export const getProjectTasks = cache(async (projectId: string) => {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks`, {
//     next: { revalidate: 60 }, // 1분 캐시
//   });
//   if (!res.ok) throw new Error('Failed to fetch tasks');
//   return res.json();
// });
