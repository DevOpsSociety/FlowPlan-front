// API 서비스 레이어 - 백엔드 연동을 위한 추상화 계층
import type {
  ApiResponse,
  ApiError,
  User,
  Comment,
  FileAttachment,
  Notification,
  ActivityLog,
  CollaborativeTask,
  CollaborativeProject,
  RealtimeEvent,
  TeamMember,
  UserRole,
} from './apiTypes';

class ApiService {
  private baseUrl: string;

  private token: string | null = null;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || '/api') {
    this.baseUrl = baseUrl;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 인증 관련
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // 프로젝트 관련
  async getProjects(): Promise<ApiResponse<CollaborativeProject[]>> {
    return this.request<CollaborativeProject[]>('/projects');
  }

  async getProject(id: string): Promise<ApiResponse<CollaborativeProject>> {
    return this.request<CollaborativeProject>(`/projects/${id}`);
  }

  async createProject(
    project: Partial<CollaborativeProject>
  ): Promise<ApiResponse<CollaborativeProject>> {
    return this.request<CollaborativeProject>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(
    id: string,
    updates: Partial<CollaborativeProject>
  ): Promise<ApiResponse<CollaborativeProject>> {
    return this.request<CollaborativeProject>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // 작업 관련
  async getTasks(projectId: string): Promise<ApiResponse<CollaborativeTask[]>> {
    return this.request<CollaborativeTask[]>(`/projects/${projectId}/tasks`);
  }

  async getTask(projectId: string, taskId: string): Promise<ApiResponse<CollaborativeTask>> {
    return this.request<CollaborativeTask>(`/projects/${projectId}/tasks/${taskId}`);
  }

  async createTask(
    projectId: string,
    task: Partial<CollaborativeTask>
  ): Promise<ApiResponse<CollaborativeTask>> {
    return this.request<CollaborativeTask>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(
    projectId: string,
    taskId: string,
    updates: Partial<CollaborativeTask>
  ): Promise<ApiResponse<CollaborativeTask>> {
    return this.request<CollaborativeTask>(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(projectId: string, taskId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // 댓글 관련
  async getComments(taskId: string): Promise<ApiResponse<Comment[]>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockCommentsData = await import('./collaborationMockData');
    const taskComments = mockCommentsData.mockComments.filter((c) => c.taskId === taskId);

    return {
      success: true,
      data: taskComments,
      message: 'Comments loaded successfully',
    };
  }

  async addComment(
    taskId: string,
    content: string,
    parentId?: string
  ): Promise<ApiResponse<Comment>> {
    console.log('[v0] Adding comment:', { taskId, content, parentId });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockCommentsData = await import('./collaborationMockData');
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      taskId,
      content,
      author: mockCommentsData.mockTeamMembers[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId,
      replies: [],
    };

    return {
      success: true,
      data: newComment,
      message: 'Comment added successfully',
    };
  }

  async updateComment(commentId: string, content: string): Promise<ApiResponse<Comment>> {
    console.log('[v0] Updating comment:', { commentId, content });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockCommentsData = await import('./collaborationMockData');
    const existingComment = mockCommentsData.mockComments.find((c) => c.id === commentId);

    if (!existingComment) {
      return {
        success: false,
        data: null as any,
        message: 'Comment not found',
      };
    }

    const updatedComment: Comment = {
      ...existingComment,
      content,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: updatedComment,
      message: 'Comment updated successfully',
    };
  }

  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    console.log('[v0] Deleting comment:', commentId);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      data: undefined as any,
      message: 'Comment deleted successfully',
    };
  }

  // 파일 첨부 관련
  async uploadFile(
    file: File,
    taskId?: string,
    commentId?: string
  ): Promise<ApiResponse<FileAttachment>> {
    console.log('[v0] Uploading file:', { fileName: file.name, taskId, commentId });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockFile: FileAttachment = {
      id: `file-${Date.now()}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl: URL.createObjectURL(file),
      uploadedBy: 'user-1',
      uploadedAt: new Date().toISOString(),
      taskId,
      commentId,
    };

    return {
      success: true,
      data: mockFile,
      message: 'File uploaded successfully',
    };
  }

  async deleteFile(fileId: string): Promise<ApiResponse<void>> {
    console.log('[v0] Deleting file:', fileId);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      data: undefined as any,
      message: 'File deleted successfully',
    };
  }

  // 팀 관리 관련
  async getTeamMembers(projectId: string): Promise<TeamMember[]> {
    const mockTeamMembersData = await import('./collaborationMockData');

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return mockTeamMembersData.mockTeamMembers;
  }

  async inviteTeamMember(projectId: string, email: string, role: UserRole): Promise<void> {
    console.log('[v0] Inviting team member:', { projectId, email, role });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // In real implementation, this would send an API request
    return Promise.resolve();
  }

  async removeTeamMember(projectId: string, memberId: string): Promise<void> {
    console.log('[v0] Removing team member:', { projectId, memberId });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return Promise.resolve();
  }

  async updateTeamMemberRole(
    projectId: string,
    memberId: string,
    newRole: UserRole
  ): Promise<void> {
    console.log('[v0] Updating member role:', { projectId, memberId, newRole });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return Promise.resolve();
  }

  // 알림 관련
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockNotificationsData = await import('./collaborationMockData');

    return {
      success: true,
      data: mockNotificationsData.mockNotifications,
      message: 'Notifications loaded successfully',
      timestamp: new Date().toISOString(),
    };
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    console.log('[v0] Marking notification as read:', notificationId);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      data: undefined as any,
      message: 'Notification marked as read',
      timestamp: new Date().toISOString(),
    };
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    console.log('[v0] Marking all notifications as read');

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      data: undefined as any,
      message: 'All notifications marked as read',
      timestamp: new Date().toISOString(),
    };
  }

  // 활동 로그 관련
  async getActivityLog(projectId: string): Promise<ApiResponse<ActivityLog[]>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockActivityData = await import('./collaborationMockData');
    const projectActivities = mockActivityData.mockActivityLogs.filter(
      (log) => log.projectId === projectId
    );

    return {
      success: true,
      data: projectActivities,
      message: 'Activity log loaded successfully',
      timestamp: new Date().toISOString(),
    };
  }

  // 실시간 이벤트 (WebSocket 연결)
  connectToRealtime(projectId: string, onEvent: (event: RealtimeEvent) => void): WebSocket | null {
    if (typeof window === 'undefined') return null;

    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/realtime/${projectId}?token=${this.token}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const realtimeEvent: RealtimeEvent = JSON.parse(event.data);
        onEvent(realtimeEvent);
      } catch (error) {
        console.error('Failed to parse realtime event:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }
}

// 싱글톤 인스턴스
export const apiService = new ApiService();
export default apiService;
