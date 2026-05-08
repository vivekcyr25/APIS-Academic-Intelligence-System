import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  Send, 
  X, 
  Sparkles, 
  User, 
  Bot, 
  Loader2,
  Maximize2,
  Minimize2,
  Zap,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { subscribeToMarks, type MarkRecord } from '../../services/marks/marksService.ts';
import { askAI, type ChatMessage } from '../../services/ai/aiService.ts';
import { Button } from '../ui/Button.tsx';
import { cn } from '../../lib/utils.ts';

const AICompanion = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: "Systems initialized. I am APIS Neural Advisor. How can I optimize your academic trajectory today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const [marks, setMarks] = useState<MarkRecord[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToMarks(user.id, setMarks);
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getContextString = () => {
    const marksStr = marks.map(m => 
      `${m.subject}: Total=${m.total}, Grade=${m.grade}`
    ).join('\n');
    return `Student: ${user?.name}\nRegNo: ${user?.regNo}\nPerformance:\n${marksStr}`;
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const context = getContextString();
      const response = await askAI(input, context);
      const aiMsg: ChatMessage = { role: 'ai', content: response };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', content: `⚠️ Signal Error: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Pulse Toggle */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary rounded-[24px] flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.6)] z-[200] neural-glow group"
      >
        <BrainCircuit className="text-white w-8 h-8 transition-transform group-hover:scale-125" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-4 border-background animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
            className={cn(
              "fixed bottom-28 right-8 glass-panel rounded-[40px] flex flex-col z-[200] overflow-hidden transition-all duration-500",
              isExpanded ? "w-[600px] h-[800px]" : "w-[420px] h-[640px]"
            )}
          >
            {/* AI Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary relative">
                  <Zap className="w-6 h-6 animate-glow-pulse" />
                </div>
                <div>
                  <h3 className="font-black font-heading tracking-tight text-lg">Neural Advisor</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Synapse Active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)} 
                  className="p-2 hover:bg-white/5 rounded-xl text-muted-foreground transition-colors"
                >
                  {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Flow */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth custom-scrollbar">
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4",
                    msg.role === 'user' ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg",
                    msg.role === 'user' ? "bg-primary text-white" : "bg-white/10 text-primary border border-white/5"
                  )}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={cn(
                    "max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed relative",
                    msg.role === 'user' 
                      ? "bg-primary/20 text-foreground rounded-tr-none border border-primary/20" 
                      : "bg-white/5 text-foreground rounded-tl-none border border-white/5"
                  )}>
                    {msg.content.split('\n').map((line, idx) => (
                      <p key={idx} className={line ? "mb-2" : "mb-4"}>{line}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-primary flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="bg-white/5 p-5 rounded-3xl rounded-tl-none border border-white/5">
                    <span className="text-xs font-black text-primary uppercase tracking-widest">Processing Vectors...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Node */}
            <div className="p-8 border-t border-white/5 bg-white/2 backdrop-blur-3xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask for academic strategy..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full bg-background border border-white/10 rounded-3xl pl-6 pr-16 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AICompanion;
