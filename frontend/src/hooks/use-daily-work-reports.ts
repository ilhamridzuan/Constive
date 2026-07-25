import { dailyWorkReportService } from '@/services/daily-work-report.service';
import { queryKeys } from '@/services/query-keys';
import {
  CreateDailyWorkReportInput,
  DailyWorkReportFilter,
} from '@/types/domain/daily-work-report';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useDailyWorkReports(
  workspaceId: string,
  projectId: string,
  filter?: DailyWorkReportFilter
) {
  return useQuery({
    queryKey: [...queryKeys.dailyWorkReports.list(workspaceId, projectId), filter],
    queryFn: () => dailyWorkReportService.getDailyWorkReports(projectId, filter),
    enabled: !!workspaceId && !!projectId,
  });
}

export function useDailyWorkReportDetail(
  workspaceId: string,
  projectId: string,
  reportId: string | null
) {
  return useQuery({
    queryKey: reportId
      ? queryKeys.dailyWorkReports.detail(workspaceId, projectId, reportId)
      : [],
    queryFn: () => dailyWorkReportService.getDailyWorkReportById(projectId, reportId!),
    enabled: !!workspaceId && !!projectId && !!reportId,
  });
}

export function useCreateDailyWorkReport(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDailyWorkReportInput) =>
      dailyWorkReportService.createDailyWorkReport(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dailyWorkReports.list(workspaceId, projectId),
      });
    },
  });
}

export function useVerifyDailyWorkReport(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) =>
      dailyWorkReportService.verifyDailyWorkReport(projectId, reportId),
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dailyWorkReports.list(workspaceId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dailyWorkReports.detail(workspaceId, projectId, reportId),
      });
    },
  });
}

export function useRequestRevisionDailyWorkReport(
  workspaceId: string,
  projectId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      revisionNotes,
    }: {
      reportId: string;
      revisionNotes: string;
    }) =>
      dailyWorkReportService.requestRevision(projectId, reportId, revisionNotes),
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dailyWorkReports.list(workspaceId, projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dailyWorkReports.detail(workspaceId, projectId, reportId),
      });
    },
  });
}
