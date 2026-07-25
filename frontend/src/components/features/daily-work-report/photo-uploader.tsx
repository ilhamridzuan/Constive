'use client';

import { Progress } from '@/components/ui/progress';
import { Camera, ImagePlus, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface PhotoPreviewItem {
  id: string;
  url: string;
  file?: File;
  name: string;
  size?: number;
  uploadProgress: number; // 0 to 100
  error?: string;
}

interface PhotoUploaderProps {
  photos: PhotoPreviewItem[];
  onPhotosChange: (photos: PhotoPreviewItem[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

export function PhotoUploader({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  disabled,
}: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFiles = (files: FileList | File[]) => {
    setErrorMessage(null);
    const fileArray = Array.from(files);

    if (photos.length + fileArray.length > maxPhotos) {
      setErrorMessage(`Maksimal ${maxPhotos} foto per laporan.`);
      return;
    }

    const newItems: PhotoPreviewItem[] = [];

    for (const file of fileArray) {
      // 5MB limit check
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(`File "${file.name}" terlalu besar (Maksimal 5 MB).`);
        continue;
      }

      // JPG / PNG check
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type.toLowerCase())) {
        setErrorMessage(`Format file "${file.name}" tidak didukung. Gunakan JPG atau PNG.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      const newItem: PhotoPreviewItem = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: previewUrl,
        file,
        name: file.name,
        size: file.size,
        uploadProgress: 100, // Instant mock load or simulated progress
      };
      newItems.push(newItem);
    }

    if (newItems.length > 0) {
      onPhotosChange([...photos, ...newItems]);
    }
  };

  const handleRemove = (id: string) => {
    onPhotosChange(photos.filter((p) => p.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
        disabled={disabled}
      />

      {/* Error Message Toast/Alert */}
      {errorMessage && (
        <div className="p-2.5 bg-destructive/10 text-destructive rounded-md text-xs font-medium flex items-center justify-between border border-destructive/20 animate-in fade-in">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-destructive hover:opacity-75"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Upload Drop Zone & Action */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center hover:border-primary/50 transition-colors bg-card/50 flex flex-col items-center justify-center gap-2',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="p-3 bg-amber-500/10 rounded-full text-amber-600 dark:text-amber-400">
          <Camera className="h-6 w-6" />
        </div>
        <div className="text-xs text-muted-foreground max-w-xs">
          <span className="font-semibold text-foreground">Ambil foto langsung</span> dari kamera atau unggah dari berkas perangkat.
        </div>
        <div className="text-[11px] text-muted-foreground">
          Format JPG/PNG · Maksimal 5 MB per foto ({photos.length}/{maxPhotos})
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 w-full sm:w-auto">
          <button
            type="button"
            disabled={disabled || photos.length >= maxPhotos}
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-4 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors h-11 sm:h-9 shadow-xs"
          >
            <ImagePlus className="h-4 w-4" /> Ambil / Pilih Foto
          </button>
        </div>
      </div>

      {/* Preview Grid (3-column layout) */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group rounded-lg overflow-hidden border border-border bg-card flex flex-col shadow-xs"
            >
              <div className="relative aspect-square w-full bg-muted">
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(photo.id)}
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-destructive transition-colors shadow-xs"
                    title="Hapus Foto"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="p-1.5 bg-card text-[10px] text-muted-foreground flex flex-col justify-between">
                <span className="truncate font-medium text-foreground">{photo.name}</span>
                {photo.size && <span>{formatFileSize(photo.size)}</span>}
                {photo.uploadProgress < 100 && (
                  <Progress value={photo.uploadProgress} className="h-1 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
