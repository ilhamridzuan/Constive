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

  // Dialog State
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Filter Tasks by Search Query & Status
  const filteredTasks = useMemo(() => {
    return rawTasks.filter((task) => {
      const matchesSearch =
        !searchQuery ||
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rawTasks, searchQuery, statusFilter]);

  // Handlers
  const handleAddTask = () => {
    setSelectedTask(null);
    setEditorOpen(true);
  };

  const handleTaskDoubleClick = (task: TaskItem) => {
    setSelectedTask(task);
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
        onAddTask={handleAddTask}
        onRefresh={() => refetch()}
        isFullScreen={isFullScreen}
        onToggleFullScreen={toggleFullScreen}
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
        />
      )}

      {/* Presence Avatars & Realtime Presence Bar */}
      <PresenceAvatars />

      {/* Task Editor Dialog / Sheet */}
      <TaskEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        task={selectedTask}
        allTasks={rawTasks}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
