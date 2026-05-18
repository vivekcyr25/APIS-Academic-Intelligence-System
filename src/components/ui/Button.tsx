import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.ts';
import { Loader2 } from 'lucide-react';
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, disabled, children, ...props }, ref) => {
    const variants = {
      default: 'bg-primary/90 text-primary-foreground hover:bg-primary shadow-[0_0_20px_rgba(139,92,246,0.15)] border-white/5',
      primary: 'bg-primary/90 text-primary-foreground hover:bg-primary shadow-[0_0_20px_rgba(139,92,246,0.15)] border-white/5',
      secondary: 'bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 border-white/5',
      outline: 'border border-white/10 bg-transparent hover:bg-white/5 text-white/80',
      ghost: 'hover:bg-white/5 text-white/40 hover:text-white/80',
      destructive: 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20',
      glass: 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl text-white/70 hover:text-white hover:bg-white/[0.05]',
    };

    const sizes = {
      default: 'h-11 px-6',
      sm: 'h-9 px-4 text-[10px]',
      lg: 'h-14 px-8 text-xs',
      icon: 'h-10 w-10',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-[20px] font-black tracking-widest uppercase transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none hover:brightness-110 active:scale-[0.98]',
          'liquid-glass magnetic-hover relative overflow-hidden text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
