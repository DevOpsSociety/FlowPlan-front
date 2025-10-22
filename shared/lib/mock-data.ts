// --- 개발자 가이드 ---
// 이 파일은 gantt-task-react 라이브러리와 완전히 호환되는 데이터 구조를 제공합니다.
// gantt-task-react 라이브러리의 Task 타입과 정확히 일치하는 형식으로 작성되었습니다.

export interface Task {
  id: string
  name: string
  start: Date
  end: Date
  progress: number
  dependencies?: string[]
  type: "task" | "milestone" | "project"
  project?: string
  displayOrder?: number
  hideChildren?: boolean
  styles?: {
    backgroundColor?: string
    backgroundSelectedColor?: string
    progressColor?: string
    progressSelectedColor?: string
  }
}

// 샘플 프로젝트 데이터 - AI 기반 WBS 생성기 개발 프로젝트
export const mockTasks: Task[] = [
  // 메인 프로젝트
  {
    id: "project-1",
    name: "AI 기반 WBS 생성기 개발",
    start: new Date(2024, 0, 1),
    end: new Date(2024, 2, 31),
    progress: 35,
    type: "project",
    hideChildren: false,
  },

  // 1단계: 프로젝트 기획 및 설계
  {
    id: "phase-1",
    name: "1단계: 프로젝트 기획 및 설계",
    start: new Date(2024, 0, 1),
    end: new Date(2024, 0, 21),
    progress: 85,
    type: "project",
    project: "project-1",
  },
  {
    id: "task-1-1",
    name: "요구사항 분석 및 정의",
    start: new Date(2024, 0, 1),
    end: new Date(2024, 0, 7),
    progress: 100,
    type: "task",
    project: "project-1",
  },
  {
    id: "task-1-2",
    name: "시스템 아키텍처 설계",
    start: new Date(2024, 0, 8),
    end: new Date(2024, 0, 14),
    progress: 100,
    type: "task",
    project: "project-1",
    dependencies: ["task-1-1"],
  },
  {
    id: "task-1-3",
    name: "UI/UX 디자인 및 프로토타입",
    start: new Date(2024, 0, 15),
    end: new Date(2024, 0, 21),
    progress: 60,
    type: "task",
    project: "project-1",
    dependencies: ["task-1-2"],
  },

  // 2단계: 백엔드 개발
  {
    id: "phase-2",
    name: "2단계: 백엔드 개발",
    start: new Date(2024, 0, 22),
    end: new Date(2024, 1, 18),
    progress: 45,
    type: "project",
    project: "project-1",
  },
  {
    id: "task-2-1",
    name: "데이터베이스 설계 및 구축",
    start: new Date(2024, 0, 22),
    end: new Date(2024, 0, 28),
    progress: 100,
    type: "task",
    project: "project-1",
    dependencies: ["task-1-3"],
  },
  {
    id: "task-2-2",
    name: "AI 모델 개발 및 훈련",
    start: new Date(2024, 0, 29),
    end: new Date(2024, 1, 11),
    progress: 30,
    type: "task",
    project: "project-1",
    dependencies: ["task-2-1"],
  },
  {
    id: "task-2-3",
    name: "API 서버 개발",
    start: new Date(2024, 1, 5),
    end: new Date(2024, 1, 18),
    progress: 20,
    type: "task",
    project: "project-1",
    dependencies: ["task-2-1"],
  },

  // 3단계: 프론트엔드 개발
  {
    id: "phase-3",
    name: "3단계: 프론트엔드 개발",
    start: new Date(2024, 1, 12),
    end: new Date(2024, 2, 10),
    progress: 15,
    type: "project",
    project: "project-1",
  },
  {
    id: "task-3-1",
    name: "사용자 인터페이스 구현",
    start: new Date(2024, 1, 12),
    end: new Date(2024, 1, 25),
    progress: 40,
    type: "task",
    project: "project-1",
    dependencies: ["task-1-3"],
  },
  {
    id: "task-3-2",
    name: "간트차트 컴포넌트 개발",
    start: new Date(2024, 1, 19),
    end: new Date(2024, 2, 3),
    progress: 10,
    type: "task",
    project: "project-1",
    dependencies: ["task-3-1"],
  },
  {
    id: "task-3-3",
    name: "칸반보드 기능 구현",
    start: new Date(2024, 1, 26),
    end: new Date(2024, 2, 10),
    progress: 0,
    type: "task",
    project: "project-1",
    dependencies: ["task-3-1"],
  },

  // 4단계: 통합 및 테스트
  {
    id: "phase-4",
    name: "4단계: 통합 및 테스트",
    start: new Date(2024, 2, 4),
    end: new Date(2024, 2, 24),
    progress: 0,
    type: "project",
    project: "project-1",
  },
  {
    id: "task-4-1",
    name: "시스템 통합 테스트",
    start: new Date(2024, 2, 4),
    end: new Date(2024, 2, 17),
    progress: 0,
    type: "task",
    project: "project-1",
    dependencies: ["task-2-3", "task-3-2"],
  },
  {
    id: "task-4-2",
    name: "사용자 수용 테스트",
    start: new Date(2024, 2, 11),
    end: new Date(2024, 2, 24),
    progress: 0,
    type: "task",
    project: "project-1",
    dependencies: ["task-4-1"],
  },

  // 마일스톤
  {
    id: "milestone-1",
    name: "프로토타입 완성",
    start: new Date(2024, 0, 21),
    end: new Date(2024, 0, 21),
    progress: 100,
    type: "milestone",
    project: "project-1",
    dependencies: ["task-1-3"],
  },
  {
    id: "milestone-2",
    name: "베타 버전 출시",
    start: new Date(2024, 2, 10),
    end: new Date(2024, 2, 10),
    progress: 0,
    type: "milestone",
    project: "project-1",
    dependencies: ["task-3-3"],
  },
  {
    id: "milestone-3",
    name: "프로젝트 완료",
    start: new Date(2024, 2, 31),
    end: new Date(2024, 2, 31),
    progress: 0,
    type: "milestone",
    project: "project-1",
    dependencies: ["task-4-2"],
  },
]

