import { dailyLogService } from '@/services/daily-log.service';
import { queryKeys } from '@/services/query-keys';
import { CreateDailyLogInput, DailyLogFilter } from '@/types/domain/daily-log';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useDailyLogs(
  workspaceId: string,
  projectId: string,
  filter?: DailyLogFilter
) {
  return useQuery({
    queryKey: [...queryKeys.dailyLogs.list(workspaceId, projectId), filter],
    queryFn: () => dailyLogService.getDailyLogs(projectId, filter),
    enabled: !!workspaceId && !!projectId,
  });
}

export function useDailyLogDetail(
  workspaceId: string,
  projectId: string,
  logId: string | null
) {
  return useQuery({
    queryKey: logId ? queryKeys.dailyLogs.detail(workspaceId, projectId, logId) : [],
    queryFn: () => dailyLogService.getDailyLogById(projectId, logId!),
    enabled: !!workspaceId && !!projectId && !!logId,
  });
}

export function useCreateDailyLog(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDailyLogInput) =>
      dailyLogService.createDailyLog(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dailyLogs.list(workspaceId, projectId),
      });
    },
  });
}

export function useVerifyDailyLog(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logId: string) => dailyLogService.verifyDailyLog(projectId, logId),
    onSuccess: (_, logId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dailyLogs.list(workspaceId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dailyLogs.detail(workspaceId, projectId, logId),
      });
    },
  });
}

export function useRequestRevisionDailyLog(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ logId, revisionNotes }: { logId: string; revisionNotes: string }) =>
      dailyLogService.requestRevision(projectId, logId, revisionNotes),
    onSuccess: (_, { logId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dailyLogs.list(workspaceId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dailyLogs.detail(workspaceId, projectId, logId),
      });
    },
  });
}
