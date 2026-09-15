import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { cn } from '../../lib/utils';
import { mobilePrimaryNav } from '../../lib/navConfig';
import { useTheme } from '../../contexts/ThemeContext';

export const MobileBottomNav = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const location = useLocation();
  const { isDark } = useTheme();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      aria-label="Primary"
    >
      <div
        className={cn(
          'rounded-2xl p-1.5 flex items-center justify-between border gpu-accelerated',
          isDark
            ? 'bg-[#0a0a0a]/92 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
            : 'bg-white/95 border-border shadow-[0_8px_28px_rgba(15,23,42,0.12)]'
        )}
        style={{
          backdropFilter: 'blur(var(--blur-md))',
          WebkitBackdropFilter: 'blur(var(--blur-md))',
        }}
      >
        {mobilePrimaryNav.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.div key={item.path} whileTap={{ scale: 0.94 }} className="flex-1">
              <Link
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex flex-col items-center justify-center h-14 rounded-xl transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className={cn('w-5 h-5 mb-0.5', isActive && 'scale-105')} aria-hidden />
                <span className="text-[10px] font-semibold tracking-wide">
                  {item.shortLabel ?? item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-active"
                    className="absolute -top-0.5 w-5 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={onMenuClick}
          aria-label="Open more modules"
          className="relative flex flex-col items-center justify-center flex-1 h-14 text-muted-foreground rounded-xl"
        >
          <Menu className="w-5 h-5 mb-0.5" aria-hidden />
          <span className="text-[10px] font-semibold tracking-wide">More</span>
        </motion.button>
      </div>
    </nav>
  );
};
