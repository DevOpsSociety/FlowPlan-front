import type { TaskFlatDto } from '@/shared/api/taskTypes';
import type { Task, TaskStatus } from '@/shared/lib/apiTypes';
import type { ITask as SvarTask } from '@svar-ui/react-gantt';

/**
 * 칸반 상태를 Task의 status로 변환
 * 칸반보드에서 드래그앤드롭 시 사용
 */
export const kanbanStatusToTaskStatus = (
  kanbanStatus: 'todo' | 'in-progress' | 'done'
): TaskStatus => {
  const statusMapping: Record<'todo' | 'in-progress' | 'done', TaskStatus> = {
    todo: '할일',
    'in-progress': '진행중',
    done: '완료',
  };

  return statusMapping[kanbanStatus];
};

/**
 * Task의 status를 칸반 상태로 변환
 * 칸반보드는 3칸 레이아웃(할일/진행중/완료) 사용
 */
export const taskStatusToKanbanStatus = (status: string): 'todo' | 'in-progress' | 'done' => {
  const mapping: Record<string, 'todo' | 'in-progress' | 'done'> = {
    할일: 'todo',
    진행중: 'in-progress',
    완료: 'done',
  };
  return mapping[status] || 'todo';
};

/**
 * 상태에 따른 진행률 자동 계산
 * CLAUDE.md의 자동 계산 로직 구현
 */
export const calculateProgressFromStatus = (status: TaskStatus): number => {
  const progressMapping: Record<TaskStatus, number> = {
    할일: 0,
    진행중: 50,
    완료: 100,
  };

  return progressMapping[status];
};

/**
 * 기간(duration_days)으로부터 종료일 자동 계산
 * CLAUDE.md의 자동 계산 로직 구현
 *
 * Duration의 의미:
 * - duration = 1: 시작일과 종료일이 같음 (1일간 작업)
 * - duration = 2: 종료일 = 시작일 + 1 (2일간 작업)
 * - duration = n: 종료일 = 시작일 + (n-1)
 */
export const calculateEndDateFromDuration = (startDate: string, durationDays: number): string => {
  const start = new Date(startDate);
  const end = new Date(start);
  // duration - 1을 더함 (duration=1이면 0일 추가, 즉 시작일과 같음)
  end.setDate(start.getDate() + (durationDays - 1));
  return end.toISOString().split('T')[0];
};

/**
 * 계층 구조의 Task 배열을 평탄화
 * Gantt 차트와 Kanban 보드에서 모든 작업을 단일 배열로 처리할 때 사용
 * @param tasks - 계층 구조를 가진 Task 배열
 * @returns 평탄화된 Task 배열
 */
export const flattenTasks = (tasks: Task[]): Task[] => {
  const result: Task[] = [];

  const traverse = (taskList: Task[]) => {
    for (const task of taskList) {
      result.push(task);
      if (task.subtasks && task.subtasks.length > 0) {
        traverse(task.subtasks);
      }
    }
  };

  traverse(tasks);
  return result;
};

// ===== SVAR Gantt 변환 함수 =====

/**
 * Task 배열을 SVAR Gantt 형식으로 변환
 *
 * 용도: 간트차트 렌더링 시 서버 데이터를 화면에 표시
 *
 * SVAR 공식 스펙:
 * - id: 숫자 (필수) - 문자열 task_id를 숫자로 매핑
 * - text: 문자열 (필수) - 작업명
 * - start: Date (필수) - 시작일
 * - duration: 숫자 (필수) - 기간(일)
 * - parent: 숫자 (선택) - 부모 작업 ID
 * - progress: 0-100 (선택) - 진행률
 * - type: "task" | "summary" (선택) - 하위 작업 있으면 "summary"
 *
 * @param tasks - 서버의 계층 구조 Task 배열
 * @returns SVAR Gantt가 렌더링할 수 있는 평탄화된 배열
 */
