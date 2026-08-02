import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> | { token: string } }
) {
  try {
    // Gunakan Admin Client untuk melakukan bypass RLS
    // karena user yang belum login butuh melihat nama workspace dari undangan
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // In Next.js 15+, params is a Promise. Let's handle both Promise and object.
    const resolvedParams = await Promise.resolve(params);
    const token = resolvedParams.token;

    const { data: invitation, error } = await supabaseAdmin
      .from('workspace_invitations')
      .select('*, workspaces(name)')
      .eq('token', token)
      .eq('status', 'PENDING')
      .single();

    if (error || !invitation) {
      return NextResponse.json(
        { error: 'Tautan undangan sudah tidak berlaku' },
        { status: 404 }
      );
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Tautan undangan sudah tidak berlaku' },
        { status: 400 }
      );
    }

    return NextResponse.json({ invitation });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
