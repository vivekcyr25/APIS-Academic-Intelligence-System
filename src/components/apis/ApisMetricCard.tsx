import { usePerformanceMode } from '../../hooks/usePerformanceMode.ts';
import { cn } from '../../lib/utils.ts';
import { memo } from 'react';
import { motion } from 'framer-motion';

interface ApisMetricCardProps {
  label: string;
  value: string | number;
  icon: any;
  subtext?: string;
  trend?: number;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
}

export const ApisMetricCard = memo(({ label, value, subtext, icon: Icon, trend, color = "primary" }: ApisMetricCardProps) => {
  const { isLowEnd } = usePerformanceMode();

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn(
        "relative group overflow-hidden rounded-3xl border backdrop-blur-xl p-6 shadow-2xl transition-all duration-500",
        color === 'primary' ? 'bg-[rgba(17,25,40,0.6)] hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] border-white/10' : 
        color === 'success' ? 'bg-emerald-500/5 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] border-emerald-500/20' :
        color === 'warning' ? 'bg-amber-500/5 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] border-amber-500/20' :
        color === 'danger' ? 'bg-rose-500/5 hover:shadow-[0_0_40px_rgba(244,63,94,0.15)] border-rose-500/20' :
        'bg-[rgba(17,25,40,0.6)] hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] border-white/10'
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] font-medium text-white/50 uppercase tracking-widest">{label}</p>
          <p className="text-4xl md:text-5xl font-bold mt-2 font-mono tracking-tighter text-white">
            {value}
          </p>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center border",
          color === 'primary' ? "bg-primary/20 border-primary/30 text-primary" :
          color === 'success' ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" :
          color === 'warning' ? "bg-amber-500/20 border-amber-500/30 text-amber-400" :
          color === 'danger' ? "bg-rose-500/20 border-rose-500/30 text-rose-400" :
          "bg-white/10 border-white/20 text-white"
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {subtext && (
        <div className="mt-6 flex flex-col gap-1.5 relative z-10">
          <span className="text-xs font-semibold text-white/40">{subtext}</span>
        </div>
      )}
      {trend !== undefined && (
         <div className="mt-4 flex items-center gap-2 text-xs font-semibold relative z-10">
            <span className={cn("flex items-center justify-center px-2 py-0.5 rounded-full", trend > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400")}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
         </div>
      )}
    </motion.div>
  );
});

ApisMetricCard.displayName = 'ApisMetricCard';
