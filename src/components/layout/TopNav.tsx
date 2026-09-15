import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.tsx';
import {
  Sparkles, LogOut, MoreHorizontal, ChevronDown, MessageSquare,
  Sun, Moon
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';
import { useState, useEffect, useRef, memo } from 'react';
import { checkSystemHealth, type SystemStatus } from '../../services/health/healthService.ts';
import { FeedbackModal } from '../ui/FeedbackModal';
import { useTheme } from '../../contexts/ThemeContext.tsx';
import { primaryNav, secondaryNav, type NavItem } from '../../lib/navConfig.ts';

// ─── Liquid Glass NavLink ─────────────────────────────────
const NavLink = memo(({ item }: { item: NavItem }) => {
  const location = useLocation();
  const { isDark } = useTheme();
  const isActive = location.pathname === item.path;
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'relative px-4 py-2 rounded-full group flex items-center gap-2 text-sm font-semibold tracking-wide transition-colors duration-200',
        isActive
          ? isDark
            ? 'text-white'
            : 'text-foreground'
          : isDark
            ? 'text-white/45 hover:text-white/85'
            : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {isActive && (
        <motion.div
          layoutId="active-pill"
          className="absolute inset-0 rounded-full border border-border/60 bg-muted/50"
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        />
      )}

      <span className="relative z-10 flex items-center gap-2">
        <Icon className={cn('w-4 h-4', isActive && 'text-primary')} aria-hidden />
        <span className="hidden md:block">{item.label}</span>
      </span>
    </Link>
  );
});

