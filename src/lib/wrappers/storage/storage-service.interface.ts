export interface UploadFileOptions {
  bucket: string;
  path: string;
  fileBuffer: Buffer;
  contentType: string;
  maxSizeBytes?: number;
}

export interface UploadFileResult {
  fileKey: string;
  publicUrl: string;
  sizeBytes: number;
  mimeType: string;
}

export interface IStorageService {
  uploadFile(options: UploadFileOptions): Promise<UploadFileResult>;
  deleteFile(bucket: string, path: string): Promise<void>;
  getSignedUrl(bucket: string, path: string, expiresInSeconds: number): Promise<string>;
}
