'use client';

import { TaskItem } from '@/types/domain/task';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { useSyncExternalStore } from 'react';

interface GanttWrapperProps {
  tasks: TaskItem[];
  viewMode: ViewMode;
  onDateChange: (task: TaskItem, start: Date, end: Date) => void;
  onProgressChange: (task: TaskItem, progress: number) => void;
  onTaskDoubleClick: (task: TaskItem) => void;
}

const emptySubscribe = () => () => {};

export function GanttWrapper({
  tasks,
  viewMode,
  onDateChange,
  onProgressChange,
  onTaskDoubleClick,
}: GanttWrapperProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8 bg-card border border-border rounded-lg animate-pulse text-muted-foreground text-xs">
        Memuat Gantt Chart Canvas...
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="min-h-[350px] flex flex-col items-center justify-center p-8 bg-card border border-border rounded-lg text-center">
        <Calendar className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <h3 className="text-sm font-bold text-foreground">Tidak Ada Tugas Ditemukan</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Belum ada tugas WBS yang memenuhi kriteria pencarian atau filter status.
        </p>
      </div>
    );
  }

  // Convert Domain TaskItem to gantt-task-react Task
  const ganttTasks: GanttTask[] = tasks.map((task) => {
    // Colors matching design.md design tokens
    let bgColor = '#94A3B8'; // Slate 400 (TODO)
    let progressColor = '#64748B'; // Slate 500

    if (task.status === 'COMPLETED' || task.progressPercent === 100) {
      bgColor = '#22C55E'; // Green 500
      progressColor = '#166534'; // Green 800
    } else if (task.status === 'IN_PROGRESS' || task.progressPercent > 0) {
      bgColor = '#D97706'; // Construction Amber 600
      progressColor = '#92400E'; // Amber 800
    }

    const hasChildren = tasks.some((t) => t.parentId === task.id);
    const startDate = new Date(task.startDate + 'T00:00:00');
    const endDate = new Date(task.endDate + 'T23:59:59');

    return {
      id: task.id,
      name: task.name,
      type: hasChildren ? 'project' : 'task',
      start: isNaN(startDate.getTime()) ? new Date() : startDate,
      end: isNaN(endDate.getTime()) ? new Date() : endDate,
      progress: Math.min(100, Math.max(0, task.progressPercent || 0)),
      dependencies: task.predecessorId ? [task.predecessorId] : [],
      project: task.parentId || undefined,
      styles: {
        backgroundColor: bgColor,
        backgroundSelectedColor: bgColor,
        progressColor: progressColor,
        progressSelectedColor: progressColor,
      },
    };
  });

  const handleDateChange = (ganttTask: GanttTask) => {
    const original = tasks.find((t) => t.id === ganttTask.id);
    if (original) {
      onDateChange(original, ganttTask.start, ganttTask.end);
    }
  };

  const handleProgressChange = (ganttTask: GanttTask) => {
    const original = tasks.find((t) => t.id === ganttTask.id);
    if (original) {
      onProgressChange(original, ganttTask.progress);
    }
  };

  const handleDoubleClick = (ganttTask: GanttTask) => {
    const original = tasks.find((t) => t.id === ganttTask.id);
    if (original) {
      onTaskDoubleClick(original);
    }
  };

  // Custom Tooltip Component
  const CustomTooltip: React.FC<{ task: GanttTask }> = ({ task: gTask }) => {
    const original = tasks.find((t) => t.id === gTask.id);
    return (
      <div className="bg-popover text-popover-foreground border border-border p-3 rounded-lg shadow-md text-xs space-y-1 max-w-xs">
        <p className="font-bold text-sm text-foreground">{gTask.name}</p>
        {original?.description && (
          <p className="text-muted-foreground text-[11px] line-clamp-2">
            {original.description}
          </p>
        )}
        <div className="pt-1.5 flex items-center justify-between text-[11px] border-t border-border">
          <span className="flex items-center gap-1 font-medium text-muted-foreground">
            <Clock className="h-3 w-3" /> Durasi:
          </span>
          <span className="font-semibold text-foreground">
            {gTask.start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} -{' '}
            {gTask.end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 font-medium text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-primary" /> Progres:
          </span>
          <span className="font-bold text-primary">{gTask.progress}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card p-2 shadow-2xs gantt-custom-theme">
      <Gantt
        tasks={ganttTasks}
        viewMode={viewMode}
        onDateChange={handleDateChange}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDoubleClick}
        TooltipContent={CustomTooltip}
        listCellWidth="200px"
        columnWidth={viewMode === ViewMode.Month ? 180 : viewMode === ViewMode.Week ? 120 : 60}
        barCornerRadius={4}
        rowHeight={40}
        fontSize="12px"
        locale="id-ID"
      />
    </div>
  );
}