// WBS 테이블용 데이터 구조
export interface WBSTask {
  id: string
  name: string
  assignee: string
  startDate: string
  endDate: string
  duration: number
  progress: number
  status: "todo" | "in-progress" | "done" | "blocked"
  dependencies: string[]
  level: number
}

export const mockWBSTasks: WBSTask[] = [
  {
    id: "task-1-1",
    name: "요구사항 분석 및 정의",
    assignee: "김프로",
    startDate: "2024-01-01",
    endDate: "2024-01-07",
    duration: 7,
    progress: 100,
    status: "done",
    dependencies: [],
    level: 0,
  },
  {
    id: "task-1-2",
    name: "시스템 아키텍처 설계",
    assignee: "이개발",
    startDate: "2024-01-08",
    endDate: "2024-01-14",
    duration: 7,
    progress: 100,
    status: "done",
    dependencies: ["task-1-1"],
    level: 0,
  },
  {
    id: "task-1-3",
    name: "UI/UX 디자인 및 프로토타입",
    assignee: "박디자인",
    startDate: "2024-01-15",
    endDate: "2024-01-21",
    duration: 7,
    progress: 60,
    status: "in-progress",
    dependencies: ["task-1-2"],
    level: 0,
  },
  {
    id: "task-2-1",
    name: "데이터베이스 설계 및 구축",
    assignee: "최데이터",
    startDate: "2024-01-22",
    endDate: "2024-01-28",
    duration: 7,
    progress: 100,
    status: "done",
    dependencies: ["task-1-3"],
    level: 0,
  },
  {
    id: "task-2-2",
    name: "AI 모델 개발 및 훈련",
    assignee: "정인공",
    startDate: "2024-01-29",
    endDate: "2024-02-11",
    duration: 14,
    progress: 30,
    status: "in-progress",
    dependencies: ["task-2-1"],
    level: 0,
  },
  {
    id: "task-2-3",
    name: "API 서버 개발",
    assignee: "이개발",
    startDate: "2024-02-05",
    endDate: "2024-02-18",
    duration: 14,
    progress: 20,
    status: "in-progress",
    dependencies: ["task-2-1"],
    level: 0,
  },
  {
    id: "task-3-1",
    name: "사용자 인터페이스 구현",
    assignee: "박디자인",
    startDate: "2024-02-12",
    endDate: "2024-02-25",
    duration: 14,
    progress: 40,
    status: "in-progress",
    dependencies: ["task-1-3"],
    level: 0,
  },
  {
    id: "task-3-2",
    name: "간트차트 컴포넌트 개발",
    assignee: "김프론트",
    startDate: "2024-02-19",
    endDate: "2024-03-03",
    duration: 14,
    progress: 10,
    status: "todo",
    dependencies: ["task-3-1"],
    level: 0,
  },
  {
    id: "task-3-3",
    name: "칸반보드 기능 구현",
    assignee: "김프론트",
    startDate: "2024-02-26",
    endDate: "2024-03-10",
    duration: 14,
    progress: 0,
    status: "todo",
    dependencies: ["task-3-1"],
    level: 0,
  },
  {
    id: "task-4-1",
    name: "시스템 통합 테스트",
    assignee: "최테스트",
    startDate: "2024-03-04",
    endDate: "2024-03-17",
    duration: 14,
    progress: 0,
    status: "todo",
    dependencies: ["task-2-3", "task-3-2"],
    level: 0,
  },
  {
    id: "task-4-2",
    name: "사용자 수용 테스트",
    assignee: "최테스트",
    startDate: "2024-03-11",
    endDate: "2024-03-24",
    duration: 14,
    progress: 0,
    status: "todo",
    dependencies: ["task-4-1"],
    level: 0,
  },
]