// ─── More Dropdown ──────────────────────────────────────────
const MoreMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { isDark } = useTheme();
  const isActive = secondaryNav.some(n => n.path === location.pathname);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen(!open)}
        className={cn(
          "relative px-4 py-2 rounded-full group flex items-center gap-2 font-condensed text-sm font-bold uppercase tracking-wider transition-all duration-300",
          "text-hover-premium underline-reveal",
          isActive || open
            ? (isDark ? "text-white" : "text-ink")
            : (isDark ? "text-white/40" : "text-ink-soft/50")
        )}
      >
        {/* Active Pill (Liquid Glass) */}
        {(isActive || open) && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 rounded-full border border-white/[0.14] gpu-accelerated shadow-[0_10px_28px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.12)]"
            style={{ 
              background: 'linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.035))',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)'
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          />
        )}
        
        {/* Hover Pill (Subtle Liquid Glass for inactive state) */}
        {!(isActive || open) && (
          <motion.div
            className="absolute inset-0 rounded-full border border-white/[0.08] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
            style={{ 
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          />
        )}

        <span className="relative z-10 flex items-center gap-2">
          <MoreHorizontal className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
          <span className="hidden md:block">More</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3 h-3 opacity-40" />
          </motion.div>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="absolute top-full right-0 mt-3 w-52 rounded-3xl overflow-hidden gpu-accelerated"
            style={{
              border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(23, 32, 31, 0.12)',
              background: isDark ? 'rgba(23, 32, 31, 0.92)' : 'rgba(247, 244, 236, 0.96)',
              backdropFilter: 'blur(var(--blur-xl)) saturate(180%)',
              WebkitBackdropFilter: 'blur(var(--blur-xl)) saturate(180%)',
              boxShadow: isDark
                ? '0 24px 60px rgba(0,0,0,0.6)'
                : '0 16px 40px rgba(23, 32, 31, 0.08), 0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            {/* Glass sheen */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none">
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isDark ? 'via-white/20' : 'via-teal/40'} to-transparent`} />
            </div>

            <div className="p-2 space-y-0.5">
              {secondaryNav.map((item) => {
                const isItemActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "relative flex items-center gap-3 px-4 py-3 rounded-2xl font-condensed text-sm font-bold uppercase tracking-wide transition-all duration-300",
                      "text-hover-premium",
                      isItemActive
                        ? (isDark ? "text-white" : "text-ink")
                        : (isDark ? "text-white/50 hover:text-white/80" : "text-ink-soft/70 hover:text-ink")
                    )}
                  >
                    {/* Active Dropdown Pill */}
                    {isItemActive && (
                      <motion.div
                        layoutId="active-dropdown-pill"
                        className="absolute inset-0 rounded-2xl border border-white/[0.14] gpu-accelerated shadow-[0_10px_28px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.12)]"
                        style={{ 
                          background: 'linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.035))',
                          backdropFilter: 'blur(18px)',
                          WebkitBackdropFilter: 'blur(18px)'
                        }}
                      />
                    )}
                    
                    {/* Hover Pill for dropdown items */}
                    {!isItemActive && (
                      <div
                        className="absolute inset-0 rounded-2xl border border-transparent hover:border-white/[0.08] hover:bg-white/[0.04] transition-all duration-300"
                        style={{ 
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)'
                        }}
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-3 w-full">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {isItemActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-bright shadow-[0_0_8px_rgba(31, 129, 118, 0.6)]" />
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Calm Header Background ───────────────────────────────
const NeuralGradient = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[40px]">
    <div 
      className="absolute inset-0 opacity-40"
      style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(31, 129, 118, 0.08) 0%, transparent 80%)'
      }}
    />
  </div>
);

// ─── Profile Capsule ──────────────────────────────────────
const ProfileCapsule = memo(() => {
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-white/10 cursor-default"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(var(--blur-lg))',
        WebkitBackdropFilter: 'blur(var(--blur-lg))',
      }}
    >
      <div className="relative flex-shrink-0">
        {user?.photoURL && !imgError ? (
          <img
            src={user.photoURL}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-7 h-7 rounded-full object-cover border border-primary/30"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground" aria-hidden>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
      <div className="hidden sm:flex flex-col">
        <span className="text-xs font-bold text-white/80 leading-none truncate max-w-[90px]">
          {user?.name || 'User'}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-primary/80 leading-none mt-0.5">
          Scholar
        </span>
      </div>
    </motion.div>
  );
});

// ─── Root TopNav ──────────────────────────────────────────
const TopNav = () => {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [health, setHealth] = useState<SystemStatus | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Scroll reactivity
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // System health check
  useEffect(() => {
    const update = async () => setHealth(await checkSystemHealth());
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch (e) { /* logout error handled */ }
  };

  return (
    <>
      {/* ── Main bar ── */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-center px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-5xl"
        >
          {/* Glass shell — theme-aware */}
          <div
            className="relative flex items-center justify-between h-14 px-3 rounded-[40px] transition-all duration-500"
            style={{
              border: isDark
                ? '1px solid rgba(255,255,255,0.10)'
                : '1px solid rgba(23, 32, 31, 0.12)',
              background: isDark
                ? (scrolled ? 'rgba(23, 32, 31, 0.88)' : 'rgba(32, 43, 41, 0.72)')
                : (scrolled ? 'rgba(238, 234, 223, 0.94)' : 'rgba(247, 244, 236, 0.85)'),
              backdropFilter: 'blur(var(--blur-xl)) saturate(180%)',
              WebkitBackdropFilter: 'blur(var(--blur-xl)) saturate(180%)',
              boxShadow: isDark
                ? (scrolled
                    ? '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)'
                    : '0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)')
                : (scrolled
                    ? '0 8px 28px rgba(23, 32, 31, 0.08), 0 1px 4px rgba(0,0,0,0.04)'
                    : '0 4px 20px rgba(23, 32, 31, 0.05), 0 1px 2px rgba(0,0,0,0.03)'),
            }}
          >
            <NeuralGradient />

            {/* ── Left: Logo ── */}
            <div className="flex items-center gap-3 pl-2 flex-shrink-0 justify-start">
              <motion.div
                whileHover={{ scale: 1.08, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center shadow-sm"
              >
                <Sparkles className="text-white w-4 h-4" />
              </motion.div>
              <div className="hidden sm:flex flex-col">
                <span className={cn(
                  "text-sm font-black tracking-tight leading-none",
                  isDark ? 'text-white' : 'text-ink'
                )}>APIS AI</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    health?.ai
                      ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)] animate-pulse"
                      : health === null
                        ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)] animate-pulse"
                        : "bg-rose-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]"
                  )} />
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest",
                    health?.ai ? "text-green-400/70" : health === null ? "text-amber-400/70" : "text-white/30"
                  )}>
                    {health === null ? 'Checking...' : health?.ai ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Center: Primary Nav (desktop) ── */}
            <nav className="hidden md:flex items-center gap-4 flex-1 justify-center">
              {primaryNav.map((item) => <NavLink key={item.path} item={item} />)}
              <MoreMenu />
            </nav>

            {/* ── Right: Theme Toggle + Profile + Logout ── */}
            <div className="flex items-center gap-2 pr-1 flex-shrink-0 justify-end">
              <ProfileCapsule />
              <div className="flex items-center gap-1">
                {/* Theme Toggle Button */}
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={toggleTheme}
                  className="theme-toggle-btn relative p-2 rounded-full overflow-hidden transition-all duration-300"
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isDark ? (
                      <motion.span
                        key="moon"
                        initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.25, ease: [0.22,1,0.36,1] }}
                        className="block"
                      >
                        <Moon className="w-4 h-4" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="sun"
                        initial={{ rotate: 30, opacity: 0, scale: 0.7 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: -30, opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.25, ease: [0.22,1,0.36,1] }}
                        className="block"
                      >
                        <Sun className="w-4 h-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setShowFeedbackModal(true)}
                  className={cn(
                    "p-2 rounded-full hover:text-primary transition-colors duration-200",
                    isDark ? 'text-white/40' : 'text-muted-foreground'
                  )}
                  aria-label="Share feedback"
                >
                  <MessageSquare className="w-4 h-4" aria-hidden />
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleLogout}
                  className={cn(
                    "hidden md:flex p-2 rounded-full hover:text-rose-400 transition-colors duration-200",
                    isDark ? 'text-white/40' : 'text-muted-foreground'
                  )}
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" aria-hidden />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Top edge highlight */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-full pointer-events-none" />
        </motion.div>
      </header>

      <FeedbackModal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
      />
    </>
  );
};

export default TopNav;
