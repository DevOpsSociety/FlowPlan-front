'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, Users, MoreVertical, Eye, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/DropdownMenu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
// import { mockProjects, type Project } from '@/shared/lib/mockData';
// import { getProjects, deleteProject } from '@/shared/lib/storage';
import { ProjectListSkeleton } from '@/features/projects/skeletons/ProjectListSkeleton';

interface ProjectListPageProps {
  onBack: () => void;
  onSelectProject?: (project: any) => void;
}

interface ApiProject {
  id: number;
  projectName: string;
  projectType: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  memberCount: number;
  updatedAt: string; // ISO string
  team?: {
    members: any[];
  };
}

interface Project {
  id: string; // API의 number를 string으로 변환하여 사용
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export function ProjectListPage({ onBack, onSelectProject }: ProjectListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL; // API 기본 경로 설정
      const token = localStorage.getItem('authToken');

      // API 호출
      const response = await fetch(`${BASE_URL}/api/projects`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData: ApiProject[] = await response.json();

      // API 데이터를 렌더링 형식에 맞게 매핑
      const mappedProjects: Project[] = apiData.map((p) => ({
        id: String(p.id), // ID는 string으로 변환
        name: p.projectName,
        description: p.projectType || '프로젝트 상세 정보 없음', // projectType을 설명으로 임시 사용
        startDate: p.startDate,
        endDate: p.endDate,
        memberCount: p.team?.members?.length || p.memberCount || 1,
        createdAt: new Date(p.updatedAt).toISOString(), // 생성일 필드가 없으므로 updatedAt 사용
        updatedAt: p.updatedAt,
      }));

      setProjects(mappedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      // ... 에러 처리 로직 ...
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${BASE_URL}/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        console.log(`Project ${projectId} successfully deleted.`);
      } else {
        // API 에러 처리 (예: 404, 403)
        console.error(`Failed to delete project ${projectId}. Status: ${response.status}`);
        alert(
          '프로젝트 삭제에 실패했습니다. (권한 문제 또는 프로젝트가 존재하지 않을 수 있습니다.)'
        );
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('프로젝트 삭제 중 네트워크 오류가 발생했습니다.');
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  if (isLoading) {
    return <ProjectListSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="flex items-center gap-4 p-6">
          <div>
            <h1 className="text-2xl font-bold">프로젝트 목록</h1>
            <p className="text-muted-foreground">모든 프로젝트를 관리하고 추적하세요</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 검색 및 필터 */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="프로젝트 이름 또는 설명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 프로젝트 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectProject?.(project)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {' '}
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSelectProject?.(project)}>
                        <Eye className="h-4 w-4 mr-2" />
                        보기
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 상태 */}

                {/* 프로젝트 정보 */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {project.startDate} ~ {project.endDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{project.memberCount}명 참여</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">검색 결과가 없습니다</p>
              <p>다른 검색어나 필터를 시도해보세요</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
