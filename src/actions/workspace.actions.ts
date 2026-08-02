'use server';

import { createClient } from '@/lib/supabase/server';
import { createWorkspaceSchema, inviteMemberSchema, updateMemberRoleSchema, acceptInviteSchema } from '@/lib/validations/workspace.schema';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function createWorkspace(input: { name: string; slug?: string }) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error('Unauthorized');
  }

  const validatedData = createWorkspaceSchema.parse(input);
  
  // Create slug if not provided
  let slug = validatedData.slug;
  if (!slug) {
    slug = validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString();
    slug = `${slug}-${randomSuffix}`;
  }

  // 1. Insert into workspaces
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({
      name: validatedData.name,
      slug,
      owner_id: userData.user.id,
      subscription_plan: 'FREE',
    })
    .select()
    .single();

  if (workspaceError) {
    throw new Error(`Failed to create workspace: ${workspaceError.message}`);
  }

  // 2. Insert into workspace_members as OWNER
  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: workspace.id,
      user_id: userData.user.id,
      role: 'OWNER',
    });

  if (memberError) {
    throw new Error(`Failed to add owner to workspace: ${memberError.message}`);
  }

  revalidatePath('/workspace');
  return workspace;
}

export async function inviteMember(input: { email: string; role: 'ADMIN' | 'PROJECT_MANAGER' | 'SUPERVISOR'; workspaceId: string }) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error('Unauthorized');
  }

  const validatedData = inviteMemberSchema.parse(input);

  // Check if current user is OWNER or ADMIN
  const { data: membership, error: membershipError } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', validatedData.workspaceId)
    .eq('user_id', userData.user.id)
    .single();

  if (membershipError || !['OWNER', 'ADMIN'].includes(membership?.role)) {
    throw new Error('Forbidden: Only OWNER or ADMIN can invite members');
  }

  // Quota validation: if FREE plan, max 10 members (hybrid seats logic)
  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('subscription_plan, max_free_seats')
    .eq('id', validatedData.workspaceId)
    .single();

  if (wsError) throw new Error('Workspace not found');

  if (workspace.subscription_plan === 'FREE') {
    const { count, error: countError } = await supabase
      .from('workspace_members')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', validatedData.workspaceId);

    if (countError) throw new Error('Failed to check member count');
    
    // Only PAID seats (ADMIN, PROJECT_MANAGER) are counted against the limit for hybrid,
    // but PRD says FREE plan has 10 users max overall, and paid seats logic applies later.
    // Let's implement what's written: "Jika kuota paket Free (10 users) atau kuota Paid Seats telah tercapai, sistem akan memblokir penambahan anggota baru dengan peran PM/Admin"
    if (['ADMIN', 'PROJECT_MANAGER'].includes(validatedData.role)) {
      if (count && count >= workspace.max_free_seats) {
        throw new Error('Kuota pengguna paket Free telah tercapai. Silakan lakukan upgrade ke paket Standard.');
      }
    }
  }

  // Check if user is already a member
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', validatedData.email)
    .single();

  if (existingUser) {
    const { data: existingMember } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', validatedData.workspaceId)
      .eq('user_id', existingUser.id)
      .single();

    if (existingMember) {
      throw new Error('User is already a member of this workspace');
    }
  }

  // Generate token and expiration (7 days)
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data: invitation, error: inviteError } = await supabase
    .from('workspace_invitations')
    .insert({
      workspace_id: validatedData.workspaceId,
      invited_by: userData.user.id,
      invitee_email: validatedData.email,
      assigned_role: validatedData.role,
      token,
      expires_at: expiresAt.toISOString(),
      status: 'PENDING',
    })
    .select()
    .single();

  if (inviteError) {
    throw new Error(`Failed to create invitation: ${inviteError.message}`);
  }

  revalidatePath(`/workspace/${validatedData.workspaceId}/settings/members`);
  return invitation;
}