export const taskToGantt = (tasks: Task[]): SvarTask[] => {
  const result: SvarTask[] = [];

  // Task ID를 숫자로 변환 (간단한 카운터 사용)
  let idCounter = 1;
  const idMap = new Map<string, number>();

  // 1단계: 모든 task에 숫자 ID 할당
  const assignIds = (taskList: Task[]) => {
    for (const task of taskList) {
      idMap.set(task.task_id, idCounter++);
      if (task.subtasks && task.subtasks.length > 0) {
        assignIds(task.subtasks);
      }
    }
  };
  assignIds(tasks);

  // 2단계: SVAR 형식으로 변환
  const traverse = (taskList: Task[], parentId?: number) => {
    for (const task of taskList) {
      const numId = idMap.get(task.task_id)!;
      const hasSubtasks = task.subtasks && task.subtasks.length > 0;

      const startDate = new Date(task.start_date);
      const endDate = new Date(task.end_date);

      // SVAR 공식 문서: 필수 속성 (id, text, start, duration)
      const svarTask: SvarTask = {
        id: numId,
        text: task.name,
        start: startDate,
        end: endDate,
        duration: task.duration_days,
      };

      // 선택 속성: 부모가 있을 때만 parent 추가
      if (parentId !== undefined) {
        svarTask.parent = parentId;
      }

      // 선택 속성: type (subtask가 있으면 summary)
      if (hasSubtasks) {
        svarTask.type = 'summary';
      }

      // 선택 속성: progress
      if (task.progress > 0) {
        svarTask.progress = task.progress;
      }

      // 커스텀 속성: assignee (담당자)
      if (task.assignee) {
        (svarTask as any).assignee = task.assignee;
      }

      result.push(svarTask);

      // 하위 작업 처리
      if (hasSubtasks) {
        traverse(task.subtasks, numId);
      }
    }
  };

  traverse(tasks);
  return result;
};

/**
 * SVAR Gantt 형식을 Task 배열로 역변환
 *
 * 용도: 사용자가 간트차트에서 수정한 내용을 서버에 저장
 *
 * 동작 방식:
 * 1. 원본 Task 구조를 유지하면서
 * 2. SVAR에서 변경된 값들만 업데이트
 * 3. 계층 구조 그대로 반환
 *
 * @param svarTasks - SVAR Gantt의 현재 상태 (api.getState().tasks.serialize())
 * @param originalTasks - 원본 계층 구조 참조용 (ID 매핑 및 구조 유지)
 * @returns 변경사항이 반영된 계층 구조 Task 배열
 */
export const ganttToTask = (svarTasks: SvarTask[], originalTasks: Task[]): Task[] => {
  // SVAR Task ID → 원본 Task ID 매핑 복원
  const idMap = new Map<number, string>();
  let idCounter = 1;

  const buildIdMap = (taskList: Task[]) => {
    for (const task of taskList) {
      idMap.set(idCounter++, task.task_id);
      if (task.subtasks && task.subtasks.length > 0) {
        buildIdMap(task.subtasks);
      }
    }
  };
  buildIdMap(originalTasks);

  // SVAR Task를 Map에 저장
  const svarTaskMap = new Map<number, SvarTask>();
  svarTasks.forEach((task) => {
    if (task.id !== undefined) {
      svarTaskMap.set(Number(task.id), task);
    }
  });

  // 원본 Task 업데이트
  const updateTask = (task: Task, counter: { value: number }): Task => {
    const numId = counter.value++;
    const svarTask = svarTaskMap.get(numId);

    const updatedTask: Task = svarTask
      ? {
          ...task,
          name: svarTask.text || task.name,
          start_date: svarTask.start ? svarTask.start.toISOString().split('T')[0] : task.start_date,
          duration_days: svarTask.duration || task.duration_days,
          progress: svarTask.progress !== undefined ? svarTask.progress : task.progress,
          assignee: svarTask.details || task.assignee,
        }
      : task;

    // end_date 재계산 (duration - 1을 더함)
    if (svarTask?.start && svarTask?.duration) {
      const endDate = new Date(svarTask.start);
      // duration - 1을 더함 (duration=1이면 0일 추가, 즉 시작일과 같음)
      endDate.setDate(endDate.getDate() + (svarTask.duration - 1));
      updatedTask.end_date = endDate.toISOString().split('T')[0];
    }

    // subtasks 재귀 업데이트
    if (task.subtasks && task.subtasks.length > 0) {
      return {
        ...updatedTask,
        subtasks: task.subtasks.map((st) => updateTask(st, counter)),
      };
    }

    return updatedTask;
  };

  const counter = { value: 1 };
  return originalTasks.map((task) => updateTask(task, counter));
};

