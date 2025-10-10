// API 응답 및 요청 타입 정의
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
  timestamp?: string
}

export interface ApiError {
  message: string
  code: string
  details?: any
}

// 사용자 및 팀 관련 타입
export type UserRole = "owner" | "admin" | "member" | "viewer"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role?: UserRole
  status: "active" | "inactive" | "pending"
  createdAt: string
  updatedAt: string
}

export interface TeamMember extends User {
  role: UserRole
  joinedAt: string
}

export interface Team {
  id: string
  name: string
  description?: string
  members: TeamMember[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

// 댓글 시스템
export interface Comment {
  id: string
  content: string
  author: User
  taskId: string
  parentId?: string // 대댓글용
  replies?: Comment[]
  createdAt: string
  updatedAt: string
}

// 파일 첨부
export interface FileAttachment {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  fileUrl: string
  uploadedBy: string
  uploadedAt: string
  taskId?: string
  commentId?: string
}

// 알림 시스템
export interface Notification {
  id: string
  type: "task_assigned" | "task_updated" | "comment_added" | "mention" | "deadline_approaching" | "project_updated"
  title: string
  message: string
  recipient: string
  sender?: User
  relatedId: string // 관련된 작업, 프로젝트, 댓글 등의 ID
  isRead: boolean
  createdAt: string
}

// 활동 로그
export interface ActivityLog {
  id: string
  type: "task_created" | "task_updated" | "task_deleted" | "comment_added" | "file_uploaded" | "member_added"
  description: string
  user: User
  projectId: string
  taskId?: string
  metadata?: Record<string, any>
  createdAt: string
}

// 확장된 Task 타입 (협업 기능 포함)
export interface CollaborativeTask {
  id: string
  name: string
  description?: string
  assignee?: User
  assignees: User[] // 다중 담당자 지원
  reporter: User
  priority: "low" | "medium" | "high" | "critical"
  labels: string[]
  estimatedHours?: number
  actualHours?: number
  start: Date
  end: Date
  progress: number
  status: "todo" | "in-progress" | "review" | "done" | "blocked"
  dependencies: string[]
  type: "task" | "milestone" | "project"
  project: string
  comments: Comment[]
  attachments: FileAttachment[]
  watchers: string[] // 작업을 지켜보는 사용자들
  createdAt: string
  updatedAt: string
  createdBy: string
  lastModifiedBy: string
}

// 프로젝트 확장 타입
export interface CollaborativeProject {
  id: string
  name: string
  description: string
  status: "active" | "completed" | "on-hold" | "cancelled"
  startDate: string
  endDate: string
  progress: number
  team: Team
  owner: User
  visibility: "private" | "team" | "public"
  settings: {
    allowComments: boolean
    allowFileUploads: boolean
    requireApproval: boolean
    notificationSettings: {
      emailNotifications: boolean
      pushNotifications: boolean
      slackIntegration?: string
    }
  }
  createdAt: string
  updatedAt: string
  archivedAt?: string
}

// 실시간 이벤트 타입
export interface RealtimeEvent {
  type: "task_updated" | "comment_added" | "user_joined" | "user_left" | "file_uploaded"
  payload: any
  userId: string
  projectId: string
  timestamp: string
}
