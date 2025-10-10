"use client";

import { NewProjectPage } from "@/components/new-project-page";
import { saveProject } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProject() {
  const router = useRouter();
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    if (currentProjectId) {
      router.push(`/project/${currentProjectId}`);
    } else {
      router.push("/");
    }
  };

  const handleProjectCreate = async (projectData: any) => {
    setIsLoading(true);
    // AI 프로젝트 생성 시뮬레이션
    setTimeout(() => {
      const newProject = {
        id: `project-${Date.now()}`,
        title: `${projectData.subject} 프로젝트`,
        description: projectData.description || `${projectData.subject} 관련 프로젝트`,
        teamSize: projectData.teamSize || 5,
        duration: projectData.duration || 90,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wbsTasks: [],
      };

      saveProject(newProject);
      setIsLoading(false);
      router.push(`/project/${newProject.id}`);
    }, 3000);
  };

  return <NewProjectPage onBack={handleBack} onSubmit={handleProjectCreate} isLoading={isLoading} />;
}
