"use client"

import { useState } from "react"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

interface AIMarkdownEditorProps {
  onComplete: (markdown: string) => void
  isGenerating?: boolean
}

// AI가 생성할 마크다운 예시
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
- 사용자 피드백 수집 및 개선`

export function AIMarkdownEditor({ onComplete, isGenerating = false }: AIMarkdownEditorProps) {
  const [step, setStep] = useState<"input" | "edit" | "complete">("input")
  const [userInput, setUserInput] = useState("")
  const [markdown, setMarkdown] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateMarkdown = async () => {
    if (!userInput.trim()) return

    setIsLoading(true)
    // AI 생성 시뮬레이션 (실제로는 API 호출)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setMarkdown(EXAMPLE_MARKDOWN)
    setIsLoading(false)
    setStep("edit")
  }

  const handleGenerateWBS = () => {
    onComplete(markdown)
    setStep("complete")
  }

  const handleBackToInput = () => {
    setStep("input")
    setUserInput("")
    setMarkdown("")
  }

  // 상태 1: 초기 아이디어 입력
  if (step === "input") {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">프로젝트 아이디어를 자유롭게 입력하세요</h2>
          <p className="text-muted-foreground">
            AI가 구조화된 마크다운 초안을 생성해드립니다. 이후 직접 수정하실 수 있습니다.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Textarea
                placeholder="예: 신입생을 위한 대학 캠퍼스 투어 챗봇 개발. 주요 기능은 실시간 길찾기, 건물 정보 안내, 편의시설 추천 등을 포함해야 함."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                rows={12}
                className="resize-none text-base"
              />

              <Button
                onClick={handleGenerateMarkdown}
                disabled={!userInput.trim() || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    마크다운 초안 생성 중...
                  </>
                ) : (
                  "마크다운 초안 생성하기"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 상태 2: 마크다운 검토 및 수정
  if (step === "edit") {
    return (
      <div className="h-[calc(100vh-12rem)] flex flex-col space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">AI가 생성한 초안을 검토하고 수정하세요</h2>
          <p className="text-sm text-muted-foreground">
            왼쪽에서 미리보기를 확인하고, 오른쪽에서 직접 수정할 수 있습니다.
          </p>
        </div>

        <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-lg border">
          {/* 왼쪽 패널: 미리보기 */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="border-b px-4 py-3 bg-muted/50">
                <Label className="text-sm font-semibold">AI가 생성한 초안</Label>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{markdown}</ReactMarkdown>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* 오른쪽 패널: 편집기 */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="border-b px-4 py-3 bg-muted/50">
                <Label className="text-sm font-semibold">직접 수정하기</Label>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <Textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="h-full min-h-full resize-none font-mono text-sm border-0 focus-visible:ring-0"
                  placeholder="마크다운을 입력하세요..."
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* 하단 버튼 영역 */}
        <div className="flex items-center justify-center gap-4 pb-4">
          <Button variant="outline" onClick={handleBackToInput} size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            초기 아이디어 다시 입력
          </Button>
          <Button onClick={handleGenerateWBS} disabled={!markdown.trim() || isGenerating} size="lg">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                WBS 생성 중...
              </>
            ) : (
              "이 내용으로 WBS 생성하기"
            )}
          </Button>
        </div>
      </div>
    )
  }

  return null
}
