import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import TopNav from './TopNav.tsx';
import { NeuralBackground } from './NeuralBackground.tsx';
import { MobileBottomNav } from './MobileBottomNav.tsx';
import { MobileDrawer } from './MobileDrawer.tsx';
import { SyncStatusIndicator } from './SyncStatusIndicator.tsx';
import { usePerformanceMode } from '../../hooks/usePerformanceMode';

const Footer = () => (
  <footer className="mt-20 pb-12 border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
    <div className="flex flex-col items-center md:items-start gap-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          <span className="text-[10px] font-black text-white">APIS</span>
        </div>
        <span className="text-sm font-black text-white/80 tracking-widest uppercase text-hover-premium hover-active">Academic Intelligence System</span>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
        Designed & Engineered by <Link to="/about" className="text-hover-premium hover-active underline-reveal text-violet-400">Vivek Sharma</Link>
      </p>
    </div>

    <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
      <Link to="/architecture" className="text-hover-premium hover-active underline-reveal">Architecture</Link>
      <Link to="/legal/privacy" className="text-hover-premium hover-active underline-reveal">Privacy</Link>
      <Link to="/legal/terms" className="text-hover-premium hover-active underline-reveal">Terms</Link>
      <Link to="/legal/data-ownership" className="text-hover-premium hover-active underline-reveal">Ownership</Link>
    </div>

    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 hover:text-white/30 transition-all duration-700 cursor-default">
      RC v1.3.21.0 • Academic OS
    </div>
  </footer>
);

export const AppLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  usePerformanceMode(); // Initialize performance engine

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="flex flex-col min-h-screen text-foreground relative overflow-hidden" style={{ background: '#06030f' }}>
      
      {/* Dynamic Glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.05), transparent 40%)`
        }}
      />
      
      {/* Noise Texture Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
      
      {/* Living cinematic neural environment */}
      <NeuralBackground />

      <TopNav />
      
      <main className="flex-1 flex flex-col relative z-10 pt-[88px] sm:pt-[104px] px-3 sm:px-6 pb-28 md:pb-12 w-full">
        <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </div>
      </main>

      <MobileBottomNav onMenuClick={() => setDrawerOpen(true)} />
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <SyncStatusIndicator />
    </div>
  );
};
