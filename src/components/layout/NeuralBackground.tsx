import { useEffect, useRef, memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// ─── Particle Canvas — more density + speed ───────────────
const ParticleCanvas = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;
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

    const isLowEnd = W < 1024;
    const isMobile = W < 480;
    const PARTICLE_COUNT = isMobile ? 15 : isLowEnd ? 30 : 55;
    
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

    // Color palette — violet, indigo, sky
    const colors = [
      [167, 139, 250], // violet
      [99,  102, 241], // indigo
      [192, 132, 252], // purple-400
      [125, 211, 252], // sky-300 (accent)
    ];

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;
      for (const p of particles) {
        // Breathe opacity
        const breathe = Math.sin(frame * p.pulseSpeed + p.pulsePhase);
        const opacity = p.o + breathe * 0.15;
        const colorIdx = Math.floor(p.pulsePhase * colors.length / (Math.PI * 2)) % colors.length;
        const [r, g, b] = colors[colorIdx];

        // Glow halo
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grad.addColorStop(0, `rgba(${r},${g},${b},${Math.max(0, opacity)})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core dot
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
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: shouldReduceMotion ? 0 : 0.75 }} />;
});

// ─── Aurora wave — horizontal streaks ─────────────────────
const AuroraWaves = () => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <>
    {/* Wave 1 */}
    <motion.div
      className="absolute"
      style={{
        width: '120%', height: '320px',
        top: '8%', left: '-10%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(109,40,217,0.07) 40%, rgba(139,92,246,0.10) 60%, transparent 100%)',
        filter: 'blur(30px)',
        borderRadius: '50%',
        transformOrigin: 'center',
      }}
      animate={{
        x: shouldReduceMotion ? 0 : ['-5%', '5%', '-3%', '5%', '-5%'],
        scaleY: shouldReduceMotion ? 1 : [1, 1.3, 0.9, 1.2, 1],
        opacity: [0.5, 0.9, 0.6, 1, 0.5],
      }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
    />
    {/* Wave 2 */}
    <motion.div
      className="absolute"
      style={{
        width: '130%', height: '260px',
        top: '55%', left: '-15%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(76,29,149,0.06) 40%, rgba(124,58,237,0.09) 60%, transparent 100%)',
        filter: 'blur(35px)',
        borderRadius: '50%',
      }}
      animate={{
        x: shouldReduceMotion ? 0 : ['5%', '-5%', '3%', '-6%', '5%'],
        scaleY: shouldReduceMotion ? 1 : [1, 1.2, 0.85, 1.15, 1],
        opacity: [0.4, 0.85, 0.5, 0.9, 0.4],
      }}
      transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />
    {/* Wave 3 — top accent */}
    <motion.div
      className="absolute"
      style={{
        width: '80%', height: '180px',
        top: '25%', left: '10%',
        background: 'linear-gradient(180deg, transparent, rgba(167,139,250,0.05) 50%, transparent)',
        filter: 'blur(25px)',
        borderRadius: '50%',
      }}
      animate={{
        x: shouldReduceMotion ? 0 : [0, 60, -30, 50, 0],
        opacity: [0.3, 0.7, 0.4, 0.8, 0.3],
      }}
      transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
    />
    </>
  );
};

// ─── Orbiting bloom ───────────────────────────────────────
const OrbitingBloom = ({ delay, size, color, orbitRadius, speed }: {
  delay: number; size: number; color: string; orbitRadius: number; speed: number;
}) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size, height: size,
        top: '50%', left: '50%',
        marginTop: -size / 2, marginLeft: -size / 2,
        background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
        filter: 'blur(50px)',
      }}
      animate={{
        x: shouldReduceMotion ? orbitRadius : [orbitRadius, 0, -orbitRadius, 0, orbitRadius],
        y: shouldReduceMotion ? 0 : [0, orbitRadius * 0.6, 0, -orbitRadius * 0.6, 0],
        scale: shouldReduceMotion ? 1 : [1, 1.15, 0.9, 1.1, 1],
        opacity: [0.5, 0.85, 0.55, 0.9, 0.5],
      }}
      transition={{ duration: speed, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
};

// ─── Neural pulse rings ───────────────────────────────────
const PulseRing = ({ delay, size }: { delay: number; size: number }) => {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return null;
  return (
    <motion.div
      className="absolute rounded-full border border-violet-500/10"
      style={{
        width: size, height: size,
        top: '50%', left: '50%',
        marginTop: -size / 2, marginLeft: -size / 2,
      }}
      animate={{ scale: [1, 1.6], opacity: [0.25, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeOut', delay }}
    />
  );
};

// ─── Root NeuralBackground ────────────────────────────────
export const NeuralBackground = memo(() => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">

      {/* LAYER 1 — Animated deep base */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: shouldReduceMotion 
            ? 'radial-gradient(ellipse 150% 100% at 50% 50%, #0c0520 0%, #060212 50%, #020008 100%)'
            : [
              'radial-gradient(ellipse 150% 100% at 15% 15%, #0c0520 0%, #060212 50%, #020008 100%)',
              'radial-gradient(ellipse 150% 100% at 85% 20%, #0b0420 0%, #05020f 50%, #020008 100%)',
              'radial-gradient(ellipse 150% 100% at 85% 85%, #0a0318 0%, #06030f 50%, #020009 100%)',
              'radial-gradient(ellipse 150% 100% at 15% 80%, #0b0420 0%, #050210 50%, #020009 100%)',
              'radial-gradient(ellipse 150% 100% at 15% 15%, #0c0520 0%, #060212 50%, #020008 100%)',
            ]
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
      />

      {/* LAYER 2 — Orbiting light blooms (Optimized for desktop) */}
      <div className="hidden md:block">
        <OrbitingBloom delay={0}  size={600} color="rgba(109,40,217,0.16)"  orbitRadius={280} speed={12} />
        <OrbitingBloom delay={4}  size={500} color="rgba(139,92,246,0.13)"  orbitRadius={220} speed={15} />
        <OrbitingBloom delay={8}  size={400} color="rgba(76,29,149,0.14)"   orbitRadius={200} speed={10} />
        <OrbitingBloom delay={2}  size={350} color="rgba(167,139,250,0.09)" orbitRadius={320} speed={18} />
      </div>

      {/* LAYER 2b — Static corner anchors */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: '50vw', height: '50vw', top: '-18vw', left: '-12vw',
          background: 'radial-gradient(circle, rgba(109,40,217,0.18) 0%, transparent 65%)', filter: 'blur(40px)' }}
        animate={{ 
          scale: shouldReduceMotion ? 1 : [1, 1.12, 0.95, 1.08, 1], 
          opacity: [0.6, 1, 0.65, 0.95, 0.6] 
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: '55vw', height: '55vw', bottom: '-20vw', right: '-15vw',
          background: 'radial-gradient(circle, rgba(88,28,220,0.16) 0%, transparent 65%)', filter: 'blur(45px)' }}
        animate={{ 
          scale: shouldReduceMotion ? 1 : [1, 1.10, 0.92, 1.07, 1], 
          opacity: [0.55, 0.95, 0.6, 0.9, 0.55] 
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />

      {/* LAYER 3 — Aurora waves */}
      <AuroraWaves />

      {/* LAYER 4 — Neural mesh grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%)',
        }}
      />

      {/* LAYER 5 — Particles with glow halos */}
      <ParticleCanvas />

      {/* LAYER 6 — Neural pulse rings (Desktop Only) */}
      <div className="hidden md:block">
        <PulseRing delay={0} size={300} />
        <PulseRing delay={1.8} size={500} />
        <PulseRing delay={3.6} size={700} />
      </div>

      {/* LAYER 7 — Rotating gradient disc (Desktop Only) */}
      <motion.div
        className="absolute hidden md:block"
        style={{
          width: '80vw', height: '80vw',
          top: '50%', left: '50%',
          marginTop: '-40vw', marginLeft: '-40vw',
          background: 'conic-gradient(from 0deg, transparent 0%, rgba(109,40,217,0.04) 20%, transparent 40%, rgba(139,92,246,0.05) 60%, transparent 80%, rgba(109,40,217,0.04) 100%)',
          borderRadius: '50%',
        }}
        animate={{ rotate: shouldReduceMotion ? 0 : [0, 360] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />

      {/* LAYER 8 — Cinematic vignette */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(0,0,0,0.65) 100%)' }}
      />

      {/* LAYER 9 — Top edge glow line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.0) 10%, rgba(167,139,250,0.5) 50%, rgba(139,92,246,0.0) 90%, transparent)' }}
        animate={{ opacity: shouldReduceMotion ? 0.7 : [0.4, 1, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Bottom edge */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(109,40,217,0.2) 40%, rgba(124,58,237,0.3) 50%, rgba(109,40,217,0.2) 60%, transparent)' }}
        animate={{ opacity: [0.2, 0.7, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </div>
  );
});
