import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MessageSquare, 
  Bug, 
  Zap, 
  Lightbulb, 
  Frown, 
  CloudOff,
  CheckCircle2,
  Loader2,
  Send,
  RotateCcw
} from 'lucide-react';
import { Button } from './Button';
import { submitFeedback, type FeedbackCategory } from '../../services/feedback/feedbackService';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: FeedbackCategory;
}

const categories: { id: FeedbackCategory; label: string; icon: any; color: string }[] = [
  { id: 'bug', label: 'Bug Report', icon: Bug, color: 'text-rose-400' },
  { id: 'friction', label: 'UX Friction', icon: Frown, color: 'text-amber-400' },
  { id: 'feature', label: 'Idea', icon: Lightbulb, color: 'text-emerald-400' },
  { id: 'performance', label: 'Performance', icon: Zap, color: 'text-blue-400' },
  { id: 'sync', label: 'Sync/Offline', icon: CloudOff, color: 'text-violet-400' },
  { id: 'general', label: 'General', icon: MessageSquare, color: 'text-slate-400' },
];

export const FeedbackModal = ({ isOpen, onClose, defaultCategory = 'general' }: Props) => {
  const { user } = useAuth();
  const [category, setCategory] = useState<FeedbackCategory>(defaultCategory);
  const [content, setContent] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const handleSubmit = async (retries = 1) => {
    const now = Date.now();
    if (now - lastSubmitTime < 5000) return; // 5s cooldown
    if (!user || !content.trim() || honeypot || isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      await submitFeedback(user.id, category, content);
      setLastSubmitTime(now);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        // Delay resetting success state to keep exit animation smooth
        setTimeout(() => {
          setIsSuccess(false);
          setContent('');
        }, 300);
      }, 3000);
    } catch (err) {
      if (retries > 0) {
        await handleSubmit(retries - 1);
      } else {
        setError("Canonical storage failed. Your insight remains safe locally — please retry.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl glass-panel rounded-[40px] border border-white/10 overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Share Your Insight</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Platform Evolution</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-10">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-16 text-center"
                >
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl"
                    />
                    <div className="relative w-full h-full bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center neural-glow">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                  </div>
                  <h4 className="text-3xl font-black mb-3 text-emerald-400">✓ Insight received</h4>
                  <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                    Thank you for helping evolve APIS AI. <br />
                    Your perspective is now part of the academic engine.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  {/* Honeypot (Hidden) */}
                  <input 
                    type="text" 
                    value={honeypot} 
                    onChange={(e) => setHoneypot(e.target.value)} 
                    className="hidden" 
                    aria-hidden="true" 
                    tabIndex={-1}
                  />

                  {/* Category Selection */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isActive = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300",
                            isActive 
                              ? "bg-primary/10 border-primary/50 shadow-[0_0_20px_rgba(139,92,246,0.1)]" 
                              : "bg-white/5 border-white/10 hover:border-white/20"
                          )}
                        >
                          <Icon className={cn("w-5 h-5", isActive ? "text-primary" : cat.color)} />
                          <span className={cn("text-xs font-bold", isActive ? "text-primary" : "text-muted-foreground")}>
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Content Area */}
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      What's on your mind?
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Describe the bug, friction, or idea in detail..."
                      className="w-full min-h-[160px] bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
                    />
                    
                    {error && (
                      <div className="flex items-center gap-2 text-xs text-rose-400 font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                        <Frown className="w-4 h-4" />
                        {error}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium bg-white/5 px-3 py-2 rounded-lg">
                      <Zap className="w-3 h-3 text-amber-400" />
                      Platform metadata (route, version, PWA status) will be attached to help us debug.
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button 
                      variant="ghost" 
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="text-muted-foreground hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => handleSubmit()}
                      disabled={isSubmitting || !content.trim()}
                      className={cn(
                        "px-8 neural-glow text-white min-w-[140px]",
                        error ? "bg-rose-500 hover:bg-rose-600" : "bg-primary hover:bg-primary/90"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : error ? (
                        <>
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Retry
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Insight
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
