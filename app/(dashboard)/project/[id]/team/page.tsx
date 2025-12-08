'use client';

import { TeamManagementPage } from '@/features/team/components/TeamManagementPage';
import { useParams, useRouter } from 'next/navigation';

export default function TeamManagement() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const handleBack = () => {
    router.push(`/project/${projectId}`);
  };

  return (
    <div className="p-6">
      <TeamManagementPage projectId={projectId} onBack={handleBack} />
    </div>
  );
}
