import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronDown } from 'lucide-react';

export const HeroSection = () => {
  const { user } = useAuth();
  
  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center -mt-24 pt-24 mb-32 z-10">
      
      {/* Background Hero Layer */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] mix-blend-screen"
        />
        <motion.div 
          initial={{ opacity: 0, rotate: 90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[80px] mix-blend-screen"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-center relative z-10 max-w-4xl px-4"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Identity Verified</span>
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-black font-heading tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
          Welcome to <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary/80 to-secondary animate-text-drift hover:text-white transition-all cursor-default">
            APIS AI
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
          <span className="text-hover-premium hover-active underline-reveal text-white/60">
            Welcome back, {user?.name || 'Scholar'}.
          </span>
        </p>

      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 flex flex-col items-center gap-3 text-muted-foreground"
      >
        <span className="text-[10px] font-black uppercase tracking-widest">Scroll to enter vault</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-primary" />
        </motion.div>
      </motion.div>
    </div>
  );
};
