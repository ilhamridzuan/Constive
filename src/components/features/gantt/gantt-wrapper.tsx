'use client';

import { TaskItem } from '@/types/domain/task';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Calendar, CheckCircle2, ChevronDown, ChevronRight, Clock, Plus } from 'lucide-react';
import { useMemo, useSyncExternalStore } from 'react';

interface GanttWrapperProps {
  tasks: TaskItem[];
  viewMode: ViewMode;
  onDateChange: (task: TaskItem, start: Date, end: Date) => void;
  onProgressChange: (task: TaskItem, progress: number) => void;
  onTaskDoubleClick: (task: TaskItem) => void;
  collapsedIds: Set<string>;
  onToggleTaskCollapse: (taskId: string) => void;
  onAddTaskUnder?: (parentTask: TaskItem) => void;
  onAddTaskRoot?: () => void;
}

const emptySubscribe = () => () => {};

// Custom Task List Header defined at top level for a completely stable reference
const TaskListHeaderCustom: React.FC<{
  headerHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
}> = ({ headerHeight, rowWidth }) => {
  return (
    <div
      className="flex items-center border-r border-b border-border bg-muted/60 text-xs font-semibold text-muted-foreground select-none"
      style={{ height: headerHeight, width: rowWidth }}
    >
      <div className="flex-1 px-3 py-1 text-foreground font-semibold border-r border-border/50 truncate">
        Nama Tugas
      </div>
      <div className="w-28 shrink-0 px-2.5 py-1 font-semibold text-muted-foreground uppercase tracking-wider text-[11px] border-r border-border/50 text-center">
        Status
      </div>
      <div className="w-10 shrink-0 flex items-center justify-center font-bold text-muted-foreground text-xs" title="Tambah Tugas Inline">
        <Plus className="h-3.5 w-3.5" />
      </div>
    </div>
  );
};