export interface HierarchicalWBSTask {
  id: string
  name: string
  assignee: string
  startDate: string
  endDate: string
  duration: number
  progress: number
  status: "todo" | "in-progress" | "done" | "blocked"
  dependencies: string[]
  depth: number // 0: 최상위(1.0), 1: 1단계 하위(1.1), 최대 깊이 2레벨
  subTasks: HierarchicalWBSTask[]
}

export const mockHierarchicalWBSTasks: HierarchicalWBSTask[] = [
  {
    id: "1",
    name: "1.0 프로젝트 기획",
    assignee: "PM",
    startDate: "2024-01-01",
    endDate: "2024-01-21",
    duration: 21,
    progress: 85,
    status: "in-progress",
    dependencies: [],
    depth: 0,
    subTasks: [
      {
        id: "1.1",
        name: "1.1 요구사항 분석",
        assignee: "기획자",
        startDate: "2024-01-01",
        endDate: "2024-01-07",
        duration: 7,
        progress: 100,
        status: "done",
        dependencies: [],
        depth: 1,
        subTasks: [],
      },
      {
        id: "1.2",
        name: "1.2 시스템 설계",
        assignee: "아키텍트",
        startDate: "2024-01-08",
        endDate: "2024-01-14",
        duration: 7,
        progress: 100,
        status: "done",
        dependencies: ["1.1"],
        depth: 1,
        subTasks: [],
      },
      {
        id: "1.3",
        name: "1.3 UI/UX 디자인",
        assignee: "디자이너",
        startDate: "2024-01-15",
        endDate: "2024-01-21",
        duration: 7,
        progress: 60,
        status: "in-progress",
        dependencies: ["1.2"],
        depth: 1,
        subTasks: [],
      },
    ],
  },
  {
    id: "2",
    name: "2.0 백엔드 개발",
    assignee: "백엔드 개발자",
    startDate: "2024-01-22",
    endDate: "2024-02-18",
    duration: 28,
    progress: 45,
    status: "in-progress",
    dependencies: ["1"],
    depth: 0,
    subTasks: [
      {
        id: "2.1",
        name: "2.1 로그인 구현",
        assignee: "백엔드 개발자",
        startDate: "2024-01-22",
        endDate: "2024-01-28",
        duration: 7,
        progress: 80,
        status: "in-progress",
        dependencies: [],
        depth: 1,
        subTasks: [],
      },
      {
        id: "2.2",
        name: "2.2 API 개발",
        assignee: "백엔드 개발자",
        startDate: "2024-01-29",
        endDate: "2024-02-11",
        duration: 14,
        progress: 30,
        status: "in-progress",
        dependencies: ["2.1"],
        depth: 1,
        subTasks: [],
      },
      {
        id: "2.3",
        name: "2.3 데이터베이스 구축",
        assignee: "백엔드 개발자",
        startDate: "2024-02-12",
        endDate: "2024-02-18",
        duration: 7,
        progress: 20,
        status: "todo",
        dependencies: ["2.2"],
        depth: 1,
        subTasks: [],
      },
    ],
  },
  {
    id: "3",
    name: "3.0 프론트엔드 개발",
    assignee: "프론트엔드 개발자",
    startDate: "2024-02-19",
    endDate: "2024-03-10",
    duration: 21,
    progress: 15,
    status: "todo",
    dependencies: ["2"],
    depth: 0,
    subTasks: [
      {
        id: "3.1",
        name: "3.1 컴포넌트 개발",
        assignee: "프론트엔드 개발자",
        startDate: "2024-02-19",
        endDate: "2024-02-25",
        duration: 7,
        progress: 40,
        status: "todo",
        dependencies: [],
        depth: 1,
        subTasks: [],
      },
      {
        id: "3.2",
        name: "3.2 페이지 구현",
        assignee: "프론트엔드 개발자",
        startDate: "2024-02-26",
        endDate: "2024-03-03",
        duration: 7,
        progress: 10,
        status: "todo",
        dependencies: ["3.1"],
        depth: 1,
        subTasks: [],
      },
      {
        id: "3.3",
        name: "3.3 통합 테스트",
        assignee: "프론트엔드 개발자",
        startDate: "2024-03-04",
        endDate: "2024-03-10",
        duration: 7,
        progress: 0,
        status: "todo",
        dependencies: ["3.2"],
        depth: 1,
        subTasks: [],
      },
    ],
  },
]

