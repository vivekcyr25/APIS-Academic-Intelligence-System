import { memo } from 'react';
import { cn } from '../../lib/utils.ts';

interface ApisSectionHeaderProps {
  title: string;
  description?: string;
  rightAction?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export const ApisSectionHeader = memo(({ 
  title, 
  description, 
  rightAction, 
  className,
  titleClassName,
  descriptionClassName
}: ApisSectionHeaderProps) => {
  return (
    <div className={cn("flex items-center justify-between mb-6 border-l-2 border-primary/30 pl-4 -ml-4", className)}>
      <div>
        <h3 className={cn("font-black text-hover-premium hover-active underline-reveal", titleClassName)}>{title}</h3>
        {description && (
          <p className={cn("text-sm text-muted-foreground", descriptionClassName)}>{description}</p>
        )}
      </div>
      {rightAction && (
        <div className="shrink-0">
          {rightAction}
        </div>
      )}
    </div>
  );
});

ApisSectionHeader.displayName = 'ApisSectionHeader';
