import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils.ts';
import { Loader2 } from 'lucide-react';
import { TRANSITIONS } from '../../lib/motion';

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary/90 text-primary-foreground hover:bg-primary shadow-[0_0_20px_rgba(139,92,246,0.15)] border-white/5',
      secondary: 'bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 border-white/5',
      outline: 'border border-white/10 bg-transparent hover:bg-white/5 text-white/80',
      ghost: 'hover:bg-white/5 text-white/40 hover:text-white/80',
      destructive: 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20',
      glass: 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl text-white/70 hover:text-white hover:bg-white/[0.05]',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs',
      md: 'h-11 px-6 text-sm',
      lg: 'h-13 px-8 text-base',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-[20px] font-black tracking-widest uppercase transition-all duration-500 disabled:opacity-50 disabled:pointer-events-none',
          'liquid-glass magnetic-hover relative overflow-hidden text-[10px]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
