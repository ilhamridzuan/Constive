'use client';

import { GanttToolbar } from '@/components/features/gantt/gantt-toolbar';
import { GanttWrapper } from '@/components/features/gantt/gantt-wrapper';
import { PresenceAvatars } from '@/components/features/gantt/presence-avatars';
import { TaskEditorDialog } from '@/components/features/gantt/task-editor-dialog';
import {
  useCreateGanttTask,
  useDeleteGanttTask,
  useGanttTasks,
  useUpdateGanttTaskOptimistic,
} from '@/hooks/use-optimistic-gantt';
import { CreateTaskDto, TaskItem, TaskStatus, UpdateTaskGanttDto } from '@/types/domain/task';
import { ViewMode } from 'gantt-task-react';
import { use, useMemo, useState } from 'react';

export default function ProjectGanttPage({
  params,
}: {
  params: Promise<{ workspaceId: string; projectId: string }>;
}) {
  const { workspaceId, projectId } = use(params);

  // Data Query & Mutations
  const { data: rawTasks = [], isLoading, refetch } = useGanttTasks(workspaceId, projectId);
  const updateTaskMutation = useUpdateGanttTaskOptimistic(workspaceId, projectId);
  const createTaskMutation = useCreateGanttTask(workspaceId, projectId);
  const deleteTaskMutation = useDeleteGanttTask(workspaceId, projectId);

  // Page Controls State
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Collapsed Hierarchy State
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // Dialog State
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [initialParentId, setInitialParentId] = useState<string | null>(null);

  // Find all parent tasks in rawTasks
  const parentTaskIds = useMemo(() => {
    const ids = new Set<string>();
    rawTasks.forEach((t) => {
      if (rawTasks.some((child) => child.parentId === t.id)) {
        ids.add(t.id);
      }
    });
    return ids;
  }, [rawTasks]);

  const isAllExpanded = collapsedIds.size === 0;

  const handleToggleExpandAll = () => {
    if (isAllExpanded) {
      setCollapsedIds(new Set(parentTaskIds));
    } else {
      setCollapsedIds(new Set());
    }
  };

  const handleToggleTaskCollapse = (taskId: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  // Filter Tasks by Search Query & Status
  const filteredTasks = useMemo(() => {
    return rawTasks.filter((task) => {
      const matchesSearch =
        !searchQuery ||
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.wbsCode?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rawTasks, searchQuery, statusFilter]);

  // Handlers for Task Creation & Editing
  const handleAddTaskUnder = (parentTask: TaskItem) => {
    setSelectedTask(null);
    setInitialParentId(parentTask.id);
    // Ensure parent is expanded so user sees the new child immediately
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      next.delete(parentTask.id);
      return next;
    });
    setEditorOpen(true);
  };

  const handleAddTaskRoot = () => {
    setSelectedTask(null);
    setInitialParentId(null);
    setEditorOpen(true);
  };

  const handleTaskDoubleClick = (task: TaskItem) => {
    setSelectedTask(task);
    setInitialParentId(null);
    setEditorOpen(true);
  };

  const handleDateChange = (task: TaskItem, start: Date, end: Date) => {
    const formattedStart = start.toISOString().split('T')[0];
    const formattedEnd = end.toISOString().split('T')[0];

    updateTaskMutation.mutate({
      taskId: task.id,
      dto: {
        startDate: formattedStart,
        endDate: formattedEnd,
      },
    });
  };

  const handleProgressChange = (task: TaskItem, progressPercent: number) => {
    const status: TaskStatus =
      progressPercent === 100 ? 'COMPLETED' : progressPercent > 0 ? 'IN_PROGRESS' : 'TODO';

    updateTaskMutation.mutate({
      taskId: task.id,
      dto: {
        progressPercent: Math.round(progressPercent),
        status,
      },
    });
  };

  const handleSaveTask = async (
    dto: UpdateTaskGanttDto | CreateTaskDto,
    taskId?: string
  ): Promise<void> => {
    if (taskId) {
      await updateTaskMutation.mutateAsync({
        taskId,
        dto: dto as UpdateTaskGanttDto,
      });
    } else {
      await createTaskMutation.mutateAsync(dto as CreateTaskDto);
    }
  };

  const handleDeleteTask = async (taskId: string): Promise<void> => {
    await deleteTaskMutation.mutateAsync(taskId);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div
      className={`space-y-4 ${
        isFullScreen
          ? 'fixed inset-0 z-50 bg-background p-6 overflow-y-auto'
          : 'relative'
      }`}
    >
      {/* Interactive Toolbar */}
      <GanttToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onRefresh={() => refetch()}
        isFullScreen={isFullScreen}
        onToggleFullScreen={toggleFullScreen}
        isAllExpanded={isAllExpanded}
        onToggleExpandAll={handleToggleExpandAll}
      />

      {/* Main Gantt Canvas Wrapper */}
      {isLoading ? (
        <div className="min-h-[400px] flex items-center justify-center p-8 bg-card border border-border rounded-lg animate-pulse text-muted-foreground text-xs">
          Memuat data tugas WBS proyek...
        </div>
      ) : (
        <GanttWrapper
          tasks={filteredTasks}
          viewMode={viewMode}
          onDateChange={handleDateChange}
          onProgressChange={handleProgressChange}
          onTaskDoubleClick={handleTaskDoubleClick}
          collapsedIds={collapsedIds}
          onToggleTaskCollapse={handleToggleTaskCollapse}
          onAddTaskUnder={handleAddTaskUnder}
          onAddTaskRoot={handleAddTaskRoot}
        />
      )}

      {/* Presence Avatars & Realtime Presence Bar */}
      <PresenceAvatars />

      {/* Task Editor Dialog / Sheet */}
      <TaskEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        task={selectedTask}
        initialParentId={initialParentId}
        allTasks={rawTasks}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
