import { createClient } from '@/lib/supabase/client';
import {
  CreateCommentInput,
  CreateDailyWorkReportInput,
  DailyWorkReport,
  DailyWorkReportComment,
  DailyWorkReportFilter,
  UpdateCommentInput,
} from '@/types/domain/daily-work-report';
import { createComment, deleteComment, editComment } from '@/actions/daily-work-report.actions';

export const dailyWorkReportService = {
  // GET /daily-work-reports
  async getDailyWorkReports(
    projectId: string,
    filter?: DailyWorkReportFilter
  ): Promise<DailyWorkReport[]> {
    const supabase = createClient();
    
    let query = supabase
      .from('daily_work_reports')
      .select('*, media:daily_work_report_media(*), supervisor:users!supervisor_id(full_name, avatar_url)')
      .eq('project_id', projectId)
      .order('log_date', { ascending: false });

    if (filter) {
      if (filter.weather && filter.weather !== 'ALL') {
        query = query.eq('weather', filter.weather);
      }
      if (filter.startDate) {
        query = query.gte('log_date', filter.startDate);
      }
      if (filter.endDate) {
        query = query.lte('log_date', filter.endDate);
      }
      if (filter.searchQuery) {
        query = query.ilike('notes', `%${filter.searchQuery}%`);
      }
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return data.map((d: any) => ({
      id: d.id,
      projectId: d.project_id,
      supervisorId: d.supervisor_id,
      supervisorName: d.supervisor?.full_name || 'Unknown',
      supervisorAvatar: d.supervisor?.avatar_url,
      logDate: d.log_date,
      weather: d.weather,
      laborCount: d.labor_count,
      notes: d.notes,
      media: d.media?.map((m: any) => ({
        id: m.id,
        dailyWorkReportId: m.daily_work_report_id,
        fileUrl: m.file_url,
        fileName: m.file_name,
        fileSize: m.file_size_bytes,
        createdAt: m.created_at,
      })) || [],
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  },

  // GET /daily-work-reports/:id
  async getDailyWorkReportById(
    projectId: string,
    reportId: string
  ): Promise<DailyWorkReport> {
    const supabase = createClient();
    
    const { data: d, error } = await supabase
      .from('daily_work_reports')
      .select('*, media:daily_work_report_media(*), supervisor:users!supervisor_id(full_name, avatar_url)')
      .eq('id', reportId)
      .eq('project_id', projectId)
      .single();

    if (error || !d) throw new Error(error?.message || 'Report not found');

    return {
      id: d.id,
      projectId: d.project_id,
      supervisorId: d.supervisor_id,
      supervisorName: d.supervisor?.full_name || 'Unknown',
      supervisorAvatar: d.supervisor?.avatar_url,
      logDate: d.log_date,
      weather: d.weather,
      laborCount: d.labor_count,
      notes: d.notes,
      media: d.media?.map((m: any) => ({
        id: m.id,
        dailyWorkReportId: m.daily_work_report_id,
        fileUrl: m.file_url,
        fileName: m.file_name,
        fileSize: m.file_size_bytes,
        createdAt: m.created_at,
      })) || [],
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    };
  },

  // POST via API Route
  async createDailyWorkReport(
    workspaceId: string,
    projectId: string,
    input: CreateDailyWorkReportInput
  ): Promise<DailyWorkReport> {
    const formData = new FormData();
    formData.append('logDate', input.logDate);
    formData.append('weather', input.weather);
    formData.append('laborCount', input.laborCount.toString());
    formData.append('notes', input.notes);
    
    input.mediaFiles.forEach((file) => {
      formData.append('media', file);
    });

    const response = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}/daily-work-reports`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit report');
    }

    return result.data;
  },

  // --- Comments API Methods ---

  async getComments(projectId: string, reportId: string): Promise<DailyWorkReportComment[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('daily_work_report_comments')
      .select('*, user:users!user_id(full_name, avatar_url)')
      .eq('daily_work_report_id', reportId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    return data.map((c: any) => ({
      id: c.id,
      dailyWorkReportId: c.daily_work_report_id,
      workspaceId: c.workspace_id,
      userId: c.user_id,
      userName: c.user?.full_name || 'Unknown',
      userAvatar: c.user?.avatar_url,
      parentCommentId: c.parent_comment_id,
      content: c.content,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
  },

  async createComment(
    workspaceId: string,
    reportId: string,
    input: CreateCommentInput
  ): Promise<DailyWorkReportComment> {
    const c = await createComment(reportId, workspaceId, input);
    // When creating a comment, the service could fetch the full profile or we can trust local state. 
    // In React Query, usually it will refetch getComments automatically anyway.
    return {
      id: c.id,
      dailyWorkReportId: c.daily_work_report_id,
      workspaceId: c.workspace_id,
      userId: c.user_id,
      userName: 'Anda',
      userAvatar: '',
      parentCommentId: c.parent_comment_id,
      content: c.content,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    };
  },

  async updateComment(
    commentId: string,
    input: UpdateCommentInput
  ): Promise<DailyWorkReportComment> {
    const c = await editComment(commentId, input);
    return {
      id: c.id,
      dailyWorkReportId: c.daily_work_report_id,
      workspaceId: c.workspace_id,
      userId: c.user_id,
      userName: 'Anda',
      userAvatar: '',
      parentCommentId: c.parent_comment_id,
      content: c.content,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    };
  },

  async deleteComment(
    workspaceId: string,
    commentId: string
  ): Promise<void> {
    await deleteComment(commentId, workspaceId);
  },
};
