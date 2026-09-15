import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils.ts';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, disabled, children, ...props }, ref) => {
    const variants = {
      default:
        'bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent shadow-sm',
      primary:
        'bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent shadow-sm',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent',
      outline:
        'border border-border bg-transparent hover:bg-muted/60 text-foreground',
      ghost: 'hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-transparent',
      destructive:
        'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20',
      glass:
        'bg-muted/40 border border-border/80 text-foreground/80 hover:text-foreground hover:bg-muted/60',
    };

    const sizes = {
      default: 'h-11 px-5 text-xs',
      sm: 'h-9 px-3.5 text-[11px]',
      lg: 'h-12 px-7 text-xs',
      icon: 'h-10 w-10',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={disabled || isLoading ? undefined : { scale: 1.01 }}
        whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={cn(
          'inline-flex items-center justify-center rounded-2xl font-semibold tracking-wide uppercase transition-colors duration-200',
          'disabled:opacity-50 disabled:pointer-events-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />
            <span>{typeof children === 'string' ? children : 'Working…'}</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
