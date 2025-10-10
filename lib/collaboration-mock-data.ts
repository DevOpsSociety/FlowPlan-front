// 협업 기능을 위한 Mock 데이터
import type {
  User,
  Comment,
  FileAttachment,
  Notification,
  ActivityLog,
  CollaborativeProject,
  TeamMember,
} from "./api-types"

// Mock 사용자 데이터
export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "김프로",
    email: "kim.pro@company.com",
    avatar: "/professional-avatar.png",
    role: "manager",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "user-2",
    name: "이개발",
    email: "lee.dev@company.com",
    avatar: "/developer-avatar.png",
    role: "member",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "user-3",
    name: "박디자인",
    email: "park.design@company.com",
    avatar: "/diverse-designer-avatars.png",
    role: "member",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "user-4",
    name: "최데이터",
    email: "choi.data@company.com",
    avatar: "/data-scientist-avatar.jpg",
    role: "member",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "user-5",
    name: "정인공",
    email: "jung.ai@company.com",
    avatar: "/ai-engineer-avatar.jpg",
    role: "member",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
]

// Mock 팀 멤버 데이터
export const mockTeamMembers: TeamMember[] = [
  {
    id: "user-1",
    name: "김프로",
    email: "kim.pro@company.com",
    avatar: "/professional-avatar.png",
    role: "owner",
    status: "active",
    joinedAt: "2024-01-01T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "user-2",
    name: "이개발",
    email: "lee.dev@company.com",
    avatar: "/developer-avatar.png",
    role: "admin",
    status: "active",
    joinedAt: "2024-01-01T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "user-3",
    name: "박디자인",
    email: "park.design@company.com",
    avatar: "/diverse-designer-avatars.png",
    role: "member",
    status: "active",
    joinedAt: "2024-01-02T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "user-4",
    name: "최데이터",
    email: "choi.data@company.com",
    avatar: "/data-scientist-avatar.jpg",
    role: "member",
    status: "active",
    joinedAt: "2024-01-03T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "user-5",
    name: "정인공",
    email: "jung.ai@company.com",
    avatar: "/ai-engineer-avatar.jpg",
    role: "member",
    status: "active",
    joinedAt: "2024-01-05T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
]

// Mock 댓글 데이터
export const mockComments: Comment[] = [
  {
    id: "comment-1",
    content: "요구사항 분석이 거의 완료되었습니다. 내일 리뷰 미팅을 진행하면 좋을 것 같습니다.",
    author: mockTeamMembers[0],
    taskId: "task-1-1",
    createdAt: "2024-01-15T09:30:00Z",
    updatedAt: "2024-01-15T09:30:00Z",
    replies: [],
  },
  {
    id: "comment-2",
    content: "@김프로 좋습니다! 오후 2시는 어떠신가요?",
    author: mockTeamMembers[1],
    taskId: "task-1-1",
    parentId: "comment-1",
    createdAt: "2024-01-15T10:15:00Z",
    updatedAt: "2024-01-15T10:15:00Z",
    replies: [],
  },
  {
    id: "comment-3",
    content: "UI 프로토타입 초안을 첨부합니다. 피드백 부탁드립니다.",
    author: mockTeamMembers[2],
    taskId: "task-1-3",
    createdAt: "2024-01-20T14:30:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    replies: [],
  },
]

// Mock 파일 첨부 데이터
export const mockFileAttachments: FileAttachment[] = [
  {
    id: "file-1",
    fileName: "UI_Prototype_v1.fig",
    fileSize: 2048000,
    fileType: "application/figma",
    fileUrl: "/files/UI_Prototype_v1.fig",
    uploadedBy: "user-3",
    uploadedAt: "2024-01-20T14:30:00Z",
    taskId: "task-1-3",
  },
  {
    id: "file-2",
    fileName: "requirements_document.pdf",
    fileSize: 1024000,
    fileType: "application/pdf",
    fileUrl: "/files/requirements_document.pdf",
    uploadedBy: "user-1",
    uploadedAt: "2024-01-10T11:00:00Z",
    taskId: "task-1-1",
  },
  {
    id: "file-3",
    fileName: "database_schema.sql",
    fileSize: 512000,
    fileType: "text/sql",
    fileUrl: "/files/database_schema.sql",
    uploadedBy: "user-4",
    uploadedAt: "2024-01-25T16:45:00Z",
    taskId: "task-2-1",
  },
]

// Mock 알림 데이터
export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "task_assigned",
    title: "새 작업이 할당되었습니다",
    message: '김프로님이 "API 서버 개발" 작업을 할당했습니다.',
    recipient: "user-2",
    sender: mockTeamMembers[0],
    relatedId: "task-2-3",
    isRead: false,
    createdAt: "2024-01-22T09:00:00Z",
  },
  {
    id: "notif-2",
    type: "comment_added",
    title: "새 댓글이 추가되었습니다",
    message: '박디자인님이 "UI/UX 디자인 및 프로토타입" 작업에 댓글을 남겼습니다.',
    recipient: "user-1",
    sender: mockTeamMembers[2],
    relatedId: "task-1-3",
    isRead: false,
    createdAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "notif-3",
    type: "deadline_approaching",
    title: "마감일이 임박했습니다",
    message: '"시스템 아키텍처 설계" 작업의 마감일이 2일 남았습니다.',
    recipient: "user-2",
    relatedId: "task-1-2",
    isRead: true,
    createdAt: "2024-01-12T08:00:00Z",
  },
  {
    id: "notif-4",
    type: "mention",
    title: "댓글에서 언급되었습니다",
    message: "이개발님이 댓글에서 회원님을 언급했습니다.",
    recipient: "user-1",
    sender: mockTeamMembers[1],
    relatedId: "comment-2",
    isRead: false,
    createdAt: "2024-01-15T10:15:00Z",
  },
]