export interface Project {
  id: string
  name: string
  description: string
  status: "active" | "completed" | "on-hold" | "cancelled"
  startDate: string
  endDate: string
  progress: number
  teamMembers: string[]
  createdAt: string
  updatedAt: string
}

export const mockProjects: Project[] = [
  {
    id: "project-1",
    name: "AI 기반 WBS 생성기 개발",
    description: "인공지능을 활용한 자동 WBS 생성 및 프로젝트 관리 도구 개발",
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    progress: 35,
    teamMembers: ["김프로", "이개발", "박디자인", "최데이터", "정인공"],
    createdAt: "2023-12-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "project-2",
    name: "모바일 앱 리뉴얼",
    description: "기존 모바일 앱의 UI/UX 개선 및 성능 최적화",
    status: "active",
    startDate: "2024-02-01",
    endDate: "2024-04-30",
    progress: 20,
    teamMembers: ["박디자인", "김모바일", "이테스트"],
    createdAt: "2024-01-20",
    updatedAt: "2024-02-01",
  },
  {
    id: "project-3",
    name: "데이터 분석 플랫폼",
    description: "빅데이터 분석을 위한 실시간 대시보드 플랫폼 구축",
    status: "on-hold",
    startDate: "2024-03-01",
    endDate: "2024-06-30",
    progress: 5,
    teamMembers: ["최데이터", "정분석", "김시각화"],
    createdAt: "2024-02-10",
    updatedAt: "2024-02-20",
  },
]

