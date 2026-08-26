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
        compact ? 'py-8 px-6 gap-3' : 'py-16 px-8 gap-5',
        className
      )}
      role="status"
      aria-label={title}
    >
      <div
        className={cn(
          'rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center',
          compact ? 'w-12 h-12' : 'w-16 h-16'
        )}
      >
        <Icon
          className={cn(
            'text-white/30',
            compact ? 'w-5 h-5' : 'w-7 h-7'
          )}
          aria-hidden="true"
        />
      </div>

      <div className="space-y-2 max-w-sm">
        <h3
          className={cn(
            'font-bold text-white/70',
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
          <p className="text-xs text-white/25 font-medium italic mt-1">
            {hint}
          </p>
        )}
      </div>

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