export function GanttWrapper({
  tasks,
  viewMode,
  onDateChange,
  onProgressChange,
  onTaskDoubleClick,
  collapsedIds,
  onToggleTaskCollapse,
  onAddTaskUnder,
  onAddTaskRoot,
}: GanttWrapperProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Helper map for parent lookup to determine ancestor collapse state
  const parentMap = useMemo(() => {
    const map = new Map<string, string | null>();
    tasks.forEach((t) => map.set(t.id, t.parentId || null));
    return map;
  }, [tasks]);

  const isTaskVisible = (taskId: string): boolean => {
    let currParent = parentMap.get(taskId);
    while (currParent) {
      if (collapsedIds.has(currParent)) {
        return false;
      }
      currParent = parentMap.get(currParent);
    }
    return true;
  };

  // Filter tasks that are visible (all ancestors expanded)
  const visibleTasks = useMemo(() => {
    return tasks.filter((t) => isTaskVisible(t.id));
  }, [tasks, collapsedIds, parentMap]);

  // Convert Domain TaskItem to gantt-task-react Task
  const ganttTasks: GanttTask[] = useMemo(() => {
    return visibleTasks.map((task) => {
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
        hideChildren: collapsedIds.has(task.id),
        styles: {
          backgroundColor: bgColor,
          backgroundSelectedColor: bgColor,
          progressColor: progressColor,
          progressSelectedColor: progressColor,
        },
      };
    });
  }, [visibleTasks, tasks, collapsedIds]);

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

  // Stable Memoized Task List Table Component to prevent infinite re-render loops on wheel/scroll events
  const TaskListTableCustom = useMemo(() => {
    const Component: React.FC<{
      rowHeight: number;
      rowWidth: string;
      fontFamily: string;
      fontSize: string;
      locale: string;
      tasks: GanttTask[];
      selectedTaskId: string;
      setSelectedTask: (taskId: string) => void;
      onExpanderClick: (task: GanttTask) => void;
    }> = ({ rowHeight, rowWidth, tasks: renderedGanttTasks, selectedTaskId, setSelectedTask }) => {
      return (
        <div className="divide-y divide-border/40 border-r border-border bg-card">
          {renderedGanttTasks.map((gTask) => {
            const domainTask = tasks.find((t) => t.id === gTask.id);
            const level = domainTask?.level ?? 0;
            const wbsCode = domainTask?.wbsCode ?? '';
            const status = domainTask?.status ?? 'TODO';
            const hasChildren = tasks.some((t) => t.parentId === gTask.id);
            const isCollapsed = collapsedIds.has(gTask.id);

            return (
              <div
                key={gTask.id}
                className={`flex items-center text-xs transition-colors hover:bg-muted/50 cursor-pointer ${
                  selectedTaskId === gTask.id ? 'bg-primary/10 font-medium' : ''
                }`}
                style={{ height: rowHeight, width: rowWidth }}
                onClick={() => setSelectedTask(gTask.id)}
                onDoubleClick={() => {
                  if (domainTask) onTaskDoubleClick(domainTask);
                }}
              >
                {/* Column 1: Nama Tugas with indentation, chevron toggle, & monospace WBS Code */}
                <div
                  className="flex-1 flex items-center gap-1.5 px-2 truncate border-r border-border/40 min-w-0"
                  style={{ paddingLeft: `${level * 24 + 8}px` }}
                >
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTaskCollapse(gTask.id);
                      }}
                      className="h-5 w-5 shrink-0 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      title={isCollapsed ? 'Tampilkan Sub-tugas' : 'Sembunyikan Sub-tugas'}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                  ) : (
                    <span className="w-5 shrink-0 inline-block" />
                  )}

                  {/* Monospace WBS Code strictly preserved inside the row */}
                  {wbsCode && (
                    <span className="font-mono text-xs text-muted-foreground font-semibold shrink-0">
                      {wbsCode}
                    </span>
                  )}

                  <span className="truncate text-foreground font-medium text-xs">
                    {gTask.name}
                  </span>
                </div>

                {/* Column 2: Status Column */}
                <div className="w-28 shrink-0 px-2 flex items-center justify-center border-r border-border/40">
                  {status === 'COMPLETED' ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                      Selesai
                    </span>
                  ) : status === 'IN_PROGRESS' ? (
                    <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                      Sedang Dikerjakan
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      Belum Dimulai
                    </span>
                  )}
                </div>

                {/* Column 3: (+) Clickable Action Column for Inline Sub-Task Creation */}
                <div className="w-10 shrink-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (domainTask && onAddTaskUnder) {
                        onAddTaskUnder(domainTask);
                      }
                    }}
                    className="h-6 w-6 flex items-center justify-center rounded hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                    title={`Tambah sub-tugas di bawah "${gTask.name}"`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Bottom row: Quick Add Task */}
          {onAddTaskRoot && (
            <div
              onClick={() => onAddTaskRoot()}
              className="flex items-center gap-2 px-3 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 cursor-pointer transition-colors border-t border-border/40 font-medium select-none"
              style={{ height: rowHeight, width: rowWidth }}
              title="Tambah tugas baru"
            >
              <div className="h-5 w-5 flex items-center justify-center rounded bg-primary/10 text-primary">
                <Plus className="h-3.5 w-3.5" />
              </div>
              <span>+ Tambah Tugas</span>
            </div>
          )}
        </div>
      );
    };
    return Component;
  }, [tasks, collapsedIds, onToggleTaskCollapse, onTaskDoubleClick, onAddTaskUnder, onAddTaskRoot]);

  // Stable Memoized Custom Tooltip Component
  const CustomTooltip = useMemo(() => {
    const Component: React.FC<{ task: GanttTask }> = ({ task: gTask }) => {
      const original = tasks.find((t) => t.id === gTask.id);
      return (
        <div className="bg-popover text-popover-foreground border border-border p-3 rounded-lg shadow-md text-xs space-y-1 max-w-xs">
          <div className="flex items-center gap-2">
            {original?.wbsCode && (
              <span className="font-mono text-xs text-muted-foreground font-semibold">
                [{original.wbsCode}]
              </span>
            )}
            <p className="font-bold text-sm text-foreground truncate">{gTask.name}</p>
          </div>
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
    return Component;
  }, [tasks]);

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
        {onAddTaskRoot && (
          <button
            type="button"
            onClick={onAddTaskRoot}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Tugas Pertama
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card p-2 shadow-2xs gantt-custom-theme">
      <Gantt
        tasks={ganttTasks}
        viewMode={viewMode}
        onDateChange={handleDateChange}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDoubleClick}
        onExpanderClick={(gTask) => onToggleTaskCollapse(gTask.id)}
        TaskListHeader={TaskListHeaderCustom}
        TaskListTable={TaskListTableCustom}
        TooltipContent={CustomTooltip}
        listCellWidth="380px"
        columnWidth={viewMode === ViewMode.Month ? 180 : viewMode === ViewMode.Week ? 120 : 60}
        barCornerRadius={4}
        rowHeight={40}
        fontSize="12px"
        locale="id-ID"
      />
    </div>
  );
}
