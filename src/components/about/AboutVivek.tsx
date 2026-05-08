import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Globe, Mail, Github, Linkedin, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useEffect, useRef, useState } from 'react';

/* ─── Animated Neural Particles ─────────────────────────── */
const NeuralParticles = () => {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 8,
    duration: Math.random() * 10 + 15,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-violet-400/20"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

/* ─── Ambient Fog Layer ────────────────────────────────── */
const AmbientFog = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute -inset-[200px] opacity-30"
      animate={{
        background: [
          'radial-gradient(ellipse 60% 40% at 20% 50%, rgba(139,92,246,0.12) 0%, transparent 70%)',
          'radial-gradient(ellipse 60% 40% at 80% 30%, rgba(109,40,217,0.10) 0%, transparent 70%)',
          'radial-gradient(ellipse 60% 40% at 50% 70%, rgba(167,139,250,0.08) 0%, transparent 70%)',
          'radial-gradient(ellipse 60% 40% at 20% 50%, rgba(139,92,246,0.12) 0%, transparent 70%)',
        ],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

/* ─── Grid Texture ─────────────────────────────────────── */
const GridTexture = () => (
  <div
    className="absolute inset-0 pointer-events-none opacity-[0.015]"
    style={{
      backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
      backgroundSize: '60px 60px',
    }}
  />
);

/* ─── Portrait Frame ───────────────────────────────────── */
const CinematicPortrait = () => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      {/* Outer Glow Ring */}
      <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-violet-600/30 via-purple-500/20 to-indigo-500/30 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-1000" />
      
      {/* Pulse Animation Ring */}
      <motion.div
        className="absolute -inset-2 rounded-full border border-violet-500/30"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(139, 92, 246, 0)',
            '0 0 0 12px rgba(139, 92, 246, 0)',
          ],
          opacity: [0.6, 0],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
      />

      {/* Violet Rim Light */}
      <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full p-[2px] bg-gradient-to-tr from-violet-500 via-purple-400 to-indigo-500 shadow-[0_0_40px_rgba(139,92,246,0.4)] group-hover:shadow-[0_0_60px_rgba(139,92,246,0.6)] transition-shadow duration-700">
        <div className="w-full h-full rounded-full overflow-hidden bg-background relative">
          <img
            src="vivek-portrait.jpg"
            alt="Vivek Sharma — Systems Architect"
            className={cn(
              "w-full h-full object-cover object-top scale-110 transition-all duration-1000",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImgLoaded(true)}
          />
          {/* Fallback */}
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-600 to-purple-800">
              <span className="text-5xl font-black text-white/80">V</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Animation */}
      <motion.div
        className="absolute inset-0"
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
};

/* ─── Social Link Button ───────────────────────────────── */
const SocialLink = ({ name, icon, url, delay }: { name: string; icon: React.ReactNode; url: string; delay: number }) => (
  <motion.a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -4, scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    className={cn(
      "flex items-center gap-3 px-6 py-4 rounded-2xl",
      "bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl",
      "text-white/50 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.12]",
      "transition-all duration-500 group/link magnetic-hover"
    )}
  >
    <span className="opacity-50 group-hover/link:opacity-100 transition-opacity duration-500">
      {icon}
    </span>
    <span className="text-[10px] font-black uppercase tracking-[0.25em]">
      {name}
    </span>
  </motion.a>
);

/* ─── Main Component ───────────────────────────────────── */
export const AboutVivek = () => {
  const socialLinks = [
    { name: 'GitHub', icon: <Github className="w-4 h-4" />, url: 'https://github.com/vivekcyr25?utm_source=chatgpt.com' },
    { name: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, url: 'https://www.linkedin.com/in/vivek-sharma-2bba8b398/?utm_source=chatgpt.com' },
    { name: 'Portfolio', icon: <Globe className="w-4 h-4" />, url: 'https://vivekcyr25.github.io/space-portfolio/?utm_source=chatgpt.com' },
    { name: 'Email', icon: <Mail className="w-4 h-4" />, url: 'mailto:viveksharma86850@gmail.com' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-120px)] flex items-center justify-center px-6 py-20 overflow-hidden">
      
      {/* ── Background Layers ── */}
      <GridTexture />
      <NeuralParticles />
      <AmbientFog />

      {/* ── Orbital Light ── */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/[0.04] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      {/* ── Main Glass Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-xl"
      >
        {/* Card Outer Glow */}
        <div className="absolute -inset-px rounded-[48px] bg-gradient-to-b from-white/[0.08] via-transparent to-transparent pointer-events-none" />
        
        <div
          className="relative rounded-[48px] border border-white/[0.06] overflow-hidden"
          style={{
            background: 'rgba(8, 6, 18, 0.7)',
            backdropFilter: 'blur(60px) saturate(180%)',
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Top Edge Highlight */}
          <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="px-10 md:px-16 py-16 flex flex-col items-center text-center space-y-10">
            
            {/* ── Portrait ── */}
            <CinematicPortrait />

            {/* ── Identity ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                Vivek Sharma
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-400/80">
                Independent Systems Architect
              </p>
            </motion.div>

            {/* ── Bio ── */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-white/40 leading-relaxed text-sm md:text-base font-medium max-w-md"
            >
              Building resilient academic operating systems focused on calm interaction, offline persistence, and long-term digital memory. Engineering immersive experiences that disappear into the background so students can focus on growth, creativity, and evolution.
            </motion.p>

            {/* ── Social Ecosystem Strip ── */}
            <div className="flex flex-wrap justify-center gap-3">
              {socialLinks.map((link, i) => (
                <SocialLink
                  key={link.name}
                  name={link.name}
                  icon={link.icon}
                  url={link.url}
                  delay={0.7 + i * 0.1}
                />
              ))}
            </div>

            {/* ── Divider ── */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="w-16 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"
            />

            {/* ── Primary CTA ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              className="w-full flex flex-col items-center gap-6"
            >
              <motion.button
                onClick={() => window.open('https://vivekcyr25.github.io/space-portfolio/?utm_source=chatgpt.com', '_blank', 'noopener,noreferrer')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative group/cta px-10 py-5 rounded-full overflow-hidden",
                  "text-sm font-black uppercase tracking-[0.2em] text-white/90",
                  "bg-gradient-to-r from-violet-600/80 via-purple-600/80 to-indigo-600/80",
                  "border border-white/10 hover:border-white/20",
                  "shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)]",
                  "transition-all duration-700"
                )}
              >
                {/* Cinematic sweep effect */}
                <div className="absolute inset-0 -translate-x-full group-hover/cta:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out" />
                
                {/* Animated border glow */}
                <motion.div
                  className="absolute inset-0 rounded-full opacity-0 group-hover/cta:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(45deg, rgba(139,92,246,0.3), rgba(99,102,241,0.3), rgba(139,92,246,0.3))',
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                <span className="relative z-10 flex items-center gap-3">
                  <Sparkles className="w-4 h-4 opacity-60" />
                  Explore the Creator Portfolio
                  <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform duration-300" />
                </span>
              </motion.button>
            </motion.div>

            {/* ── Signature ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 1 }}
              className="font-signature text-base text-white/20 hover:text-white/50 transition-all duration-1000 cursor-default"
            >
              Designed & Engineered in India
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
