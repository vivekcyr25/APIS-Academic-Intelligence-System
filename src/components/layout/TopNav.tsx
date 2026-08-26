import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.tsx';
import {
  Sparkles, LayoutDashboard, BarChart3,
  User, LogOut, Upload, ClipboardList,
  Table, BrainCircuit, MoreHorizontal, X, ChevronDown, MessageSquare,
  Sun, Moon
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';
import { useState, useEffect, useRef, memo } from 'react';
import { checkSystemHealth, type SystemStatus } from '../../services/health/healthService.ts';
import { FeedbackModal } from '../ui/FeedbackModal';
import { useTheme } from '../../contexts/ThemeContext.tsx';

// ─── Types ────────────────────────────────────────────────
interface NavItem { icon: React.FC<any>; label: string; path: string; }

// ─── Nav Config ───────────────────────────────────────────
const primaryNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/dashboard' },
  { icon: Upload,          label: 'Upload',       path: '/upload'    },
  { icon: BarChart3,       label: 'Intelligence', path: '/academic-intelligence' },
  { icon: User,            label: 'Profile',      path: '/profile'   },
];

const secondaryNav: NavItem[] = [
  { icon: Table,        label: 'Semester Vault', path: '/semester-vault'   },
  { icon: Table,        label: 'Attendance',  path: '/attendance'      },
  { icon: ClipboardList,label: 'Assignments', path: '/assignments'     },
  { icon: MessageSquare, label: 'LMS',         path: '/lms'            },
  { icon: BrainCircuit, label: 'Roadmap',     path: '/recommendations' },
];

// ─── Liquid Glass NavLink ─────────────────────────────────
const NavLink = memo(({ item }: { item: NavItem }) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className={cn(
        "relative px-4 py-2 rounded-full group flex items-center gap-2 font-condensed text-sm font-bold uppercase tracking-wider transition-all duration-300",
        "text-hover-premium underline-reveal",
        isActive ? "text-white" : "text-white/40 hover:text-white/80"
      )}
    >
      {/* Active Pill (Liquid Glass) */}
      {isActive && (
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
      
      {/* Hover Pill (Subtle Liquid Glass for inactive tabs) */}
      {!isActive && (
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
        <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-inherit")} />
        <span className="hidden md:block">{item.label}</span>
        {isActive && (
          <motion.span 
            layoutId="active-dot"
            className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]" 
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          />
        )}
      </span>
      {isActive && (
        <motion.div
          layoutId="active-glow"
          className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-violet-400/50 to-transparent blur-md"
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        />
      )}
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
        ref={ref}
        onClick={() => setOpen(!open)}
        className={cn(
          "relative px-4 py-2 rounded-full group flex items-center gap-2 font-condensed text-sm font-bold uppercase tracking-wider transition-all duration-300",
          "text-hover-premium underline-reveal",
          isActive || open
            ? (isDark ? "text-white" : "text-violet-900")
            : (isDark ? "text-white/40" : "text-violet-600/50")
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
              border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(139,92,246,0.18)',
              background: isDark ? 'rgba(10,10,18,0.92)' : 'rgba(248,245,255,0.96)',
              backdropFilter: 'blur(var(--blur-xl)) saturate(180%)',
              WebkitBackdropFilter: 'blur(var(--blur-xl)) saturate(180%)',
              boxShadow: isDark
                ? '0 24px 60px rgba(0,0,0,0.6)'
                : '0 24px 60px rgba(139,92,246,0.15), 0 4px 16px rgba(0,0,0,0.06)',
            }}
          >
            {/* Glass sheen */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none">
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isDark ? 'via-white/20' : 'via-violet-300/40'} to-transparent`} />
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
                        ? (isDark ? "text-white" : "text-violet-900")
                        : (isDark ? "text-white/50 hover:text-white/80" : "text-violet-700/60 hover:text-violet-900")
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
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
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
        background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(139,92,246,0.08) 0%, transparent 80%)'
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
      {/* Online indicator */}
      <div className="relative flex-shrink-0">
        {user?.photoURL && !imgError ? (
          <img
            src={user.photoURL}
            alt={user?.name || 'Profile'}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-7 h-7 rounded-full object-cover border border-violet-400/30"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-black text-white">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black" />
      </div>
      <div className="hidden sm:flex flex-col">
        <span className="text-xs font-bold text-white/80 leading-none truncate max-w-[90px]">
          {user?.name || 'User'}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-violet-400/80 leading-none mt-0.5">
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
  const location = useLocation();

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
                : '1px solid rgba(139,92,246,0.18)',
              background: isDark
                ? (scrolled ? 'rgba(6,6,15,0.88)' : 'rgba(8,8,20,0.72)')
                : (scrolled ? 'rgba(244,240,255,0.94)' : 'rgba(248,245,255,0.85)'),
              backdropFilter: 'blur(var(--blur-xl)) saturate(180%)',
              WebkitBackdropFilter: 'blur(var(--blur-xl)) saturate(180%)',
              boxShadow: isDark
                ? (scrolled
                    ? '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)'
                    : '0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)')
                : (scrolled
                    ? '0 8px 32px rgba(139,92,246,0.12), 0 1px 4px rgba(0,0,0,0.06)'
                    : '0 4px 24px rgba(139,92,246,0.08), 0 1px 2px rgba(0,0,0,0.04)'),
            }}
          >
            <NeuralGradient />

            {/* ── Left: Logo ── */}
            <div className="flex items-center gap-3 pl-2 flex-shrink-0 justify-start">
              <motion.div
                whileHover={{ scale: 1.08, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-2xl bg-violet-600 flex items-center justify-center shadow-[0_0_16px_rgba(139,92,246,0.5)]"
              >
                <Sparkles className="text-white w-4 h-4" />
              </motion.div>
              <div className="hidden sm:flex flex-col">
                <span className={cn(
                  "text-sm font-black tracking-tight leading-none",
                  isDark ? 'text-white' : 'text-violet-900'
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
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(139,92,246,0.15)' }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setShowFeedbackModal(true)}
                  className={cn(
                    "p-2 rounded-full hover:text-primary transition-colors duration-200",
                    isDark ? 'text-white/30' : 'text-violet-400/60'
                  )}
                  title="Share Feedback"
                >
                  <MessageSquare className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(244,63,94,0.15)' }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleLogout}
                  className={cn(
                    "hidden md:flex p-2 rounded-full hover:text-rose-400 transition-colors duration-200",
                    isDark ? 'text-white/30' : 'text-violet-400/60'
                  )}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
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
