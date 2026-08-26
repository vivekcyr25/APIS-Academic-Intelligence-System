import { motion } from 'framer-motion';
import { Globe, Mail, Github, Linkedin, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/* ─── Neural Particles ─────────────────────────────────── */
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
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0, 0.6, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

/* ─── Ambient Fog ──────────────────────────────────────── */
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

      {/* Pulse Ring */}
      <motion.div
        className="absolute -inset-2 rounded-full border border-violet-500/30"
        animate={{ boxShadow: ['0 0 0 0 rgba(139,92,246,0)', '0 0 0 12px rgba(139,92,246,0)'], opacity: [0.6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
      />

      {/* Portrait image */}
      <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full p-[2px] bg-gradient-to-tr from-violet-500 via-purple-400 to-indigo-500 shadow-[0_0_40px_rgba(139,92,246,0.4)] group-hover:shadow-[0_0_60px_rgba(139,92,246,0.6)] transition-shadow duration-700">
        <div className="w-full h-full rounded-full overflow-hidden bg-background relative">
          <img
            src={`${import.meta.env.BASE_URL}assets/profile/vivek-sharma.png`}
            alt="Vivek Sharma — Systems Architect"
            className={cn('w-full h-full object-cover object-top scale-110 transition-all duration-1000', imgLoaded ? 'opacity-100' : 'opacity-0')}
            onLoad={() => setImgLoaded(true)}
          />
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-600 to-purple-800">
              <span className="text-5xl font-black text-white/80">V</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Social Link Button ───────────────────────────────── */
const SocialLink = ({
  name, icon, url, isDark,
}: { name: string; icon: React.ReactNode; url: string; delay: number; isDark: boolean }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      'flex items-center gap-3 px-6 py-4 rounded-2xl',
      'backdrop-blur-xl transition-all duration-500 group/link magnetic-hover gpu-accelerated',
      isDark
        ? 'bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.12]'
        : 'bg-violet-50/80 border border-violet-200/60 text-violet-700/60 hover:text-violet-900 hover:bg-violet-100/80 hover:border-violet-300/80'
    )}
  >
    <span className="opacity-50 group-hover/link:opacity-100 transition-opacity duration-500">{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-[0.25em]">{name}</span>
  </a>
);

/* ─── Main Component ───────────────────────────────────── */
export const AboutVivek = () => {
  const { isDark } = useTheme();

  const socialLinks = [
    { name: 'GitHub',    icon: <Github className="w-4 h-4" />,   url: 'https://github.com/vivekcyr25?utm_source=chatgpt.com' },
    { name: 'LinkedIn',  icon: <Linkedin className="w-4 h-4" />, url: 'https://www.linkedin.com/in/vivek-sharma-2bba8b398/?utm_source=chatgpt.com' },
    { name: 'Portfolio', icon: <Globe className="w-4 h-4" />,    url: 'https://vivekcyr25.github.io/space-portfolio/?utm_source=chatgpt.com' },
    { name: 'Email',     icon: <Mail className="w-4 h-4" />,     url: 'mailto:viveksharma86850@gmail.com' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-120px)] flex items-center justify-center px-6 py-20 overflow-hidden">

      {/* Background layers */}
      <div className="hidden md:block">
        <AmbientFog />
        <NeuralParticles />
      </div>

      {/* Orbital light blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/[0.04] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-xl"
      >
        {/* Card outer glow */}
        <div
          className="absolute -inset-px rounded-[48px] pointer-events-none"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)'
              : 'linear-gradient(to bottom, rgba(139,92,246,0.12), transparent)',
          }}
        />

        <div
          className="relative rounded-[48px] overflow-hidden gpu-accelerated"
          style={{
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(139,92,246,0.16)',
            background: isDark ? 'rgba(8,6,18,0.70)' : 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(var(--blur-xl)) saturate(180%)',
            WebkitBackdropFilter: 'blur(var(--blur-xl)) saturate(180%)',
            boxShadow: isDark
              ? '0 40px 100px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 24px 80px -12px rgba(139,92,246,0.15), 0 4px 20px rgba(0,0,0,0.06)',
          }}
        >
          {/* Top edge highlight */}
          <div
            className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent to-transparent"
            style={{ background: isDark ? 'linear-gradient(90deg,transparent,rgba(255,255,255,0.20),transparent)' : 'linear-gradient(90deg,transparent,rgba(139,92,246,0.40),transparent)' }}
          />

          <div className="px-10 md:px-16 py-16 flex flex-col items-center text-center space-y-10">

            {/* Portrait */}
            <CinematicPortrait />

            {/* Identity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="space-y-4"
            >
              <h1
                className="text-4xl md:text-5xl font-black tracking-tight font-condensed-heading"
                style={{ color: isDark ? 'rgba(255,255,255,0.95)' : '#1e1b4b' }}
              >
                Vivek Sharma
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-400/80">
                Independent Systems Architect
              </p>
            </motion.div>

            {/* Bio */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{ color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(60,40,120,0.65)' }}
              className="leading-relaxed text-sm md:text-base font-medium max-w-md"
            >
              Building resilient academic operating systems focused on calm interaction, offline persistence,
              and long-term digital memory. Engineering immersive experiences that disappear into the background
              so students can focus on growth, creativity, and evolution.
            </motion.p>

            {/* Social Links */}
            <div className="flex flex-wrap justify-center gap-3">
              {socialLinks.map((link, i) => (
                <SocialLink key={link.name} name={link.name} icon={link.icon} url={link.url} delay={0.7 + i * 0.1} isDark={isDark} />
              ))}
            </div>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="w-16 h-px"
              style={{ background: isDark ? 'linear-gradient(90deg,transparent,rgba(139,92,246,0.30),transparent)' : 'linear-gradient(90deg,transparent,rgba(139,92,246,0.50),transparent)' }}
            />

            {/* CTA */}
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
                  'relative group/cta px-10 py-5 rounded-full overflow-hidden font-condensed',
                  'text-sm font-black uppercase tracking-[0.2em] text-white/90',
                  'bg-gradient-to-r from-violet-600/80 via-purple-600/80 to-indigo-600/80',
                  'border border-white/10 hover:border-white/20',
                  'shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)]',
                  'transition-all duration-700'
                )}
              >
                <div className="absolute inset-0 -translate-x-full group-hover/cta:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out" />
                <span className="relative z-10 flex items-center gap-3">
                  <Sparkles className="w-4 h-4 opacity-60" />
                  Explore the Creator Portfolio
                  <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform duration-300" />
                </span>
              </motion.button>
            </motion.div>

            {/* Signature */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 1 }}
              className="font-signature text-base hover:text-white/50 transition-all duration-1000 cursor-default"
              style={{ color: isDark ? 'rgba(255,255,255,0.20)' : 'rgba(100,80,180,0.35)' }}
            >
              Designed &amp; Engineered in India
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
