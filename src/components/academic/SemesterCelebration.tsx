import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  isActive: boolean;
  onComplete: () => void;
}

export const SemesterCelebration = ({ isActive, onComplete }: Props) => {
  const shouldReduceMotion = useReducedMotion();
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2500); // 2.5 seconds celebration
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Background subtle flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 bg-emerald-500/20 mix-blend-screen"
          />

          {/* Central Burst Element */}
          <motion.div
            initial={{ scale: shouldReduceMotion ? 1 : 0.5, opacity: 0 }}
            animate={{ 
              scale: shouldReduceMotion ? 1 : [0.5, 1.2, 1], 
              opacity: [0, 1, 0] 
            }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="relative flex flex-col items-center justify-center"
          >
            <div className="absolute inset-0 bg-emerald-400/30 blur-[100px] w-64 h-64 rounded-full" />
            
            {!shouldReduceMotion && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-emerald-400/20 border-dashed rounded-full w-48 h-48 m-auto"
              />
            )}

            <div className="w-24 h-24 bg-emerald-500/20 border border-emerald-400/40 rounded-full flex items-center justify-center backdrop-blur-xl relative z-10 shadow-[0_0_50px_rgba(52,211,153,0.3)]">
              <CheckCircle2 className="w-10 h-10 text-emerald-300" />
            </div>

            <motion.div 
              initial={{ y: shouldReduceMotion ? 0 : 20, opacity: 0 }}
              animate={{ y: 0, opacity: [0, 1, 0] }}
              transition={{ delay: 0.2, duration: 1.5 }}
              className="mt-6 text-center"
            >
              <h2 className="text-2xl font-black text-white tracking-widest uppercase flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Semester Completed
              </h2>
            </motion.div>
          </motion.div>

          {/* Floating Neural Particles */}
          {!shouldReduceMotion && [...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x: 0,
                y: 0,
                scale: 0
              }}
              animate={{
                opacity: [0, 1, 0],
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
                scale: Math.random() * 2 + 0.5
              }}
              transition={{
                duration: Math.random() * 1.5 + 1,
                ease: "easeOut"
              }}
              className="absolute w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
              style={{
                left: '50%',
                top: '50%'
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
