## 설명
WBS 테이블, 간트차트, 칸반보드 3개 뷰의 실시간 동기화를 위한 전역 상태 관리 인프라 구축 및 간트차트/칸반보드 구현

## 작업 범위
- Zustand 전역 상태 관리 (3개 뷰 공용 인프라)
- 간트차트 구현 (gantt-task-react)
- 칸반보드 구현 (@hello-pangea/dnd + Shadcn)
- Zustand 사용 가이드 문서화 (WBS 담당자용)

## 기술 스택
| 기술 | 역할 | 선택 이유 |
|------|------|----------|
| Zustand | 클라이언트 상태 관리 | 파생 상태 메모이제이션 지원 |
| gantt-task-react | 간트차트 라이브러리 | TypeScript 지원, 무료 중 최고 완성도 |
| @hello-pangea/dnd | 칸반 드래그앤드롭 | Tailwind/Shadcn 완벽 호환 |

## 구현 체크리스트

### Phase 1: 기반 구축 (2시간)
- [ ] 패키지 설치: `zustand`, `gantt-task-react`, `@hello-pangea/dnd`
- [ ] Zustand 스토어 생성: `shared/stores/taskStore.ts`
  - [ ] CRUD 액션 구현: getTasks, updateTask, addTask, deleteTask
  - [ ] Selector 구현: getGanttTasks, getKanbanTasks (메모이제이션)
  - [ ] localStorage 영속성 설정
  - [ ] Redux DevTools 연동
- [ ] Adapter 함수 구현: `shared/adapters/taskAdapters.ts`
  - [ ] fromGanttTask() - Gantt에서 HierarchicalWBSTask 변환

### Phase 2: 간트차트 + 칸반보드 구현 (2시간)
- [ ] 간트차트 구현: `features/gantt/components/GanttChartView.tsx`
  - [ ] gantt-task-react 통합
  - [ ] Zustand 연동 (getGanttTasks, updateTask)
  - [ ] 드래그로 날짜 변경 - 자동 동기화
  - [ ] 진행률 수정 - 자동 동기화
  - [ ] Shadcn 테마 커스터마이징 (선택)
- [ ] 칸반보드 구현: `features/kanban/components/KanbanBoard.tsx`
  - [ ] @hello-pangea/dnd 드래그앤드롭
  - [ ] Shadcn 컴포넌트 사용 (Card, Badge, Progress)
  - [ ] Zustand 연동 (getKanbanTasks, updateTask)
  - [ ] 상태별 컬럼 (할 일, 진행 중, 완료, 차단됨)
  - [ ] 드래그로 상태 변경 - 자동 동기화
- [ ] 프로젝트 페이지 통합: `app/(dashboard)/project/[id]/page.tsx`
  - [ ] 간트차트 탭 추가
  - [ ] 칸반보드 탭 추가
  - [ ] 탭 전환 시 자동 동기화 확인

### Phase 3: 테스트 및 문서화 (30분)
- [ ] 동기화 테스트
  - [ ] 간트 날짜 변경 - 칸반 자동 업데이트
  - [ ] 칸반 상태 변경 - 간트 자동 업데이트
  - [ ] 페이지 새로고침 - localStorage 복원
- [ ] WBS 담당자 가이드 작성
  - [ ] PR Description에 Zustand 사용법 문서화
  - [ ] 코드 예시 제공
  - [ ] 제약사항 명시 (depth 제한, 자동 계산 로직)

## 테스트 시나리오
1. 간트차트에서 작업 드래그 - 날짜 변경이 칸반보드에 반영되는지 확인
2. 칸반보드에서 카드 드래그 (할 일 → 진행 중) - 간트차트 업데이트 확인
3. 작업 추가/삭제 - 모든 뷰 동기화 확인
4. 페이지 새로고침 - localStorage 영속성 확인
5. Redux DevTools로 상태 변경 추적

## 참고 문서
- [구현 계획](./WBS_GANTT_KANBAN_INTEGRATION_PLAN.md)
- [CLAUDE.md - 프로젝트 가이드라인](./CLAUDE.md)
- [WBS 담당자 가이드](./WBS_GANTT_KANBAN_INTEGRATION_PLAN.md#-wbs-담당자용-zustand-사용-가이드)

## 예상 작업 시간
총 4.5시간

## 후속 작업
- [ ] WBS 테이블 Zustand 연동 (다른 팀원 담당)

## 주의사항
1. Depth 제약: 최대 깊이 = 1 (CLAUDE.md 규정)
2. 자동 계산 로직: 상태 → 진행률, 기간 → 종료일
3. WBS 연동: 이 PR 이후 WBS 담당자가 `useTaskStore` 사용
4. 타입 일관성: `HierarchicalWBSTask` 타입 수정 금지 (OpenAPI Codegen 호환성)
