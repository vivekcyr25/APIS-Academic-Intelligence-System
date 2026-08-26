import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronDown } from 'lucide-react';

export const HeroSection = () => {
  const { user } = useAuth();
  
  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center -mt-16 pt-16 pb-12 z-10">
      
      {/* Background Hero Glow Layer */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div 
          className="w-[700px] h-[700px] rounded-full blur-[140px] opacity-40 mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.15) 45%, transparent 70%)'
          }}
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
          transition={{ delay: 0.3, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 mb-8 backdrop-blur-md"
        >
          <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-violet-300">Identity Verified</span>
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-black font-heading tracking-tight leading-[1.1] mb-6 drop-shadow-2xl text-white">
          Welcome to <br />
          <span 
            className="text-transparent bg-clip-text select-none"
            style={{
              backgroundImage: 'linear-gradient(90deg, #ffffff 0%, #e9d5ff 18%, #a855f7 36%, #7c3aed 55%, #6b21a8 76%, #3b0764 100%)'
            }}
          >
            APIS AI
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
          <span className="text-white/80 font-semibold">
            Welcome back, {user?.name || 'Scholar'}.
          </span>
        </p>

      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-6 flex flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Scroll to enter vault</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-violet-400" />
        </motion.div>
      </motion.div>
    </div>
  );
};
