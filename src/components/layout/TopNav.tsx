import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.tsx';
import {
  Sparkles, LayoutDashboard, BarChart3,
  User, LogOut, Upload, ClipboardList,
  Table, BrainCircuit, MoreHorizontal, X, ChevronDown, MessageSquare
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';
import { useState, useEffect, useRef, memo } from 'react';
import { checkSystemHealth, type SystemStatus } from '../../services/health/healthService.ts';
import { FeedbackModal } from '../ui/FeedbackModal';

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
        "relative px-4 py-2 rounded-full group flex items-center gap-2 text-sm font-black tracking-wide transition-all duration-300",
        "text-hover-premium underline-reveal",
        isActive ? "text-white hover-active" : "text-white/40 hover-active"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="active-pill"
          className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/[0.12]"
          style={{ backdropFilter: 'blur(12px)' }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-inherit")} />
        <span className="hidden md:block">{item.label}</span>
      </span>
      {isActive && (
        <motion.div
          layoutId="active-glow"
          className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        />
      )}
    </Link>
  );
});

// ─── More Dropdown ────────────────────────────────────────
const MoreMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
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
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          "relative px-4 py-2 rounded-full flex items-center gap-2 text-sm font-black tracking-widest uppercase transition-all duration-500",
          "text-hover-premium hover-active underline-reveal",
          isActive || open ? "text-white" : "text-white/40"
        )}
      >
        {(isActive || open) && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/[0.12]"
            style={{ backdropFilter: 'blur(12px)' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
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
            className="absolute top-full right-0 mt-3 w-52 rounded-3xl overflow-hidden border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
            style={{
              background: 'rgba(10,10,18,0.85)',
              backdropFilter: 'blur(40px) saturate(180%)',
            }}
          >
            {/* Glass sheen */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            <div className="p-2 space-y-0.5">
              {secondaryNav.map((item) => {
                const isItemActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all duration-300",
                      "text-hover-premium hover-active",
                      isItemActive
                        ? "bg-white/10 text-white"
                        : "text-white/50 hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
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

// ─── Animated Neural Gradient ─────────────────────────────
const NeuralGradient = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[40px]">
    <motion.div
      className="absolute -inset-4"
      animate={{
        background: [
          'radial-gradient(ellipse 80% 60% at 10% 50%, rgba(99,60,220,0.12) 0%, transparent 70%)',
          'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(139,92,246,0.10) 0%, transparent 70%)',
          'radial-gradient(ellipse 80% 60% at 90% 50%, rgba(76,29,200,0.12) 0%, transparent 70%)',
          'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(109,40,217,0.09) 0%, transparent 70%)',
          'radial-gradient(ellipse 80% 60% at 10% 50%, rgba(99,60,220,0.12) 0%, transparent 70%)',
        ]
      }}
      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
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
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Online pulse */}
      <div className="relative">
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
        {/* Neural pulse */}
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-black flex items-center justify-center">
          <span className="absolute inline-flex w-full h-full rounded-full bg-green-400 opacity-60 animate-ping" />
        </span>
      </div>
      <div className="hidden sm:flex flex-col">
        <span className="text-xs font-bold text-white/80 leading-none truncate max-w-[90px]">
          {user?.name || 'User'}
        </span>
        <span className="text-[9px] font-black uppercase tracking-widest text-violet-400 leading-none mt-0.5">
          Pro v1.2.0
        </span>
      </div>
    </motion.div>
  );
});

// ─── Root TopNav ──────────────────────────────────────────
const TopNav = () => {
  const { logout } = useAuth();
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
          {/* Glass shell */}
          <div
            className="relative flex items-center justify-between h-14 px-3 rounded-[40px] border border-white/[0.10] transition-all duration-500"
            style={{
              background: scrolled
                ? 'rgba(6,6,15,0.88)'
                : 'rgba(8,8,20,0.72)',
              backdropFilter: 'blur(40px) saturate(180%)',
              boxShadow: scrolled
                ? '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)'
                : '0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <NeuralGradient />

            {/* ── Left: Logo ── */}
            <div className="flex items-center gap-3 pl-2 flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.08, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-2xl bg-violet-600 flex items-center justify-center shadow-[0_0_16px_rgba(139,92,246,0.5)]"
              >
                <Sparkles className="text-white w-4 h-4" />
              </motion.div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-black tracking-tight leading-none text-white">APIS AI</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    health?.firebase
                      ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]"
                      : "bg-rose-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]"
                  )} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/30">
                    {health?.firebase ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Center: Primary Nav (desktop) ── */}
            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {primaryNav.map((item) => <NavLink key={item.path} item={item} />)}
              <MoreMenu />
            </nav>
            {/* ── Right: Profile + Logout ── */}
            <div className="flex items-center gap-2 pr-1 flex-shrink-0">
              <ProfileCapsule />
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(139,92,246,0.15)' }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setShowFeedbackModal(true)}
                  className="p-2 rounded-full text-white/30 hover:text-primary transition-colors duration-200"
                  title="Share Feedback"
                >
                  <MessageSquare className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(244,63,94,0.15)' }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleLogout}
                  className="hidden md:flex p-2 rounded-full text-white/30 hover:text-rose-400 transition-colors duration-200"
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
