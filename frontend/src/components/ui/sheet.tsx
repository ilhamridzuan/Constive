'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function Sheet({
  open,
  onOpenChange,
  children,
  title,
  description,
  className,
}: SheetProps) {
  useEffectKeyClose(open, onOpenChange);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* Content drawer panel */}
      <div
        className={cn(
          'relative z-10 w-full max-w-[560px] bg-background border-l border-border p-6 shadow-2xl h-full overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300',
          className
        )}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              {title && <h3 className="text-base font-semibold text-foreground">{title}</h3>}
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-1"
            >
              <X className="h-4 w-4 text-foreground" />
              <span className="sr-only">Tutup</span>
            </button>
          </div>

          <div className="py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function useEffectKeyClose(open: boolean, onOpenChange: (open: boolean) => void) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);
}
