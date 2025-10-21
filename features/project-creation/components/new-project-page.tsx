import { ProjectForm } from "@/features/project-creation/components/project-form";

interface NewProjectPageProps {
  onSubmit: (projectData: any) => void;
  isLoading?: boolean;
}

export function NewProjectPage({ onSubmit, isLoading }: NewProjectPageProps) {
  return (
    <div className="min-h-full bg-background">
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="flex items-center gap-4 p-6">
          <div>
            <h1 className="text-2xl font-bold">새 프로젝트 생성</h1>
            <p className="text-muted-foreground">AI가 도와주는 스마트한 프로젝트 계획을 시작하세요</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <ProjectForm onSubmit={onSubmit} isLoading={isLoading || false} />
        </div>
      </div>
    </div>
  );
}
