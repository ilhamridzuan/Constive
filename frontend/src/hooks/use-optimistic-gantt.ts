import { toast } from '@/components/ui/toast';
import { ganttService } from '@/services/gantt.service';
import { queryKeys } from '@/services/query-keys';
import { CreateTaskDto, TaskItem, UpdateTaskGanttDto } from '@/types/domain/task';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useGanttTasks(workspaceId: string, projectId: string) {
  const cacheKey = queryKeys.gantt.tasks(workspaceId, projectId);
  return useQuery({
    queryKey: cacheKey,
    queryFn: () => ganttService.getTasks(workspaceId, projectId),
    enabled: Boolean(workspaceId && projectId),
  });
}

export function useUpdateGanttTaskOptimistic(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();
  const cacheKey = queryKeys.gantt.tasks(workspaceId, projectId);

  return useMutation({
    mutationFn: ({ taskId, dto }: { taskId: string; dto: UpdateTaskGanttDto }) =>
      ganttService.updateTaskGantt(workspaceId, projectId, taskId, dto),

    onMutate: async ({ taskId, dto }) => {
      await queryClient.cancelQueries({ queryKey: cacheKey });

      const previousTasks = queryClient.getQueryData<TaskItem[]>(cacheKey) || [];

      queryClient.setQueryData<TaskItem[]>(cacheKey, (oldTasks = []) =>
        oldTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                ...dto,
                updatedAt: new Date().toISOString(),
              }
            : task
        )
      );

      return { previousTasks };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData<TaskItem[]>(cacheKey, context.previousTasks);
      }
      toast.add({
        title: 'Gagal Menyinkronkan Gantt Chart',
        description: 'Perubahan gagal disimpan ke server. Tampilan dikembalikan ke kondisi semula.',
        type: 'error',
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cacheKey });
    },
  });
}

export function useCreateGanttTask(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();
  const cacheKey = queryKeys.gantt.tasks(workspaceId, projectId);

  return useMutation({
    mutationFn: (dto: CreateTaskDto) => ganttService.createTask(workspaceId, projectId, dto),
    onSuccess: () => {
      toast.add({
        title: 'Tugas Berhasil Ditambahkan',
        description: 'Tugas WBS baru telah berhasil dibuat dan disimpan.',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: cacheKey });
    },
    onError: () => {
      toast.add({
        title: 'Gagal Membuat Tugas',
        description: 'Terjadi kesalahan saat menambahkan tugas baru.',
        type: 'error',
      });
    },
  });
}

export function useDeleteGanttTask(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();
  const cacheKey = queryKeys.gantt.tasks(workspaceId, projectId);

  return useMutation({
    mutationFn: (taskId: string) => ganttService.deleteTask(workspaceId, projectId, taskId),
    onSuccess: () => {
      toast.add({
        title: 'Tugas Dihapus',
        description: 'Tugas WBS telah berhasil dihapus dari proyek.',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: cacheKey });
    },
    onError: () => {
      toast.add({
        title: 'Gagal Menghapus Tugas',
        description: 'Terjadi kesalahan saat menghapus tugas.',
        type: 'error',
      });
    },
  });
}
