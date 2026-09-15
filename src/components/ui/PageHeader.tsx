import { cn } from '../../lib/utils.ts';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Shared page header — establishes hierarchy without shouting.
 * Prefer sentence case titles; keep eyebrows short and scannable.
 */
export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) => {
  return (
    <header
      className={cn(
        'flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/60 pb-6',
        className
      )}
    >
      <div className="min-w-0 space-y-2">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="font-heading text-3xl sm:text-4xl text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>
      )}
    </header>
  );
};
