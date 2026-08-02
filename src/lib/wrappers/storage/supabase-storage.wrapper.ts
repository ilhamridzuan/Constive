import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IStorageService, UploadFileOptions, UploadFileResult } from './storage-service.interface';

// Singleton Supabase Admin Client (Service Role — server-side only)
const supabaseAdmin: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Supabase Storage Wrapper — Pure TypeScript Module (no DI framework)
 * Used by Server Actions & API Routes for file storage operations.
 */
export const supabaseStorageWrapper: IStorageService = {
  async uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
    const { bucket, path, fileBuffer, contentType, maxSizeBytes = 5242880 } = options;

    // 1. Validate File Size (Default Max 5 MB per PRD FT-003)
    if (fileBuffer.byteLength > maxSizeBytes) {
      throw new Error(
        `File size (${(fileBuffer.byteLength / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed limit of ${maxSizeBytes / 1024 / 1024} MB`
      );
    }

    // 2. Validate Image MIME Types (per PRD FT-003: JPG, JPEG, PNG)
    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    if (!allowedMimeTypes.includes(contentType.toLowerCase())) {
      throw new Error(
        `Invalid file type (${contentType}). Only JPG, JPEG, and PNG images are allowed.`
      );
    }

    // 3. Upload File to Supabase Storage Bucket
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload file to storage bucket: ${error.message}`);
    }

    // 4. Extract Public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      fileKey: data.path,
      publicUrl: publicUrlData.publicUrl,
      sizeBytes: fileBuffer.byteLength,
      mimeType: contentType,
    };
  },

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
    if (error) {
      throw new Error(`Failed to delete file from storage: ${error.message}`);
    }
  },

  async getSignedUrl(bucket: string, path: string, expiresInSeconds: number = 3600): Promise<string> {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data) {
      throw new Error(`Failed to generate signed storage URL: ${error?.message}`);
    }

    return data.signedUrl;
  },
};
