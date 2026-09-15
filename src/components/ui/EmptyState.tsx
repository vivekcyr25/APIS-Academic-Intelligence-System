import React from 'react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  /** What data is needed and what the user will get once added */
  hint?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

/**
 * EmptyState — used across the app when data is unavailable.
 * Never shows fake metrics; instead explains what is needed and what
 * the user will unlock once data is provided.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  hint,
  action,
  className,
  compact = false,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8 px-6 gap-3' : 'py-14 px-8 gap-5',
        className
      )}
      role="status"
    >
      <div
        className={cn(
          'rounded-2xl border border-border/60 bg-muted/40 flex items-center justify-center',
          compact ? 'w-12 h-12' : 'w-14 h-14'
        )}
        aria-hidden
      >
        <Icon
          className={cn(
            'text-muted-foreground',
            compact ? 'w-5 h-5' : 'w-6 h-6'
          )}
        />
      </div>

      <div className="space-y-2 max-w-md">
        <h3
          className={cn(
            'font-semibold text-foreground',
            compact ? 'text-sm' : 'text-base'
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'text-muted-foreground leading-relaxed',
            compact ? 'text-xs' : 'text-sm'
          )}
        >
          {description}
        </p>
        {hint && (
          <p className="text-xs text-muted-foreground/70 mt-1">{hint}</p>
        )}
      </div>

      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};
