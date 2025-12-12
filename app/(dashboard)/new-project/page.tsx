'use client';

import { NewProjectPage } from '@/features/project-creation/components/NewProjectPage';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewProject() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleProjectCreate = async (projectData: any) => {
    // 1. 유효성 검사
    if (!projectData.id) {
      alert('프로젝트 ID가 없습니다.');
      return;
    }

    try {
      setIsLoading(true); // 로딩 시작 (Form은 이걸 받아서 UI를 잠글 수 있음)

      // 2. [핵심] 실제 WBS 생성 API 호출 (질문하신 부분!)
      // 이 로직이 page.tsx에 있는 것이 맞습니다.
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/wbs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          projectId: projectData.id, // 스웨거에 있던 projectId 추가
          markdownContent: projectData.markdown, // 키 이름을 markdown -> markdownContent 로 변경
        }),
      });

      if (!response.ok) {
        const errorText = await response.text(); // 서버가 보낸 에러 메시지를 텍스트로 읽음
        console.error(`서버 에러 발생! 상태코드: ${response.status}`);
        console.error('서버 응답 메시지:', errorText);

        throw new Error(`서버 에러(${response.status}): ${errorText}`);
      }

      router.push(`/project/${projectData.id}/wbs-table`);
    } catch (error) {
      console.error(error);
      alert('오류가 발생했습니다.');
    } finally {
      setIsLoading(false); // 로딩 끝
    }
  };

  return <NewProjectPage onSubmit={handleProjectCreate} isLoading={isLoading} />;
}