// Mock 활동 로그 데이터
export const mockActivityLogs: ActivityLog[] = [
  {
    id: "activity-1",
    type: "task_created",
    description: '새 작업 "요구사항 분석 및 정의"를 생성했습니다.',
    user: mockTeamMembers[0],
    projectId: "project-1",
    taskId: "task-1-1",
    createdAt: "2024-01-01T09:00:00Z",
  },
  {
    id: "activity-2",
    type: "comment_added",
    description: '"요구사항 분석 및 정의" 작업에 댓글을 추가했습니다.',
    user: mockTeamMembers[0],
    projectId: "project-1",
    taskId: "task-1-1",
    metadata: { commentId: "comment-1" },
    createdAt: "2024-01-15T09:30:00Z",
  },
  {
    id: "activity-3",
    type: "file_uploaded",
    description: '"UI/UX 디자인 및 프로토타입" 작업에 파일을 업로드했습니다.',
    user: mockTeamMembers[2],
    projectId: "project-1",
    taskId: "task-1-3",
    metadata: { fileName: "UI_Prototype_v1.fig" },
    createdAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "activity-4",
    type: "task_updated",
    description: '"시스템 아키텍처 설계" 작업의 진행률을 100%로 업데이트했습니다.',
    user: mockTeamMembers[1],
    projectId: "project-1",
    taskId: "task-1-2",
    metadata: { field: "progress", oldValue: 80, newValue: 100 },
    createdAt: "2024-01-14T16:00:00Z",
  },
  {
    id: "activity-5",
    type: "member_added",
    description: "정인공님을 프로젝트 팀에 추가했습니다.",
    user: mockTeamMembers[0],
    projectId: "project-1",
    metadata: { newMemberId: "user-5" },
    createdAt: "2024-01-05T10:00:00Z",
  },
]

// Mock 협업 프로젝트 데이터
export const mockCollaborativeProjects: CollaborativeProject[] = [
  {
    id: "project-1",
    name: "AI 기반 WBS 생성기 개발",
    description: "인공지능을 활용한 자동 WBS 생성 및 프로젝트 관리 도구 개발",
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    progress: 35,
    team: {
      id: "team-1",
      name: "AI 개발팀",
      description: "AI 기반 프로젝트 관리 도구 개발팀",
      members: mockTeamMembers,
      createdBy: "user-1",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    owner: mockTeamMembers[0],
    visibility: "team",
    settings: {
      allowComments: true,
      allowFileUploads: true,
      requireApproval: false,
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: true,
      },
    },
    createdAt: "2023-12-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
]

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  COMMENTS: "collaboration_comments",
  NOTIFICATIONS: "collaboration_notifications",
  ACTIVITY_LOGS: "collaboration_activity_logs",
  FILE_ATTACHMENTS: "collaboration_files",
  CURRENT_USER: "current_user",
} as const

// Mock 데이터 초기화 함수
export function initializeMockData() {
  if (typeof window === "undefined") return

  // 로컬 스토리지에 Mock 데이터 저장
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(mockComments))
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(mockNotifications))
  localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(mockActivityLogs))
  localStorage.setItem(STORAGE_KEYS.FILE_ATTACHMENTS, JSON.stringify(mockFileAttachments))
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(mockTeamMembers[0])) // 현재 사용자를 김프로로 설정
}

// Mock 데이터 가져오기 함수들
export function getMockComments(taskId?: string): Comment[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(STORAGE_KEYS.COMMENTS)
  const comments = stored ? JSON.parse(stored) : mockComments

  return taskId ? comments.filter((c: Comment) => c.taskId === taskId) : comments
}

export function getMockNotifications(userId?: string): Notification[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
  const notifications = stored ? JSON.parse(stored) : mockNotifications

  return userId ? notifications.filter((n: Notification) => n.recipient === userId) : notifications
}

export function getMockActivityLogs(projectId?: string): ActivityLog[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS)
  const logs = stored ? JSON.parse(stored) : mockActivityLogs

  return projectId ? logs.filter((l: ActivityLog) => l.projectId === projectId) : logs
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return stored ? JSON.parse(stored) : mockTeamMembers[0]
}
