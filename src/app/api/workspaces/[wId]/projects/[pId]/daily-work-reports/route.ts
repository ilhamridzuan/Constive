import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseStorageWrapper } from '@/lib/wrappers/storage/supabase-storage.wrapper';
import { createDailyReportSchema } from '@/lib/validations/daily-report.schema';

export async function POST(
  req: NextRequest,
  { params }: { params: { wId: string; pId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { wId, pId } = params;

    // Check if user has access to workspace
    const { data: member, error: memberError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', wId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    
    const logDate = formData.get('logDate') as string;
    const weather = formData.get('weather') as string;
    const laborCount = parseInt(formData.get('laborCount') as string, 10);
    const notes = formData.get('notes') as string;

    const validation = createDailyReportSchema.safeParse({
      logDate,
      weather,
      laborCount,
      notes,
    });

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const files = formData.getAll('media') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'At least 1 photo is required' }, { status: 400 });
    }
    
    if (files.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 photos allowed' }, { status: 400 });
    }

    // Begin upload and insertion
    // 1. Insert report first
    const { data: report, error: reportError } = await supabase
      .from('daily_work_reports')
      .insert({
        workspace_id: wId,
        project_id: pId,
        supervisor_id: user.id,
        log_date: validation.data.logDate,
        weather: validation.data.weather,
        labor_count: validation.data.laborCount,
        notes: validation.data.notes,
      })
      .select()
      .single();

    if (reportError || !report) {
      return NextResponse.json({ error: reportError?.message || 'Failed to create report' }, { status: 500 });
    }

    // 2. Upload files and collect media objects
    const mediaInserts = [];
    
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name}`;
      const path = `reports/${pId}/${report.id}/${fileName}`;
      
      const uploadResult = await supabaseStorageWrapper.uploadFile({
        bucket: 'project-media',
        path,
        fileBuffer: buffer,
        contentType: file.type,
      });

      mediaInserts.push({
        daily_work_report_id: report.id,
        workspace_id: wId,
        file_url: uploadResult.publicUrl,
        file_name: file.name,
        file_size_bytes: uploadResult.sizeBytes,
        mime_type: uploadResult.mimeType || file.type,
      });
    }

    // 3. Insert media records
    const { error: mediaError } = await supabase
      .from('daily_work_report_media')
      .insert(mediaInserts);

    if (mediaError) {
      return NextResponse.json({ error: mediaError.message }, { status: 500 });
    }

    return NextResponse.json({ data: report }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