// Project-specific hierarchical tasks
export const mockProjectTasks: Record<string, HierarchicalWBSTask[]> = {
  "project-1": mockHierarchicalWBSTasks,
  "project-2": [
    {
      id: "mobile-1",
      name: "1.0 UI/UX 리디자인",
      assignee: "박디자인",
      startDate: "2024-02-01",
      endDate: "2024-02-21",
      duration: 21,
      progress: 60,
      status: "in-progress",
      dependencies: [],
      depth: 0,
      subTasks: [
        {
          id: "mobile-1.1",
          name: "1.1 사용자 리서치",
          assignee: "박디자인",
          startDate: "2024-02-01",
          endDate: "2024-02-07",
          duration: 7,
          progress: 100,
          status: "done",
          dependencies: [],
          depth: 1,
          subTasks: [],
        },
        {
          id: "mobile-1.2",
          name: "1.2 와이어프레임 제작",
          assignee: "박디자인",
          startDate: "2024-02-08",
          endDate: "2024-02-14",
          duration: 7,
          progress: 80,
          status: "in-progress",
          dependencies: ["mobile-1.1"],
          depth: 1,
          subTasks: [],
        },
        {
          id: "mobile-1.3",
          name: "1.3 프로토타입 제작",
          assignee: "박디자인",
          startDate: "2024-02-15",
          endDate: "2024-02-21",
          duration: 7,
          progress: 20,
          status: "todo",
          dependencies: ["mobile-1.2"],
          depth: 1,
          subTasks: [],
        },
      ],
    },
    {
      id: "mobile-2",
      name: "2.0 앱 개발",
      assignee: "김모바일",
      startDate: "2024-02-22",
      endDate: "2024-03-31",
      duration: 38,
      progress: 10,
      status: "todo",
      dependencies: ["mobile-1"],
      depth: 0,
      subTasks: [
        {
          id: "mobile-2.1",
          name: "2.1 네이티브 컴포넌트 개발",
          assignee: "김모바일",
          startDate: "2024-02-22",
          endDate: "2024-03-07",
          duration: 14,
          progress: 30,
          status: "todo",
          dependencies: [],
          depth: 1,
          subTasks: [],
        },
        {
          id: "mobile-2.2",
          name: "2.2 API 연동",
          assignee: "김모바일",
          startDate: "2024-03-08",
          endDate: "2024-03-21",
          duration: 14,
          progress: 0,
          status: "todo",
          dependencies: ["mobile-2.1"],
          depth: 1,
          subTasks: [],
        },
        {
          id: "mobile-2.3",
          name: "2.3 성능 최적화",
          assignee: "김모바일",
          startDate: "2024-03-22",
          endDate: "2024-03-31",
          duration: 10,
          progress: 0,
          status: "todo",
          dependencies: ["mobile-2.2"],
          depth: 1,
          subTasks: [],
        },
      ],
    },
  ],
  "project-3": [
    {
      id: "data-1",
      name: "1.0 데이터 파이프라인 구축",
      assignee: "최데이터",
      startDate: "2024-03-01",
      endDate: "2024-04-15",
      duration: 45,
      progress: 10,
      status: "todo",
      dependencies: [],
      depth: 0,
      subTasks: [
        {
          id: "data-1.1",
          name: "1.1 데이터 수집 시스템",
          assignee: "최데이터",
          startDate: "2024-03-01",
          endDate: "2024-03-15",
          duration: 15,
          progress: 20,
          status: "todo",
          dependencies: [],
          depth: 1,
          subTasks: [],
        },
        {
          id: "data-1.2",
          name: "1.2 데이터 전처리",
          assignee: "정분석",
          startDate: "2024-03-16",
          endDate: "2024-03-31",
          duration: 16,
          progress: 0,
          status: "todo",
          dependencies: ["data-1.1"],
          depth: 1,
          subTasks: [],
        },
        {
          id: "data-1.3",
          name: "1.3 실시간 처리 엔진",
          assignee: "최데이터",
          startDate: "2024-04-01",
          endDate: "2024-04-15",
          duration: 15,
          progress: 0,
          status: "todo",
          dependencies: ["data-1.2"],
          depth: 1,
          subTasks: [],
        },
      ],
    },
  ],
}
