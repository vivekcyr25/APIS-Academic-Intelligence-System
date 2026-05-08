import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, LogOut, Settings, History, Archive, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer = ({ isOpen, onClose }: Props) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (err) {
      // Error handled
    }
  };

  const secondaryNav = [
    { icon: Activity, label: 'Advanced Analytics', path: '/analytics' },
    { icon: History, label: 'Migration Tool', path: '/semester-vault' },
    { icon: Archive, label: 'Archived Semesters', path: '/semester-vault' },
    { icon: Settings, label: 'System Preferences', path: '/profile' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] md:hidden gpu-accelerated"
            style={{
              backdropFilter: 'blur(var(--blur-sm))',
              WebkitBackdropFilter: 'blur(var(--blur-sm))'
            }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 rounded-t-3xl z-[70] p-6 pb-12 md:hidden max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-hover-premium hover-active underline-reveal uppercase tracking-widest">More Modules</h3>
              <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-2 mb-8">
              {secondaryNav.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={onClose}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 group text-hover-premium hover-active"
                >
                  <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-500">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-black uppercase tracking-widest text-xs">{item.label}</span>
                </Link>
              ))}
            </div>

            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full h-14 rounded-2xl text-rose-400 border-rose-500/10 hover:bg-rose-500/5 magnetic-hover"
            >
              <LogOut className="w-5 h-5 mr-2" /> Sign Out
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
