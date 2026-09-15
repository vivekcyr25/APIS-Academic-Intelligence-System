import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils.ts';
import React, { memo } from 'react';
import { usePerformanceMode } from '../../hooks/usePerformanceMode.ts';

export interface CardProps extends HTMLMotionProps<"div"> {
  glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, glass = true, ...props }, ref) => {
    const { isLowEnd } = usePerformanceMode();

    return (
      <motion.div
        ref={ref}
        initial={isLowEnd ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={isLowEnd ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={cn(
          glass ? "glass-panel-unified" : "bg-card border border-border/60",
          "p-6 sm:p-8 rounded-3xl overflow-hidden relative transition-shadow duration-300",
          !isLowEnd && "hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)]",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 mb-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-xl font-black tracking-tight text-hover-premium", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center pt-6 border-t border-white/5", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export const StatsCard = memo(({
  label,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  loading = false,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  loading?: boolean;
}) => {
  const colors: Record<string, string> = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    danger: 'text-danger bg-danger/10',
  };

  return (
    <Card className="flex flex-col gap-5 cursor-default p-6 sm:p-7">
      <div className="flex items-center justify-between relative z-10">
        <div className={cn('p-3 rounded-2xl border border-border/40', colors[color])}>
          <Icon className="w-5 h-5" aria-hidden />
        </div>
        {trend !== undefined && !loading && (
          <span
            className={cn(
              'text-xs font-semibold px-2.5 py-1 rounded-full',
              trend > 0 ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
            )}
          >
            {trend > 0 ? '+' : ''}
            {trend}%
          </span>
        )}
      </div>
      <div className="relative z-10 space-y-1">
        <p className="text-xs font-medium text-muted-foreground tracking-wide">{label}</p>
        <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {loading ? '—' : value}
        </p>
      </div>
    </Card>
  );
});