// ===== API ↔ SVAR 직접 변환 함수 =====

/**
 * API 응답 → SVAR Gantt 형식
 *
 * 백엔드가 이미 SVAR 형식과 거의 일치하게 데이터를 보내주므로
 * 최소한의 변환만 수행합니다.
 *
 * @param apiTask - API에서 받은 TaskFlatDto (객체 분해 할당)
 * @returns SVAR Gantt가 렌더링할 수 있는 ITask
 */
export const apiTaskToSvar = ({
  id,
  name,
  start,
  end,
  duration,
  progress,
  parent,
  status,
  assignee,
}: TaskFlatDto): SvarTask => {
  const startDate = new Date(start);
  let endDate = new Date(end);

  // SVAR Gantt는 start와 end가 정확히 같으면 바를 표시하지 않음
  // duration=1 (하루짜리 작업)일 때 시각적으로 표시하기 위해
  // end를 같은 날의 23:59:59로 설정
  if (start === end || duration === 1) {
    endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);
  }

  const svarTask: SvarTask = {
    id,
    text: name, // name → text
    start: startDate, // string → Date
    end: endDate, // string → Date (같은 날이면 23:59:59로 조정)
    duration,
    progress,
  };

  // parent가 있으면 추가
  if (parent !== null) {
    svarTask.parent = parent;
  }

  // 커스텀 속성 저장
  (svarTask as any).status = status;
  (svarTask as any).assignee = assignee;

  return svarTask;
};

/**
 * SVAR Gantt → API 수정 요청 형식
 *
 * SVAR에서 변경된 작업을 API UpdateTaskDto 형식으로 변환
 *
 * @param svarTask - SVAR Gantt의 ITask (객체 분해 할당)
 * @returns API 수정 요청에 사용할 데이터
 */
export const svarToApiUpdate = ({ text, start, end, progress, ...rest }: SvarTask) => {
  return {
    name: text,
    startDate: start ? start.toISOString().split('T')[0] : undefined,
    endDate: end ? end.toISOString().split('T')[0] : undefined,
    progress,
    status: (rest as any).status,
    // assigneeId는 별도 처리 필요 (assignee 문자열 → ID 매핑)
  };
};

/**
 * API 상태 → 한글 상태 매핑
 */
export const mapApiStatusToKorean = (apiStatus: string): string => {
  const mapping: Record<string, string> = {
    TODO: '할일',
    IN_PROGRESS: '진행중',
    DONE: '완료',
  };
  return mapping[apiStatus] || '할일';
};

/**
 * 한글 상태 → API 상태 매핑
 */
export const mapKoreanToApiStatus = (koreanStatus: string): string => {
  const mapping: Record<string, string> = {
    할일: 'TODO',
    진행중: 'IN_PROGRESS',
    완료: 'DONE',
  };
  return mapping[koreanStatus] || 'TODO';
};

// ===== 하위 호환성을 위한 별칭 (Deprecated) =====

/**
 * @deprecated taskToGantt 사용 권장
 * 하위 호환성을 위해 유지
 */
export const convertToSvarTasksNew = taskToGantt;

/**
 * @deprecated ganttToTask 사용 권장
 * 하위 호환성을 위해 유지
 */
export const convertSvarTasksToHierarchicalNew = ganttToTask;
