import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../../store/useToastStore.ts';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full sm:w-auto">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={cn(
              "pointer-events-auto flex items-center gap-3 p-3 pl-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300",
              toast.type === 'success' && "bg-black/60 border-emerald-500/20 text-white",
              toast.type === 'error' && "bg-rose-500/10 border-rose-500/20 text-rose-400",
              toast.type === 'info' && "bg-primary/10 border-primary/20 text-primary"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              toast.type === 'success' && "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
              toast.type === 'error' && "bg-rose-400",
              toast.type === 'info' && "bg-primary"
            )} />
            
            <p className="text-xs font-bold flex-1 tracking-tight">{toast.message}</p>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-white/5 rounded-lg transition-colors ml-2"
            >
              <X className="w-3.5 h-3.5 opacity-30 hover:opacity-100" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
