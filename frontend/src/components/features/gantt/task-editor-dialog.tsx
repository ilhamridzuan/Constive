'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateTaskDto, TaskItem, TaskStatus, UpdateTaskGanttDto } from '@/types/domain/task';
import { AlertCircle, Calendar, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

interface TaskEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskItem | null; // Null when creating new task
  initialParentId?: string | null;
  allTasks: TaskItem[];
  onSave: (dto: UpdateTaskGanttDto | CreateTaskDto, taskId?: string) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
}

function TaskEditorForm({
  task,
  initialParentId,
  allTasks,
  onSave,
  onDelete,
  onClose,
}: {
  task?: TaskItem | null;
  initialParentId?: string | null;
  allTasks: TaskItem[];
  onSave: (dto: UpdateTaskGanttDto | CreateTaskDto, taskId?: string) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
  onClose: () => void;
}) {
  const isEditing = Boolean(task);

  const [name, setName] = useState(task?.name || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'TODO');
  const [startDate, setStartDate] = useState(
    () => task?.startDate || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    () =>
      task?.endDate ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [progressPercent, setProgressPercent] = useState(task?.progressPercent || 0);
  const [parentId, setParentId] = useState(task?.parentId || initialParentId || '');
  const [predecessorId, setPredecessorId] = useState(task?.predecessorId || '');

  const [errors, setErrors] = useState<{
    endDate?: string;
    circular?: string;
    name?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  // Helper to prevent selecting self or descendants as parent
  const getDescendantIds = (taskId: string): Set<string> => {
    const descendants = new Set<string>();
    const addChildren = (id: string) => {
      allTasks.filter((t) => t.parentId === id).forEach((child) => {
        descendants.add(child.id);
        addChildren(child.id);
      });
    };
    addChildren(taskId);
    return descendants;
  };

  const currentDescendants = task ? getDescendantIds(task.id) : new Set<string>();
  const availableParentTasks = allTasks.filter(
    (t) => (task ? t.id !== task.id && !currentDescendants.has(t.id) : true)
  );
  const availablePredecessorTasks = allTasks.filter((t) => (task ? t.id !== task.id : true));

  // Reactive Level and WBS Code calculation based on parentId state
  const parentTask = allTasks.find((t) => t.id === parentId);

  const calculatedLevel = useMemo(() => {
    if (!parentTask) return 0;
    return (parentTask.level ?? 0) + 1;
  }, [parentTask]);

  const calculatedWbsCode = useMemo(() => {
    // If editing and parentId hasn't changed, keep original wbsCode
    if (task && task.parentId === (parentId || null) && task.wbsCode) {
      return task.wbsCode;
    }

    if (!parentId) {
      // Root task
      const rootTasks = allTasks.filter(
        (t) => (!t.parentId || !allTasks.some((p) => p.id === t.parentId)) && (task ? t.id !== task.id : true)
      );
      return `${rootTasks.length + 1}.0`;
    }

    // Child task under parentTask
    const parentWbs = parentTask?.wbsCode || '1.0';
    const existingSiblings = allTasks.filter(
      (t) => t.parentId === parentId && (task ? t.id !== task.id : true)
    );
    const nextIndex = existingSiblings.length + 1;

    if (parentTask?.level === 0) {
      const parentMajor = parentWbs.split('.')[0];
      return `${parentMajor}.${nextIndex}`;
    } else {
      return `${parentWbs}.${nextIndex}`;
    }
  }, [task, parentId, parentTask, allTasks]);

  // Check circular dependency helper
  const isCircularDependency = (targetPredecessorId: string): boolean => {
    if (!task || !targetPredecessorId) return false;
    if (targetPredecessorId === task.id) return true;

    const visited = new Set<string>([task.id]);
    let curr: TaskItem | undefined = allTasks.find((t) => t.id === targetPredecessorId);

    while (curr) {
      if (visited.has(curr.id)) return true;
      visited.add(curr.id);
      if (!curr.predecessorId) break;
      curr = allTasks.find((t) => t.id === curr?.predecessorId);
    }

    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { endDate?: string; circular?: string; name?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Nama tugas wajib diisi.';
    }

    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.';
    }

    if (predecessorId && isCircularDependency(predecessorId)) {
      newErrors.circular = 'Dependensi melingkar (circular dependency) terdeteksi. Pilih tugas lain.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && task) {
        await onSave(
          {
            name: name.trim(),
            description: description.trim(),
            status,
            startDate,
            endDate,
            progressPercent,
            parentId: parentId || null,
            predecessorId: predecessorId || null,
            level: calculatedLevel,
            wbsCode: calculatedWbsCode,
          },
          task.id
        );
      } else {
        await onSave({
          name: name.trim(),
          description: description.trim(),
          status,
          startDate,
          endDate,
          progressPercent,
          parentId: parentId || null,
          predecessorId: predecessorId || null,
          level: calculatedLevel,
          wbsCode: calculatedWbsCode,
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !onDelete) return;
    if (confirm(`Apakah Anda yakin ingin menghapus tugas "${task.name}"?`)) {
      setSubmitting(true);
      try {
        await onDelete(task.id);
        onClose();
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs py-2">
      {/* Auto-calculated WBS Code & Level (Read-Only) */}
      <div className="grid grid-cols-2 gap-3 p-2.5 rounded-lg bg-muted/40 border border-border/60">
        <div className="space-y-1">
          <Label htmlFor="wbs-code-display" className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
            WBS Code
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-normal">Auto</span>
          </Label>
          <Input
            id="wbs-code-display"
            readOnly
            value={calculatedWbsCode}
            className="text-xs h-8 font-mono bg-background text-foreground font-bold cursor-not-allowed border-border/80"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="level-display" className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
            Kedalaman Level
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-normal">Terkalkulasi</span>
          </Label>
          <Input
            id="level-display"
            readOnly
            value={`Level ${calculatedLevel} ${
              calculatedLevel === 0
                ? '(Root Utama)'
                : calculatedLevel === 1
                ? '(Child Level 1)'
                : '(Sub-child Level 2)'
            }`}
            className="text-xs h-8 bg-background text-foreground font-semibold cursor-not-allowed border-border/80"
          />
        </div>
      </div>

      {/* Task Name */}
      <div className="space-y-1">
        <Label htmlFor="task-name" className="text-xs font-semibold">
          Nama Tugas <span className="text-destructive">*</span>
        </Label>
        <Input
          id="task-name"
          placeholder="Contoh: Pengecoran Slab Lantai 2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-xs h-9"
          maxLength={200}
        />
        {errors.name && <p className="text-[11px] text-destructive">{errors.name}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Label htmlFor="task-desc" className="text-xs font-semibold">
          Deskripsi Pekerjaan
        </Label>
        <textarea
          id="task-desc"
          rows={2}
          placeholder="Catatan detail spesifikasi teknis atau instruksi..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Status & Progress Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="task-status" className="text-xs font-semibold">
            Status Pekerjaan
          </Label>
          <select
            id="task-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full h-9 px-3 text-xs rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="TODO">Belum Dimulai (TODO)</option>
            <option value="IN_PROGRESS">Sedang Dikerjakan</option>
            <option value="COMPLETED">Selesai (100%)</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="task-progress" className="text-xs font-semibold">
            Progres Fisik ({progressPercent}%)
          </Label>
          <input
            id="task-progress"
            type="range"
            min="0"
            max="100"
            step="5"
            value={progressPercent}
            onChange={(e) => setProgressPercent(Number(e.target.value))}
            className="w-full h-9 accent-primary cursor-pointer"
          />
        </div>
      </div>

      {/* Start Date & End Date Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="start-date" className="text-xs font-semibold">
            Tanggal Mulai <span className="text-destructive">*</span>
          </Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs h-9"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="end-date" className="text-xs font-semibold">
            Tanggal Selesai <span className="text-destructive">*</span>
          </Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs h-9"
          />
        </div>
      </div>
      {errors.endDate && (
        <p className="text-[11px] text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {errors.endDate}
        </p>
      )}

      {/* Parent Task & Predecessor Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border">
        <div className="space-y-1">
          <Label htmlFor="parent-task" className="text-xs font-semibold">
            Induk Tugas (Parent WBS)
          </Label>
          <select
            id="parent-task"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full h-9 px-2 text-xs rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary truncate"
          >
            <option value="">Tanpa Induk (Tingkat Atas / Level 0)</option>
            {availableParentTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.wbsCode ? `[${t.wbsCode}] ` : ''}{t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="predecessor-task" className="text-xs font-semibold">
            Prasyarat (Predecessor)
          </Label>
          <select
            id="predecessor-task"
            value={predecessorId}
            onChange={(e) => setPredecessorId(e.target.value)}
            className="w-full h-9 px-2 text-xs rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary truncate"
          >
            <option value="">Tanpa Prasyarat</option>
            {availablePredecessorTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.wbsCode ? `[${t.wbsCode}] ` : ''}{t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {errors.circular && (
        <p className="text-[11px] text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {errors.circular}
        </p>
      )}

      <DialogFooter className="flex items-center justify-between pt-4 border-t border-border sm:justify-between">
        {isEditing && onDelete ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={handleDelete}
            disabled={submitting}
          >
            <Trash2 className="h-3.5 w-3.5" /> Hapus
          </Button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={onClose}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            size="sm"
            className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary-hover font-semibold"
            disabled={submitting}
          >
            {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}

export function TaskEditorDialog({
  open,
  onOpenChange,
  task,
  initialParentId,
  allTasks,
  onSave,
  onDelete,
}: TaskEditorDialogProps) {
  const isEditing = Boolean(task);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {isEditing ? `Edit Tugas: ${task?.name}` : 'Tambah Tugas WBS Baru'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? 'Perbarui detail durasi, progress, dan dependensi tugas WBS.'
              : 'Tambahkan elemen Pekerjaan WBS ke dalam lini masa Gantt Chart.'}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <TaskEditorForm
            key={task?.id || initialParentId || 'new-task'}
            task={task}
            initialParentId={initialParentId}
            allTasks={allTasks}
            onSave={onSave}
            onDelete={onDelete}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
