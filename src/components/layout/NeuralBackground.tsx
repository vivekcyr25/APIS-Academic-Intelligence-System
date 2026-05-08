import { useEffect, useRef, memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePerformanceMode } from '../../hooks/usePerformanceMode';

/* ─── Particle Engine (Canvas) ────────────────────────── */
const ParticleCanvas = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { tier } = usePerformanceMode();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (tier === 'LOW_END' || shouldReduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    type Particle = {
      x: number; y: number;
      vx: number; vy: number;
      r: number; o: number; maxO: number;
      pulseSpeed: number; pulsePhase: number;
    };

    const isMobile = W < 480;
    const PARTICLE_COUNT = tier === 'BALANCED' ? 25 : 55;
    
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.45),
      vy: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.45),
      r: Math.random() * (isMobile ? 1.5 : 2.0) + 0.5,
      o: Math.random() * 0.4 + 0.1,
      maxO: Math.random() * 0.5 + 0.15,
      pulseSpeed: Math.random() * 0.02 + 0.008,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    const colors = [
      [167, 139, 250], [99, 102, 241], [192, 132, 252], [125, 211, 252],
    ];

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;
      for (const p of particles) {
        const breathe = Math.sin(frame * p.pulseSpeed + p.pulsePhase);
        const opacity = p.o + breathe * 0.15;
        const colorIdx = Math.floor(p.pulsePhase * colors.length / (Math.PI * 2)) % colors.length;
        const [r, g, b] = colors[colorIdx];

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grad.addColorStop(0, `rgba(${r},${g},${b},${Math.max(0, opacity)})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(1, opacity + 0.2)})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      }
      animId = requestAnimationFrame(draw);
    };

    draw();
    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
  }, [tier, shouldReduceMotion]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.75 }} />;
});

/* ─── Aurora Waves ──────────────────────────────────────── */
const AuroraWaves = memo(() => {
  const { isLowEnd } = usePerformanceMode();
  const shouldReduceMotion = useReducedMotion();
  
  if (isLowEnd) return null;

  return (
    <>
      <motion.div
        className="absolute"
        style={{
          width: '120%', height: '320px', top: '8%', left: '-10%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(109,40,217,0.07) 40%, rgba(139,92,246,0.10) 60%, transparent 100%)',
          filter: 'blur(30px)', borderRadius: '50%',
        }}
        animate={{
          x: shouldReduceMotion ? 0 : ['-5%', '5%', '-3%', '5%', '-5%'],
          scaleY: shouldReduceMotion ? 1 : [1, 1.3, 0.9, 1.2, 1],
          opacity: [0.5, 0.9, 0.6, 1, 0.5],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute"
        style={{
          width: '130%', height: '260px', top: '55%', left: '-15%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(76,29,149,0.06) 40%, rgba(124,58,237,0.09) 60%, transparent 100%)',
          filter: 'blur(35px)', borderRadius: '50%',
        }}
        animate={{
          x: shouldReduceMotion ? 0 : ['5%', '-5%', '3%', '-6%', '5%'],
          scaleY: shouldReduceMotion ? 1 : [1, 1.2, 0.85, 1.15, 1],
          opacity: [0.4, 0.85, 0.5, 0.9, 0.4],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </>
  );
});

/* ─── Pulse Ring ────────────────────────────────────────── */
const PulseRing = memo(({ delay, size }: { delay: number; size: number }) => {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return null;
  return (
    <motion.div
      className="absolute rounded-full border border-violet-500/10"
      style={{
        width: size, height: size, top: '50%', left: '50%',
        marginTop: -size / 2, marginLeft: -size / 2,
      }}
      animate={{ scale: [1, 1.6], opacity: [0.25, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeOut', delay }}
    />
  );
});

/* ─── Root NeuralBackground ──────────────────────────────── */
export const NeuralBackground = memo(() => {
  const { isLowEnd } = usePerformanceMode();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none bg-[#06030f]" aria-hidden="true">
      {/* LAYER 1 — Static Deep Space Base */}
      <div className="absolute inset-0 bg-[#06030f]" />
      
      {/* LAYER 2 — Grid Texture (Adaptive Opacity) */}
      <div 
        className="absolute inset-0 opacity-[0.03] md:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* LAYER 3 — Depth Fog (Dynamic) */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -inset-[10%] opacity-40"
          animate={!isLowEnd && !shouldReduceMotion ? {
            background: [
              'radial-gradient(ellipse 60% 40% at 20% 30%, rgba(76, 29, 149, 0.15) 0%, transparent 70%)',
              'radial-gradient(ellipse 60% 40% at 80% 70%, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
              'radial-gradient(ellipse 60% 40% at 20% 30%, rgba(76, 29, 149, 0.15) 0%, transparent 70%)',
            ],
          } : {
            background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(76, 29, 149, 0.15) 0%, transparent 70%)'
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* LAYER 4 — Static Peripheral Blooms */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-violet-900/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      {/* LAYER 5 — Particles (Desktop & Tablet Only) */}
      {!isLowEnd && (
        <div className="hidden md:block">
          <ParticleCanvas />
        </div>
      )}

      {/* LAYER 6 — Aurora Waves */}
      <AuroraWaves />

      {/* LAYER 7 — Pulse Rings (Desktop Only) */}
      {!isLowEnd && (
        <div className="hidden md:block">
          <PulseRing delay={0} size={500} />
          <PulseRing delay={3.6} size={700} />
        </div>
      )}

      {/* LAYER 8 — Cinematic vignette */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(0,0,0,0.65) 100%)' }}
      />
    </div>
  );
});
