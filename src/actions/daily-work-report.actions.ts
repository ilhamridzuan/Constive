'use server';

import { createClient } from '@/lib/supabase/server';
import { createCommentSchema, updateCommentSchema } from '@/lib/validations/daily-report.schema';

export async function createComment(
  dailyWorkReportId: string,
  workspaceId: string,
  data: { content: string; parentCommentId?: string }
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error('Unauthorized');

  const validation = createCommentSchema.safeParse(data);
  if (!validation.success) throw new Error(validation.error.issues[0].message);

  const { data: comment, error } = await supabase
    .from('daily_work_report_comments')
    .insert({
      daily_work_report_id: dailyWorkReportId,
      workspace_id: workspaceId,
      user_id: user.id,
      content: validation.data.content,
      parent_comment_id: validation.data.parentCommentId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return comment;
}

export async function editComment(commentId: string, data: { content: string }) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error('Unauthorized');

  const validation = updateCommentSchema.safeParse(data);
  if (!validation.success) throw new Error(validation.error.issues[0].message);

  const { data: comment, error } = await supabase
    .from('daily_work_report_comments')
    .update({ content: validation.data.content, updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return comment;
}

export async function deleteComment(commentId: string, workspaceId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error('Unauthorized');

  // Verify ownership or Admin/Owner role
  const { data: comment } = await supabase
    .from('daily_work_report_comments')
    .select('user_id')
    .eq('id', commentId)
    .single();

  if (!comment) throw new Error('Comment not found');

  if (comment.user_id !== user.id) {
    // Check if admin
    const { data: member } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();
      
    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      throw new Error('Forbidden');
    }
  }

  const { error } = await supabase
    .from('daily_work_report_comments')
    .delete()
    .eq('id', commentId);

  if (error) throw new Error(error.message);
  return { success: true };
}
