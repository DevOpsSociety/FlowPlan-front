'use client';

import { useState } from 'react';
import { ChevronRight, Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import type { Task } from '@/shared/lib/apiTypes';

interface HierarchicalWBSTableProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskAdd: (parentId?: string, taskData?: Partial<Task>) => void;
  onTaskSelect?: (taskId: string) => void;
}

interface TaskRowProps {
  task: Task;
  depth: number;
  expandedTasks: Set<string>;
  onToggleExpand: (taskId: string) => void;
  editingTask: string | null;
  editValues: Partial<Task>;
  onEdit: (task: Task) => void;
  onSave: () => void;
  onCancel: () => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskAdd: (parentId?: string, taskData?: Partial<Task>) => void;
  onTaskSelect?: (taskId: string) => void;
  setEditValues: (values: Partial<Task>) => void;
  creatingTask: string | null;
  newTaskValues: Partial<Task>;
  onCreateTask: (parentId?: string) => void;
  onSaveNewTask: (parentId?: string) => void;
  onCancelNewTask: () => void;
  setNewTaskValues: (values: Partial<Task>) => void;
}

function TaskRow({
  task,
  depth,
  expandedTasks,
  onToggleExpand,
  editingTask,
  editValues,
  onEdit,
  onSave,
  onCancel,
  onTaskUpdate,
  onTaskDelete,
  onTaskAdd,
  onTaskSelect,
  setEditValues,
  creatingTask,
  newTaskValues,
  onCreateTask,
  onSaveNewTask,
  onCancelNewTask,
  setNewTaskValues,
}: TaskRowProps) {
  const hasSubTasks = task.subtasks && task.subtasks.length > 0;
  const isExpanded = expandedTasks.has(task.task_id);
  const paddingLeft = `${depth * 24 + 8}px`;

  const getStatusBadge = (status: Task['status']) => {
    const variants = {
      할일: 'secondary',
      진행중: 'default',
      완료: 'success',
      보류: 'destructive',
    } as const;

    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  const formatDuration = (days: number) => {
    return `${days}일`;
  };

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => onTaskSelect?.(task.task_id)}
      >
        <TableCell>
          {editingTask === task.task_id ? (
            <div style={{ paddingLeft }}>
              <Input
                value={editValues.name || ''}
                onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                className="h-8"
              />
            </div>
          ) : (
            <div className="flex items-center" style={{ paddingLeft }}>
              {hasSubTasks && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand(task.task_id);
                  }}
                >
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </Button>
              )}
              {!hasSubTasks && <div className="w-8" />}
              <span className="font-medium">{task.name}</span>
            </div>
          )}
        </TableCell>
        <TableCell>
          {editingTask === task.task_id ? (
            <Input
              value={editValues.assignee || ''}
              onChange={(e) => setEditValues({ ...editValues, assignee: e.target.value })}
              className="h-8"
            />
          ) : (
            task.assignee
          )}
        </TableCell>
        <TableCell>
          {editingTask === task.task_id ? (
            <Input
              type="date"
              value={editValues.start_date || ''}
              onChange={(e) => setEditValues({ ...editValues, start_date: e.target.value })}
              className="h-8"
            />
          ) : (
            task.start_date
          )}
        </TableCell>
        <TableCell>
          {editingTask === task.task_id ? (
            <Input
              type="date"
              value={editValues.end_date || ''}
              onChange={(e) => setEditValues({ ...editValues, end_date: e.target.value })}
              className="h-8"
            />
          ) : (
            task.end_date
          )}
        </TableCell>
        <TableCell>{formatDuration(task.duration_days)}</TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <div className="w-12 bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">{task.progress}%</span>
          </div>
        </TableCell>
        <TableCell>
          {editingTask === task.task_id ? (
            <Select
              value={editValues.status || task.status}
              onValueChange={(value) =>
                setEditValues({ ...editValues, status: value as Task['status'] })
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="할일">할 일</SelectItem>
                <SelectItem value="진행중">진행 중</SelectItem>
                <SelectItem value="완료">완료</SelectItem>
                <SelectItem value="보류">차단됨</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            getStatusBadge(task.status)
          )}
        </TableCell>
        <TableCell>
          {editingTask === task.task_id ? (
            <div className="flex space-x-1">
              <Button size="sm" variant="outline" onClick={onSave}>
                <Save className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancel}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex space-x-1">
              <Button size="sm" variant="ghost" onClick={() => onEdit(task)}>
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateTask(task.task_id);
                }}
                disabled={task.parent_id !== null}
                title={
                  task.parent_id !== null ? '최대 2단계까지만 작업 추가 가능' : '하위 작업 추가'
                }
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onTaskDelete(task.task_id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </TableCell>
      </TableRow>

      {creatingTask === task.task_id && (
        <TableRow className="bg-muted/30">
          <TableCell>
            <div style={{ paddingLeft: `${(depth + 1) * 24 + 8}px` }}>
              <Input
                value={newTaskValues.name || ''}
                onChange={(e) => setNewTaskValues({ ...newTaskValues, name: e.target.value })}
                placeholder="새 하위 작업명을 입력하세요"
                className="h-8"
                autoFocus
              />
            </div>
          </TableCell>
          <TableCell>
            <Input
              value={newTaskValues.assignee || ''}
              onChange={(e) => setNewTaskValues({ ...newTaskValues, assignee: e.target.value })}
              placeholder="담당자"
              className="h-8"
            />
          </TableCell>
          <TableCell>
            <Input
              type="date"
              value={newTaskValues.start_date || ''}
              onChange={(e) => setNewTaskValues({ ...newTaskValues, start_date: e.target.value })}
              className="h-8"
            />
          </TableCell>
          <TableCell>
            <Input
              type="date"
              value={newTaskValues.end_date || ''}
              onChange={(e) => setNewTaskValues({ ...newTaskValues, end_date: e.target.value })}
              className="h-8"
            />
          </TableCell>
          <TableCell>
            <Input
              type="number"
              value={newTaskValues.duration_days || ''}
              onChange={(e) =>
                setNewTaskValues({
                  ...newTaskValues,
                  duration_days: Number.parseInt(e.target.value) || 0,
                })
              }
              placeholder="일"
              className="h-8"
            />
          </TableCell>
          <TableCell>0%</TableCell>
          <TableCell>
            <Select
              value={newTaskValues.status || 'todo'}
              onValueChange={(value) =>
                setNewTaskValues({
                  ...newTaskValues,
                  status: value as Task['status'],
                })
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="할일">할 일</SelectItem>
                <SelectItem value="진행중">진행 중</SelectItem>
                <SelectItem value="완료">완료</SelectItem>
                <SelectItem value="보류">차단됨</SelectItem>
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell>
            <div className="flex space-x-1">
              <Button size="sm" variant="outline" onClick={() => onSaveNewTask(task.task_id)}>
                <Save className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancelNewTask}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )}

      {hasSubTasks &&
        isExpanded &&
        task.subtasks.map((subTask: Task) => (
          <TaskRow
            key={subTask.task_id}
            task={subTask}
            depth={depth + 1}
            expandedTasks={expandedTasks}
            onToggleExpand={onToggleExpand}
            editingTask={editingTask}
            editValues={editValues}
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
            onTaskAdd={onTaskAdd}
            onTaskSelect={onTaskSelect}
            setEditValues={setEditValues}
            creatingTask={creatingTask}
            newTaskValues={newTaskValues}
            onCreateTask={onCreateTask}
            onSaveNewTask={onSaveNewTask}
            onCancelNewTask={onCancelNewTask}
            setNewTaskValues={setNewTaskValues}
          />
        ))}

      {creatingTask === `${task.task_id}-after` && (
        <TableRow className="bg-muted/30">
          <TableCell>
            <div style={{ paddingLeft: `${(depth + 1) * 24 + 8}px` }}>
              <Input
                value={newTaskValues.name || ''}
                onChange={(e) => setNewTaskValues({ ...newTaskValues, name: e.target.value })}
                placeholder="새 하위 작업명을 입력하세요"
                className="h-8"
                autoFocus
              />
            </div>
          </TableCell>
          <TableCell>
            <Input
              value={newTaskValues.assignee || ''}
              onChange={(e) => setNewTaskValues({ ...newTaskValues, assignee: e.target.value })}
              placeholder="담당자"
              className="h-8"
            />
          </TableCell>
          <TableCell>
            <Input
              type="date"
              value={newTaskValues.start_date || ''}
              onChange={(e) => setNewTaskValues({ ...newTaskValues, start_date: e.target.value })}
              className="h-8"
            />
          </TableCell>
          <TableCell>
            <Input
              type="date"
              value={newTaskValues.end_date || ''}
              onChange={(e) => setNewTaskValues({ ...newTaskValues, end_date: e.target.value })}
              className="h-8"
            />
          </TableCell>
          <TableCell>
            <Input
              type="number"
              value={newTaskValues.duration_days || ''}
              onChange={(e) =>
                setNewTaskValues({
                  ...newTaskValues,
                  duration_days: Number.parseInt(e.target.value) || 0,
                })
              }
              placeholder="일"
              className="h-8"
            />
          </TableCell>
          <TableCell>0%</TableCell>
          <TableCell>
            <Select
              value={newTaskValues.status || 'todo'}
              onValueChange={(value) =>
                setNewTaskValues({
                  ...newTaskValues,
                  status: value as Task['status'],
                })
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="할일">할 일</SelectItem>
                <SelectItem value="진행중">진행 중</SelectItem>
                <SelectItem value="완료">완료</SelectItem>
                <SelectItem value="보류">차단됨</SelectItem>
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell>
            <div className="flex space-x-1">
              <Button size="sm" variant="outline" onClick={() => onSaveNewTask(task.task_id)}>
                <Save className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancelNewTask}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function HierarchicalWBSTable({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onTaskAdd,
  onTaskSelect,
}: HierarchicalWBSTableProps) {
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Task>>({});
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const [creatingTask, setCreatingTask] = useState<string | null>(null);
  const [newTaskValues, setNewTaskValues] = useState<Partial<Task>>({
    name: '',
    assignee: '',
    start_date: '',
    end_date: '',
    duration_days: 1,
    progress: 0,
    status: '할일',
  });

  const handleToggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task.task_id);
    setEditValues(task);
  };

  const handleSave = () => {
    if (editingTask && editValues) {
      onTaskUpdate(editingTask, editValues);
      setEditingTask(null);
      setEditValues({});
    }
  };

  const handleCancel = () => {
    setEditingTask(null);
    setEditValues({});
  };

  const handleCreateTask = (parentId?: string) => {
    setCreatingTask(parentId || 'root');
    setNewTaskValues({
      name: '',
      assignee: '',
      start_date: '',
      end_date: '',
      duration_days: 1,
      progress: 0,
      status: '할일',
    });
  };

  const handleSaveNewTask = (parentId?: string) => {
    if (newTaskValues.name) {
      onTaskAdd(parentId === 'root' ? undefined : parentId, newTaskValues);
      setCreatingTask(null);
      setNewTaskValues({
        name: '',
        assignee: '',
        start_date: '',
        end_date: '',
        duration_days: 1,
        progress: 0,
        status: '할일',
      });
    }
  };

  const handleCancelNewTask = () => {
    setCreatingTask(null);
    setNewTaskValues({
      name: '',
      assignee: '',
      start_date: '',
      end_date: '',
      duration_days: 1,
      progress: 0,
      status: '할일',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">작업 분해 구조 (WBS)</h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedTasks(new Set(tasks.map((t) => t.id)))}
          >
            모두 펼치기
          </Button>
          <Button variant="outline" size="sm" onClick={() => setExpandedTasks(new Set())}>
            모두 접기
          </Button>
          <Button onClick={() => handleCreateTask()} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            작업 추가
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">작업명</TableHead>
              <TableHead className="w-[120px]">담당자</TableHead>
              <TableHead className="w-[120px]">시작일</TableHead>
              <TableHead className="w-[120px]">종료일</TableHead>
              <TableHead className="w-[80px]">기간</TableHead>
              <TableHead className="w-[80px]">진행률</TableHead>
              <TableHead className="w-[100px]">상태</TableHead>
              <TableHead className="w-[100px]">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creatingTask === 'root' && (
              <TableRow className="bg-muted/30">
                <TableCell>
                  <div style={{ paddingLeft: '8px' }}>
                    <Input
                      value={newTaskValues.name || ''}
                      onChange={(e) => setNewTaskValues({ ...newTaskValues, name: e.target.value })}
                      placeholder="새 작업명을 입력하세요"
                      className="h-8"
                      autoFocus
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    value={newTaskValues.assignee || ''}
                    onChange={(e) =>
                      setNewTaskValues({ ...newTaskValues, assignee: e.target.value })
                    }
                    placeholder="담당자"
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    value={newTaskValues.start_date || ''}
                    onChange={(e) =>
                      setNewTaskValues({ ...newTaskValues, start_date: e.target.value })
                    }
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    value={newTaskValues.end_date || ''}
                    onChange={(e) =>
                      setNewTaskValues({ ...newTaskValues, end_date: e.target.value })
                    }
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newTaskValues.duration_days || ''}
                    onChange={(e) =>
                      setNewTaskValues({
                        ...newTaskValues,
                        duration_days: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="일"
                    className="h-8"
                  />
                </TableCell>
                <TableCell>0%</TableCell>
                <TableCell>
                  <Select
                    value={newTaskValues.status || 'todo'}
                    onValueChange={(value) =>
                      setNewTaskValues({
                        ...newTaskValues,
                        status: value as Task['status'],
                      })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="할일">할 일</SelectItem>
                      <SelectItem value="진행중">진행 중</SelectItem>
                      <SelectItem value="완료">완료</SelectItem>
                      <SelectItem value="보류">차단됨</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" onClick={() => handleSaveNewTask('root')}>
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelNewTask}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {tasks.map((task) => (
              <TaskRow
                key={task.task_id}
                task={task}
                depth={0}
                expandedTasks={expandedTasks}
                onToggleExpand={handleToggleExpand}
                editingTask={editingTask}
                editValues={editValues}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onTaskUpdate={onTaskUpdate}
                onTaskDelete={onTaskDelete}
                onTaskAdd={onTaskAdd}
                onTaskSelect={onTaskSelect}
                setEditValues={setEditValues}
                creatingTask={creatingTask}
                newTaskValues={newTaskValues}
                onCreateTask={handleCreateTask}
                onSaveNewTask={handleSaveNewTask}
                onCancelNewTask={handleCancelNewTask}
                setNewTaskValues={setNewTaskValues}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
