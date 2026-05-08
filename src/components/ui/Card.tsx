import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils.ts';
import { memo } from 'react';
import { usePerformanceMode } from '../../hooks/usePerformanceMode';

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  glass?: boolean;
}

export const Card = memo(({ children, className, glass = true, ...props }: CardProps) => {
  const { isLowEnd } = usePerformanceMode();

  return (
    <motion.div
      initial={!isLowEnd ? { opacity: 0, y: 20 } : false}
      whileInView={!isLowEnd ? { opacity: 1, y: 0 } : false}
      viewport={{ once: true }}
      className={cn(
        glass ? "glass-panel-unified" : "bg-card border border-white/5",
        "p-8 rounded-[40px] overflow-hidden relative transition-all duration-700",
        !isLowEnd && "liquid-glass magnetic-hover",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
});

export const StatsCard = memo(({ label, value, icon: Icon, trend, color = "primary" }: any) => {
  const { isLowEnd } = usePerformanceMode();
  const colors: Record<string, string> = {
    primary: "text-primary bg-primary/5 hover-active",
    success: "text-emerald-400 bg-emerald-400/5 hover-success",
    warning: "text-amber-400 bg-amber-400/5 hover-warning",
    danger: "text-rose-400 bg-rose-400/5 hover-warning",
  };

  return (
    <Card className="flex flex-col gap-6 group cursor-default p-8">
      {!isLowEnd && <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/[0.03] rounded-full blur-3xl group-hover:bg-primary/[0.08] transition-all duration-1000" />}
      <div className="flex items-center justify-between relative z-10">
        <div className={cn("p-4 rounded-[20px] transition-all duration-700 group-hover:scale-105", colors[color], "border border-white/[0.03]")}>
          <Icon className="w-6 h-6 opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>
        {trend !== undefined && (
          <span className={cn(
            "text-[10px] font-black px-4 py-1.5 rounded-full border border-white/[0.03]",
            trend > 0 ? "text-emerald-400 bg-emerald-400/5" : "text-rose-400 bg-rose-400/5"
          )}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="relative z-10 space-y-1">
        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] text-hover-premium hover-muted">
          {label}
        </p>
        <h3 className={cn(
          "text-4xl font-black tracking-tighter text-hover-premium transition-all duration-700",
          color === 'primary' ? 'hover-active' : color === 'success' ? 'hover-success' : 'hover-warning'
        )}>
          {value}
        </h3>
      </div>
    </Card>
  );
});