export async function acceptInvite(input: { token: string }) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error('Unauthorized');
  }

  const validatedData = acceptInviteSchema.parse(input);

  // 1. Validate token
  const { data: invitation, error: inviteError } = await supabase
    .from('workspace_invitations')
    .select('*')
    .eq('token', validatedData.token)
    .eq('status', 'PENDING')
    .single();

  if (inviteError || !invitation) {
    throw new Error('Tautan undangan sudah tidak berlaku');
  }

  if (new Date(invitation.expires_at) < new Date()) {
    await supabase.from('workspace_invitations').update({ status: 'EXPIRED' }).eq('id', invitation.id);
    throw new Error('Tautan undangan sudah tidak berlaku');
  }

  if (invitation.invitee_email.toLowerCase() !== userData.user.email?.toLowerCase()) {
    throw new Error('Tautan undangan ini bukan untuk email Anda');
  }

  // 2. Insert into workspace_members
  // We use the Admin Client here to bypass RLS because the user is not yet a member,
  // but they have proven authorization by providing a valid token and matching email.
  const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: memberError } = await supabaseAdmin
    .from('workspace_members')
    .insert({
      workspace_id: invitation.workspace_id,
      user_id: userData.user.id,
      role: invitation.assigned_role,
    });

  if (memberError) {
    throw new Error(`Failed to join workspace: ${memberError.message}`);
  }

  // 3. Update invite status to ACCEPTED
  await supabaseAdmin
    .from('workspace_invitations')
    .update({ status: 'ACCEPTED' })
    .eq('id', invitation.id);

  revalidatePath(`/workspace/${invitation.workspace_id}`);
  return { workspaceId: invitation.workspace_id };
}

export async function updateMemberRole(input: { workspaceId: string; userId: string; role: 'OWNER' | 'ADMIN' | 'PROJECT_MANAGER' | 'SUPERVISOR' }) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error('Unauthorized');
  }

  const validatedData = updateMemberRoleSchema.parse(input);

  // Only OWNER or ADMIN can update roles
  const { data: membership, error: membershipError } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', validatedData.workspaceId)
    .eq('user_id', userData.user.id)
    .single();

  if (membershipError || !['OWNER', 'ADMIN'].includes(membership?.role)) {
    throw new Error('Forbidden: Only OWNER or ADMIN can update roles');
  }

  // Prevent changing the OWNER's role
  const { data: targetMembership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', validatedData.workspaceId)
    .eq('user_id', validatedData.userId)
    .single();
    
  if (targetMembership?.role === 'OWNER') {
    throw new Error('Cannot change the role of the workspace OWNER');
  }

  const { error: updateError } = await supabase
    .from('workspace_members')
    .update({ role: validatedData.role })
    .eq('workspace_id', validatedData.workspaceId)
    .eq('user_id', validatedData.userId);

  if (updateError) {
    throw new Error(`Failed to update role: ${updateError.message}`);
  }

  revalidatePath(`/workspace/${validatedData.workspaceId}/settings/members`);
  return { success: true };
}

export async function removeMember(input: { workspaceId: string; userId: string }) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error('Unauthorized');
  }

  // Only OWNER or ADMIN can remove
  const { data: membership, error: membershipError } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', input.workspaceId)
    .eq('user_id', userData.user.id)
    .single();

  if (membershipError || !['OWNER', 'ADMIN'].includes(membership?.role)) {
    throw new Error('Forbidden: Only OWNER or ADMIN can remove members');
  }
  
  // Prevent removing OWNER
  const { data: targetMembership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', input.workspaceId)
    .eq('user_id', input.userId)
    .single();
    
  if (targetMembership?.role === 'OWNER') {
    throw new Error('Cannot remove the workspace OWNER');
  }

  const { error: deleteError } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', input.workspaceId)
    .eq('user_id', input.userId);

  if (deleteError) {
    throw new Error(`Failed to remove member: ${deleteError.message}`);
  }

  revalidatePath(`/workspace/${input.workspaceId}/settings/members`);
  return { success: true };
}
