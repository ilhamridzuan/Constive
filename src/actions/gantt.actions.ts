'use server';

import { createClient } from '@/lib/supabase/server';
import { createTaskSchema, updateTaskGanttSchema, batchReorderTasksSchema } from '@/lib/validations/gantt.schema';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { supabaseRealtimeWrapper } from '@/lib/wrappers/realtime/supabase-realtime.wrapper';

export async function getProjectTasksAction(workspaceId: string, projectId: string) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  // Due to RLS, if they have access to the workspace and project, they can read the tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });

  if (tasksError) {
    throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
  }

  const { data: dependencies, error: depsError } = await supabase
    .from('task_dependencies')
    .select('*')
    .eq('workspace_id', workspaceId);

  // Filter dependencies to only those for this project's tasks (we can also do a join in Supabase, but this is simpler)
  const taskIds = new Set(tasks.map((t: any) => t.id));
  const projectDependencies = dependencies?.filter((d: any) => taskIds.has(d.task_id) && taskIds.has(d.depends_on_task_id)) || [];

  return { tasks, dependencies: projectDependencies };
}

export async function createTaskAction(input: z.infer<typeof createTaskSchema>) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const validatedData = createTaskSchema.parse(input);

  // 1. Validate if user has PM/Admin/Owner role (Write access). 
  // RLS will also handle tenant isolation, but we enforce role via a check
  const { data: member, error: memberError } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', validatedData.workspaceId)
    .eq('user_id', user.id)
    .single();

  if (memberError || !member || member.role === 'SUPERVISOR') {
    throw new Error('Forbidden: You do not have permission to create tasks');
  }

  // 2. Compute order_index and wbs_code
  // For simplicity, we assign order_index = max(order_index) + 1 for siblings
  let level = 0;
  let newOrderIndex = 0;
  
  if (validatedData.parentId) {
    const { data: parentTask } = await supabase
      .from('tasks')
      .select('level, wbs_code')
      .eq('id', validatedData.parentId)
      .single();
    
    if (parentTask) {
      level = parentTask.level + 1;
    }
  }

  const { data: siblings } = await supabase
    .from('tasks')
    .select('order_index')
    .eq('project_id', validatedData.projectId)
    .eq('parent_id', validatedData.parentId || null)
    .order('order_index', { ascending: false })
    .limit(1);

  if (siblings && siblings.length > 0) {
    newOrderIndex = siblings[0].order_index + 1;
  }

  // Duration computation
  const startDate = new Date(validatedData.startDate);
  const endDate = new Date(validatedData.endDate);
  const durationDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  const taskData = {
    project_id: validatedData.projectId,
    workspace_id: validatedData.workspaceId,
    name: validatedData.name,
    description: validatedData.description,
    status: validatedData.status,
    start_date: validatedData.startDate,
    end_date: validatedData.endDate,
    duration_days: durationDays,
    parent_id: validatedData.parentId || null,
    order_index: newOrderIndex,
    level,
    progress_percent: validatedData.progressPercent,
    created_by: user.id
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`);
  }

  // Broadcast event
  await supabaseRealtimeWrapper.broadcastEvent({
    channel: `project-${validatedData.projectId}`,
    event: 'TASK_CREATED',
    payload: data,
  });

  revalidatePath(`/workspaces/${validatedData.workspaceId}/projects/${validatedData.projectId}/gantt`);
  return data;
}

export async function updateTaskGanttAction(input: z.infer<typeof updateTaskGanttSchema>) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const validatedData = updateTaskGanttSchema.parse(input);

  const { data: member, error: memberError } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', validatedData.workspaceId)
    .eq('user_id', user.id)
    .single();

  if (memberError || !member || member.role === 'SUPERVISOR') {
    throw new Error('Forbidden: You do not have permission to update tasks');
  }

  const updateData: any = {};
  
  if (validatedData.name) updateData.name = validatedData.name;
  if (validatedData.description !== undefined) updateData.description = validatedData.description;
  if (validatedData.status) updateData.status = validatedData.status;
  if (validatedData.startDate) updateData.start_date = validatedData.startDate;
  if (validatedData.endDate) updateData.end_date = validatedData.endDate;
  if (validatedData.progressPercent !== undefined) updateData.progress_percent = validatedData.progressPercent;
  if (validatedData.parentId !== undefined) updateData.parent_id = validatedData.parentId;
  
  // Recompute duration if dates changed
  if (validatedData.startDate && validatedData.endDate) {
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);
    updateData.duration_days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', validatedData.id)
    .eq('workspace_id', validatedData.workspaceId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update task: ${error.message}`);
  }

  // Broadcast event
  await supabaseRealtimeWrapper.broadcastEvent({
    channel: `project-${validatedData.projectId}`,
    event: 'TASK_UPDATED',
    payload: data,
  });

  revalidatePath(`/workspaces/${validatedData.workspaceId}/projects/${validatedData.projectId}/gantt`);
  return data;
}

export async function batchReorderTasksAction(input: z.infer<typeof batchReorderTasksSchema>) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const validatedData = batchReorderTasksSchema.parse(input);

  const { data: member, error: memberError } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', validatedData.workspaceId)
    .eq('user_id', user.id)
    .single();

  if (memberError || !member || member.role === 'SUPERVISOR') {
    throw new Error('Forbidden: You do not have permission to reorder tasks');
  }

  // Supabase doesn't have a bulk update RPC by default, we can do sequential updates for now
  // or use `upsert` if we retrieve all required fields, but sequential is safer for just a few tasks being moved.
  
  const promises = validatedData.tasks.map((t: any) => 
    supabase
      .from('tasks')
      .update({ 
        order_index: t.orderIndex, 
        parent_id: t.parentId, 
        level: t.level, 
        wbs_code: t.wbsCode 
      })
      .eq('id', t.id)
      .eq('workspace_id', validatedData.workspaceId)
  );

  const results = await Promise.all(promises);
  
  const errors = results.filter((r: any) => r.error);
  if (errors.length > 0) {
    throw new Error(`Failed to reorder some tasks: ${errors[0].error?.message}`);
  }

  // Broadcast event
  await supabaseRealtimeWrapper.broadcastEvent({
    channel: `project-${validatedData.projectId}`,
    event: 'TASKS_REORDERED',
    payload: { tasks: validatedData.tasks },
  });

  revalidatePath(`/workspaces/${validatedData.workspaceId}/projects/${validatedData.projectId}/gantt`);
  return { success: true };
}

export async function deleteTaskAction(workspaceId: string, projectId: string, taskId: string) {
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
    throw new Error('Forbidden: You do not have permission to delete tasks');
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('workspace_id', workspaceId);

  if (error) {
    throw new Error(`Failed to delete task: ${error.message}`);
  }

  // Broadcast event
  await supabaseRealtimeWrapper.broadcastEvent({
    channel: `project-${projectId}`,
    event: 'TASK_DELETED',
    payload: { id: taskId },
  });

  revalidatePath(`/workspaces/${workspaceId}/projects/${projectId}/gantt`);
  return { success: true };
}
