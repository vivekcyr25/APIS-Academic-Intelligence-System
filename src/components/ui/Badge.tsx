import { cn } from '../../lib/utils.ts';
import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'outline';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-primary/20 text-primary border-transparent',
      secondary: 'bg-secondary/20 text-secondary-foreground border-transparent',
      destructive: 'bg-rose-500/20 text-rose-400 border-transparent',
      success: 'bg-green-400/10 text-green-400 border-transparent',
      outline: 'text-foreground border-white/10',
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-inner backdrop-blur-sm",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
