import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { secondaryNav } from '../../lib/navConfig';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer = ({ isOpen, onClose }: Props) => {
  const { logout } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch {
      // Auth error surfaced by AuthContext
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60] md:hidden"
            aria-hidden
            style={{
              backdropFilter: 'blur(var(--blur-sm))',
              WebkitBackdropFilter: 'blur(var(--blur-sm))',
            }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="More modules"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-[70] p-6 pb-[max(3rem,env(safe-area-inset-bottom))] md:hidden max-h-[85vh] overflow-y-auto rounded-t-3xl border-t',
              isDark
                ? 'bg-[#0f0f14] border-white/10'
                : 'bg-background border-border'
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold tracking-tight">More</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="p-2 rounded-full bg-muted/60 hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" aria-hidden />
              </button>
            </div>

            <nav className="space-y-1 mb-8" aria-label="Secondary">
              {secondaryNav.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-4 p-3.5 rounded-2xl transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted/70 text-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'p-2 rounded-xl',
                        isActive ? 'bg-primary/15' : 'bg-muted'
                      )}
                    >
                      <Icon className="w-5 h-5" aria-hidden />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full h-12 rounded-2xl text-rose-400 border-rose-500/20 hover:bg-rose-500/5"
            >
              <LogOut className="w-4 h-4 mr-2" aria-hidden /> Sign out
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
