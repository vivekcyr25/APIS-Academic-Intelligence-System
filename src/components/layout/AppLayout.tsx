import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import TopNav from './TopNav.tsx';
import { NeuralBackground } from './NeuralBackground.tsx';
import { MobileBottomNav } from './MobileBottomNav.tsx';
import { MobileDrawer } from './MobileDrawer.tsx';
import { SyncStatusIndicator } from './SyncStatusIndicator.tsx';
import { usePerformanceMode } from '../../hooks/usePerformanceMode';
import { useTheme } from '../../contexts/ThemeContext.tsx';

const Footer = () => {
  const { isDark } = useTheme();
  return (
    <footer
      className={`mt-20 pb-12 pt-12 flex flex-col md:flex-row items-center justify-between gap-8 border-t ${
        isDark ? 'border-white/5' : 'border-border'
      }`}
    >
      <div className="flex flex-col items-center md:items-start gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-[10px] font-black text-primary-foreground">APIS</span>
          </div>
          <span
            className={`text-sm font-semibold tracking-wide ${
              isDark ? 'text-white/80' : 'text-foreground/80'
            }`}
          >
            Academic Intelligence System
          </span>
        </div>
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
            isDark ? 'text-white/25' : 'text-muted-foreground'
          }`}
        >
          Designed &amp; Engineered by{' '}
          <Link to="/about" className="text-primary hover:underline">
            Vivek Sharma
          </Link>
        </p>
      </div>

      <nav
        className={`flex items-center gap-6 text-[10px] font-semibold uppercase tracking-[0.16em] ${
          isDark ? 'text-white/35' : 'text-muted-foreground'
        }`}
        aria-label="Footer"
      >
        <Link to="/architecture" className="hover:text-foreground transition-colors">
          Architecture
        </Link>
        <Link to="/legal/privacy" className="hover:text-foreground transition-colors">
          Privacy
        </Link>
        <Link to="/legal/terms" className="hover:text-foreground transition-colors">
          Terms
        </Link>
        <Link to="/legal/data-ownership" className="hover:text-foreground transition-colors">
          Ownership
        </Link>
      </nav>

      <div
        className={`text-[10px] font-medium uppercase tracking-[0.16em] ${
          isDark ? 'text-white/30' : 'text-muted-foreground'
        }`}
      >
        APIS · Personal Academic Intelligence
      </div>
    </footer>
  );
};

export const AppLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isDark } = useTheme();
  usePerformanceMode();

  return (
    <div
      className="flex flex-col min-h-screen text-foreground relative overflow-hidden bg-background"
      style={{
        background: isDark ? '#17201F' : '#F7F4EC',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Subtle grain — atmosphere without cursor-follow glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          opacity: isDark ? 0.03 : 0.015,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <NeuralBackground />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <TopNav />

      <main
        id="main-content"
        className="flex-1 flex flex-col relative z-10 pt-[88px] sm:pt-[104px] px-3 sm:px-6 pb-28 md:pb-12 w-full"
      >
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
