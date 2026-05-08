import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Cloud, CloudOff, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  show: boolean;
  label: string;
  type?: 'success' | 'sync' | 'waiting' | 'offline' | 'reconnecting' | 'error';
  className?: string;
}

export const StatusLabel = ({ show, label, type = 'success', className }: Props) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 5 }}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-md",
            type === 'success' && "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
            type === 'sync' && "text-primary bg-primary/10 border border-primary/20",
            type === 'waiting' && "text-muted-foreground bg-white/5 border border-white/10",
            type === 'offline' && "text-amber-400 bg-amber-400/10 border border-amber-400/20",
            type === 'reconnecting' && "text-sky-400 bg-sky-400/10 border border-sky-400/20",
            type === 'error' && "text-rose-400 bg-rose-400/10 border border-rose-400/20",
            className
          )}
        >
          {type === 'success' && <CheckCircle2 className="w-3 h-3" />}
          {type === 'sync' && <Cloud className="w-3 h-3 animate-pulse" />}
          {type === 'waiting' && <Clock className="w-3 h-3 animate-pulse" />}
          {type === 'offline' && <CloudOff className="w-3 h-3" />}
          {type === 'reconnecting' && <RefreshCw className="w-3 h-3 animate-spin" />}
          {type === 'error' && <AlertCircle className="w-3 h-3" />}
          {label}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
