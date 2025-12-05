'use client';

import { NewProjectPage } from '@/features/project-creation/components/NewProjectPage';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewProject() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleProjectCreate = (projectData: any) => {
    if (projectData.id) {
      router.push(`/project/${projectData.id}/wbs-table`);
    } else {
      alert('프로젝트가 생성되었으나 ID를 찾을 수 없습니다.');
      router.push('/');
    }
  };

  return <NewProjectPage onSubmit={handleProjectCreate} isLoading={isLoading} />;
}
