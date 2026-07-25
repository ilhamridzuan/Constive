import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number;
  showCharCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxLength, showCharCount = false, value, onChange, ...props }, ref) => {
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            className
          )}
          ref={ref}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          {...props}
        />
        {showCharCount && maxLength && (
          <div className="absolute bottom-2 right-3 text-[11px] text-muted-foreground bg-background/80 px-1 rounded pointer-events-none">
            {charCount} / {maxLength}
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
