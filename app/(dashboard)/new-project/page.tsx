"use client";

import { NewProjectPage } from "@/features/project-creation/components/new-project-page";
import { saveProject } from "@/shared/lib/storage";
import router from "next/router";
import { useState } from "react";

export default function NewProject() {
  const [isLoading, setIsLoading] = useState(false);


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

  return <NewProjectPage onSubmit={handleProjectCreate} isLoading={isLoading} />;
}
