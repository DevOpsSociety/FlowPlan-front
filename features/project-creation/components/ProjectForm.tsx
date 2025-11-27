'use client';

import type React from 'react';
import { useState } from 'react';
import { Loader2, Plus, ChevronDown, ChevronUp, ArrowLeft, Eye, Edit3 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/shared/ui/resizable';
import ReactMarkdown from 'react-markdown';

interface CreateProjectRequest {
  projectName: string;
  projectType: string;
  teamSize: number;
  expectedDurationDays: number;
  startDate: string;
  endDate: string;
  budget: number;
  priority: string;
  stakeholders: string[];
  deliverables: string[];
  risks: string[];
  detailedRequirements: string;
}

interface CreateProjectResponse {
  projectId: number;
  markdownContent: string;
}

interface ProjectFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const EXAMPLE_MARKDOWN = `# AI 기반 WBS 생성기 개발 프로젝트

## 1. 기획 단계
- 요구사항 분석 및 정의
- 사용자 스토리 작성
- 기술 스택 선정
- 프로젝트 일정 수립

## 2. 백엔드 개발
### 2.1 API 설계
- RESTful API 엔드포인트 설계
- 데이터베이스 스키마 설계
- API 문서 작성

### 2.2 핵심 기능 구현
- 사용자 인증 시스템
- 프로젝트 CRUD 기능
- WBS 생성 AI 엔진 통합
- 데이터 저장 및 관리

### 2.3 테스트 및 최적화
- 단위 테스트 작성
- 통합 테스트 수행
- 성능 최적화

## 3. 프론트엔드 개발
### 3.1 UI/UX 디자인
- 와이어프레임 제작
- 디자인 시스템 구축
- 프로토타입 제작

### 3.2 컴포넌트 개발
- 프로젝트 입력 폼
- WBS 테이블 뷰
- 간트차트 시각화
- 칸반 보드 뷰

### 3.3 상태 관리 및 API 연동
- 전역 상태 관리 설정
- API 통신 레이어 구현
- 에러 핸들링

## 4. 배포 및 운영
- CI/CD 파이프라인 구축
- 프로덕션 환경 배포
- 모니터링 시스템 설정
- 사용자 피드백 수집 및 개선`;

export function ProjectForm({ onSubmit, isLoading }: ProjectFormProps) {
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');

  const [createdProjectId, setCreatedProjectId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    projectName: '',
    subject: '',
    teamSize: '',
    duration: '',
    startDate: '',
    endDate: '',
    budget: '',
    priority: '',
    stakeholders: '',
    deliverables: '',
    risks: '',
    requirements: '',
  });
  const [markdown, setMarkdown] = useState('');
  const [isGeneratingMarkdown, setIsGeneratingMarkdown] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateMarkdown = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingMarkdown(true);

    try {
      // 프론트엔드 State 데이터를 API 스펙에 맞게 변환
      const requestBody: CreateProjectRequest = {
        projectName: formData.projectName,
        projectType: formData.subject, // 주제를 projectType으로 매핑
        teamSize: Number(formData.teamSize) || 0, // 숫자로 변환
        expectedDurationDays: (Number(formData.duration) || 0) * 30, // 개월 수를 일수로 변환 (대략적)
        startDate: formData.startDate || new Date().toISOString(), // 값이 없으면 현재 날짜
        endDate: formData.endDate || new Date().toISOString(),
        budget: Number(formData.budget) || 0, // 숫자로 변환
        priority: formData.priority || '보통',
        // 쉼표(,)로 구분된 문자열을 배열로 변환하고 앞뒤 공백 제거
        stakeholders: formData.stakeholders
          ? formData.stakeholders
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        deliverables: formData.deliverables
          ? formData.deliverables
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        risks: formData.risks
          ? formData.risks
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        detailedRequirements: formData.requirements,
      };

      const token = localStorage.getItem('authToken');

      const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: CreateProjectResponse = await response.json();

      // 응답 데이터 처리
      if (data.markdownContent) {
        setMarkdown(data.markdownContent);
        setCreatedProjectId(data.projectId); // 생성된 프로젝트 ID 저장
        setStep('review'); // 리뷰 단계로 이동
      } else {
        alert('AI가 내용을 생성하지 못했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Error generating WBS:', error);

      alert('프로젝트 생성 중 오류가 발생했습니다. (백엔드 연결 확인 필요)');
    } finally {
      setIsGeneratingMarkdown(false);
    }
  };

  const handleFinalSubmit = () => {
    const projectData = {
      ...formData,
      id: createdProjectId,
      markdown: markdown,
      generatedAt: new Date().toISOString(),
    };
    onSubmit(projectData);
  };

  const handleBackToInput = () => {
    setStep('input');
    setMarkdown('');
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">AI가 WBS를 생성하고 있습니다...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="space-y-4 pb-8 max-w-4xl mx-auto">
        {' '}
        {/* 폭을 좀 넓혔습니다 */}
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-2xl font-bold">AI가 생성한 초안을 검토하세요</h2>
          <p className="text-sm text-muted-foreground">
            내용을 확인하고 필요한 부분을 직접 수정할 수 있습니다.
          </p>
        </div>
        {/* 탭 버튼 영역 */}
        <div className="flex items-center space-x-1 border-b pb-2 mb-4">
          <Button
            variant={activeTab === 'preview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('preview')}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            미리보기
          </Button>
          <Button
            variant={activeTab === 'edit' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('edit')}
            className="gap-2"
          >
            <Edit3 className="w-4 h-4" />
            수정하기
          </Button>
        </div>
        {/* 탭 컨텐츠 영역 (높이 고정) */}
        <div className="min-h-[500px] max-h-[700px] rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          {/* 1. 미리보기 탭 */}
          {activeTab === 'preview' && (
            <div className="h-[600px] overflow-y-auto p-8 bg-white/50 dark:bg-black/20">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {/* 마크다운이 비어있을 때 안내 문구 추가 
                  (수정하다가 다 지워버렸을 경우 대비)
                */}
                {markdown ? (
                  <ReactMarkdown>{markdown}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground text-center py-20">내용이 없습니다.</p>
                )}
              </div>
            </div>
          )}

          {/* 2. 수정하기 탭 */}
          {activeTab === 'edit' && (
            <div className="h-[600px] p-0">
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="w-full h-full resize-none font-mono text-sm border-0 focus-visible:ring-0 p-6 leading-relaxed"
                placeholder="# 프로젝트 제목\n\n내용을 입력하세요..."
                spellCheck={false}
              />
            </div>
          )}
        </div>
        {/* 하단 버튼 영역 */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button variant="outline" onClick={handleBackToInput} size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            다시 생성하기
          </Button>
          <Button onClick={handleFinalSubmit} disabled={!markdown.trim()} size="lg">
            이 내용으로 WBS 생성하기
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">새로운 프로젝트 계획 시작하기</h2>
        <p className="text-muted-foreground">
          프로젝트 정보를 입력하면 AI가 마크다운 초안을 생성합니다. 검토 후 WBS와 간트차트가
          생성됩니다.
        </p>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={handleGenerateMarkdown} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="projectName">프로젝트 명</Label>
              <Input
                id="projectName"
                placeholder="예: FlowPlan 대시보드 개발 프로젝트"
                value={formData.projectName}
                onChange={(e) => handleChange('projectName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">프로젝트 주제</Label>
              <Input
                id="subject"
                placeholder="예: AI 기반 WBS 생성기 개발"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamSize">참여 인원</Label>
                <Input
                  id="teamSize"
                  type="number"
                  placeholder="예: 5"
                  value={formData.teamSize}
                  onChange={(e) => handleChange('teamSize', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">예상 기간 (개월)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="예: 3"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  required
                />
              </div>
            </div>

            <Collapsible open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    추가 옵션 (WBS 구체화)
                  </div>
                  {showAdvancedOptions ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">시작일</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">마감일</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">예산 (만원)</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="예: 5000"
                      value={formData.budget}
                      onChange={(e) => handleChange('budget', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">우선순위</Label>
                    <Input
                      id="priority"
                      placeholder="예: 높음, 보통, 낮음"
                      value={formData.priority}
                      onChange={(e) => handleChange('priority', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stakeholders">주요 이해관계자</Label>
                  <Input
                    id="stakeholders"
                    placeholder="예: 개발팀, 디자인팀, PM, 클라이언트"
                    value={formData.stakeholders}
                    onChange={(e) => handleChange('stakeholders', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliverables">주요 산출물</Label>
                  <Textarea
                    id="deliverables"
                    placeholder="예: 웹 애플리케이션, API 문서, 사용자 매뉴얼, 테스트 보고서"
                    value={formData.deliverables}
                    onChange={(e) => handleChange('deliverables', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risks">예상 리스크</Label>
                  <Textarea
                    id="risks"
                    placeholder="예: 기술적 복잡성, 일정 지연 가능성, 리소스 부족"
                    value={formData.risks}
                    onChange={(e) => handleChange('risks', e.target.value)}
                    rows={2}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="space-y-2">
              <Label htmlFor="requirements">더 구체적인 요구사항</Label>
              <Textarea
                id="requirements"
                placeholder="예: 주요 기능으로 사용자 인증, 프로젝트 저장, 데이터 시각화를 포함..."
                value={formData.requirements}
                onChange={(e) => handleChange('requirements', e.target.value)}
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={
                !formData.projectName ||
                !formData.subject ||
                !formData.teamSize ||
                !formData.duration ||
                isGeneratingMarkdown
              }
            >
              {isGeneratingMarkdown ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AI 초안 생성 중...
                </>
              ) : (
                '프로젝트 생성하기'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
