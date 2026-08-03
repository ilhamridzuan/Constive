'use server';

import { createClient } from '@/lib/supabase/server';
import { createProjectSchema, updateProjectSchema } from '@/lib/validations/project.schema';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export async function createProjectAction(input: z.infer<typeof createProjectSchema>) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const validatedData = createProjectSchema.parse(input);

  const { data: member, error: memberError } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', validatedData.workspaceId)
    .eq('user_id', user.id)
    .single();

  if (memberError || !member || (member.role !== 'OWNER' && member.role !== 'ADMIN' && member.role !== 'PROJECT_MANAGER')) {
    throw new Error('Forbidden: You do not have permission to create projects in this workspace');
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      workspace_id: validatedData.workspaceId,
      name: validatedData.name,
      location: validatedData.location,
      description: validatedData.description,
      status: validatedData.status,
      start_date: validatedData.startDate,
      end_date: validatedData.endDate,
      created_by: user.id
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  revalidatePath(`/workspaces/${validatedData.workspaceId}/projects`);
  return data;
}

export async function updateProjectAction(input: z.infer<typeof updateProjectSchema>) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const validatedData = updateProjectSchema.parse(input);

  const { data: member, error: memberError } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', validatedData.workspaceId)
    .eq('user_id', user.id)
    .single();

  if (memberError || !member || (member.role !== 'OWNER' && member.role !== 'ADMIN' && member.role !== 'PROJECT_MANAGER')) {
    throw new Error('Forbidden: You do not have permission to update projects');
  }

  const updateData: any = {};
  if (validatedData.name) updateData.name = validatedData.name;
  if (validatedData.location !== undefined) updateData.location = validatedData.location;
  if (validatedData.description !== undefined) updateData.description = validatedData.description;
  if (validatedData.status) updateData.status = validatedData.status;
  if (validatedData.startDate !== undefined) updateData.start_date = validatedData.startDate;
  if (validatedData.endDate !== undefined) updateData.end_date = validatedData.endDate;

  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', validatedData.id)
    .eq('workspace_id', validatedData.workspaceId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`);
  }

  revalidatePath(`/workspaces/${validatedData.workspaceId}/projects`);
  revalidatePath(`/workspaces/${validatedData.workspaceId}/projects/${validatedData.id}`);
  return data;
}

export async function deleteProjectAction(workspaceId: string, projectId: string) {
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

  if (memberError || !member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
    throw new Error('Forbidden: Only OWNER or ADMIN can delete projects');
  }

  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('workspace_id', workspaceId);

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }

  revalidatePath(`/workspaces/${workspaceId}/projects`);
  return { success: true };
}

export async function getProjectsAction(workspaceId: string) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return data;
}

export async function getProjectByIdAction(workspaceId: string, projectId: string) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('id', projectId)
    .is('deleted_at', null)
    .single();

  if (error) {
    throw new Error(`Failed to fetch project: ${error.message}`);
  }

  return data;
}
