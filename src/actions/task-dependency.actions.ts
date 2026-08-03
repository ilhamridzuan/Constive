'use server';

import { createClient } from '@/lib/supabase/server';
import { taskDependencySchema } from '@/lib/validations/gantt.schema';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { supabaseRealtimeWrapper } from '@/lib/wrappers/realtime/supabase-realtime.wrapper';

export async function addDependencyAction(input: z.infer<typeof taskDependencySchema>) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const validatedData = taskDependencySchema.parse(input);

  const { data: member, error: memberError } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', validatedData.workspaceId)
    .eq('user_id', user.id)
    .single();

  if (memberError || !member || member.role === 'SUPERVISOR') {
    throw new Error('Forbidden: You do not have permission to add dependencies');
  }

  const { data, error } = await supabase
    .from('task_dependencies')
    .insert({
      task_id: validatedData.taskId,
      depends_on_task_id: validatedData.dependsOnTaskId,
      dependency_type: validatedData.dependencyType,
      workspace_id: validatedData.workspaceId
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add task dependency: ${error.message}`);
  }

  // Broadcast event
  await supabaseRealtimeWrapper.broadcastEvent({
    channel: `project-${validatedData.projectId}`,
    event: 'DEPENDENCY_ADDED',
    payload: data,
  });

  revalidatePath(`/workspaces/${validatedData.workspaceId}/projects/${validatedData.projectId}/gantt`);
  return data;
}

export async function removeDependencyAction(
  workspaceId: string,
  projectId: string,
  taskId: string,
  dependsOnTaskId: string
) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: member, error: memberError } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  if (memberError || !member || member.role === 'SUPERVISOR') {
    throw new Error('Forbidden: You do not have permission to remove dependencies');
  }

  const { error } = await supabase
    .from('task_dependencies')
    .delete()
    .eq('task_id', taskId)
    .eq('depends_on_task_id', dependsOnTaskId)
    .eq('workspace_id', workspaceId);

  if (error) {
    throw new Error(`Failed to remove task dependency: ${error.message}`);
  }

  // Broadcast event
  await supabaseRealtimeWrapper.broadcastEvent({
    channel: `project-${projectId}`,
    event: 'DEPENDENCY_REMOVED',
    payload: { taskId, dependsOnTaskId },
  });

  revalidatePath(`/workspaces/${workspaceId}/projects/${projectId}/gantt`);
  return { success: true };
}
