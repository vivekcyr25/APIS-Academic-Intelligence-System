import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Upload, BarChart3, User, Menu } from 'lucide-react';
import { cn } from '../../lib/utils';

export const MobileBottomNav = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dash', path: '/dashboard' },
    { icon: BarChart3, label: 'Intel', path: '/academic-intelligence' },
    { icon: Upload, label: 'Upload', path: '/upload' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-2 flex items-center justify-between shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.path}
              whileTap={{ scale: 0.92 }}
              className="flex-1"
            >
              <Link
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center justify-center h-14",
                  "text-hover-premium hover-active",
                  isActive ? "text-white" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5 mb-1 transition-all duration-300", isActive ? "text-primary scale-110" : "text-muted-foreground")} />
                <span className={cn("text-[8px] font-black tracking-[0.2em] transition-colors uppercase text-hover-premium hover-active")}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-active"
                    className="absolute -top-1 w-6 h-1 bg-violet-500 rounded-b-full shadow-[0_0_12px_rgba(139,92,246,0.6)]"
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onMenuClick}
          className="relative flex flex-col items-center justify-center flex-1 h-14 text-muted-foreground group"
        >
          <Menu className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
          <span className="text-[8px] font-black uppercase tracking-[0.2em] group-hover:text-primary transition-colors">More</span>
        </motion.button>
      </div>
    </div>
  );
};
