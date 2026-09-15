import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  X, 
  User, 
  Bot, 
  Loader2,
  Maximize2,
  Minimize2,
  Sparkles,
  Square
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { subscribeToMarks, type MarkRecord } from '../../services/marks/marksService.ts';
import { useAIStream } from '../../hooks/useAIStream.ts';
import { cn } from '../../lib/utils.ts';
import type { ChatMessage } from '../../services/ai/aiService.ts';
import { generateLocalAcademicResponse } from '../../services/ai/localAIAdvisor.ts';
import { isExplicitOrInappropriate, SAFETY_REFUSAL_MESSAGE } from '../../services/ai/safetyFilter.ts';

interface NeuralConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

const NeuralConsole = ({ isOpen, onClose }: NeuralConsoleProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: "Academic Intelligence Assistant online. Ready to analyze your marks, exam targets, and workload patterns." }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentPromptRef = useRef<string>('');
  
  const { user } = useAuth();
  const [marks, setMarks] = useState<MarkRecord[]>([]);

  // Use the fetch-based streaming hook with intelligent local fallback
  const { startStream, abortStream, isStreaming, error, text } = useAIStream({
    onChunk: () => {},
    onComplete: () => {
      console.log('Stream completed.');
    },
    onError: (_err) => {
      // Offline/Cloud-cold failsafe: synthesize immediate local academic intelligence
      const prompt = currentPromptRef.current;
      const fallbackReply = generateLocalAcademicResponse(prompt, user, marks);
      
      setMessages(prev => {
        const filtered = prev.filter(m => !(m.role === 'ai' && m.content === ''));
        return [...filtered, { role: 'ai', content: fallbackReply }];
      });
    }
  });

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToMarks(user.id, setMarks);
    return () => unsubscribe();
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, text, isStreaming]);

  // Sync streaming text to the last message
  useEffect(() => {
    if (isStreaming && text) {
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg && lastMsg.role === 'ai') {
          lastMsg.content = text;
        } else {
          newMsgs.push({ role: 'ai', content: text });
        }
        return newMsgs;
      });
    }
  }, [text, isStreaming]);

  const getContextString = () => {
    const marksStr = marks.map(m => 
      `${m.subject}: Total=${m.total}, Grade=${m.grade}`
    ).join('\n');
    return `Student: ${user?.name}\nPerformance:\n${marksStr}`;
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userPrompt = input.trim();
    currentPromptRef.current = userPrompt;
    
    const userMsg: ChatMessage = { role: 'user', content: userPrompt };
    setInput('');

    // Instant Safety Filter Evaluation
    if (isExplicitOrInappropriate(userPrompt)) {
      setMessages(prev => [
        ...prev, 
        userMsg, 
        { role: 'ai', content: SAFETY_REFUSAL_MESSAGE }
      ]);
      return;
    }

    setMessages(prev => [...prev, userMsg]);

    const context = getContextString();
    startStream(userPrompt, context);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "rounded-3xl flex flex-col overflow-hidden transition-all duration-500 mt-6 relative",
              "backdrop-blur-2xl border border-white/10 bg-[rgba(10,8,22,0.92)]",
              "shadow-[0_0_80px_rgba(31, 129, 118, 0.15)]",
              isExpanded ? "h-[800px]" : "h-[520px]"
            )}
          >
            {/* ── Background Academic Doodle Ornaments Overlay ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 opacity-20">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" stroke="#2C9589" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  {/* Top-Right Open Book */}
                  <g transform="translate(480, 20) scale(0.8) rotate(8)">
                    <path d="M0,18 C8,12 18,12 26,16 C34,12 44,12 52,18 L52,38 C44,32 34,32 26,36 C18,32 8,32 0,38 Z" />
                    <path d="M26,16 L26,36" />
                  </g>
                  {/* Top-Right Graduation Cap */}
                  <g transform="translate(680, 30) scale(0.8) rotate(-6)">
                    <polygon points="24,6 48,16 24,26 0,16" />
                    <path d="M10,21 L10,32 C10,32 16,36 24,36 C32,36 38,32 38,32 L38,21" />
                    <path d="M48,16 L48,34" />
                  </g>
                  {/* Center-Right Math Symbols */}
                  <g transform="translate(620, 160) scale(0.9)">
                    <path d="M4,10 L24,10 M10,10 L8,26 M18,10 L20,26" strokeWidth="1.4" />
                    <path d="M32,20 L35,26 L39,12 L50,12" strokeWidth="1.2" />
                  </g>
                  {/* Bottom-Right Code Brackets */}
                  <g transform="translate(640, 320) scale(0.9) rotate(5)">
                    <path d="M8,0 L0,10 L8,20" strokeWidth="1.4" />
                    <path d="M24,0 L32,10 L24,20" strokeWidth="1.4" />
                    <line x1="18" y1="2" x2="14" y2="18" strokeWidth="1.2" />
                  </g>
                  {/* Mid-Left Lightbulb */}
                  <g transform="translate(40, 180) scale(0.75) rotate(-8)">
                    <path d="M12,0 C5,0 0,5 0,12 C0,16 3,20 5,23 L5,27 L19,27 L19,23 C21,20 24,16 24,12 C24,5 19,0 12,0 Z" />
                    <line x1="7" y1="30" x2="17" y2="30" />
                  </g>
                  {/* Bottom-Left Stack of Books */}
                  <g transform="translate(60, 320) scale(0.8) rotate(-4)">
                    <rect x="0" y="24" width="44" height="10" rx="2" />
                    <rect x="4" y="13" width="38" height="9" rx="2" />
                    <rect x="2" y="2" width="36" height="9" rx="2" />
                  </g>
                  {/* Sparkle accents */}
                  <g transform="translate(320, 90)">
                    <path d="M4,0 L5,3 L8,4 L5,5 L4,8 L3,5 L0,4 L3,3 Z" fill="#CE8B32" opacity="0.5" stroke="none" />
                  </g>
                  <g transform="translate(540, 260)">
                    <path d="M3,0 L4,2 L6,3 L4,4 L3,6 L2,4 L0,3 L2,2 Z" fill="#2C9589" opacity="0.5" stroke="none" />
                  </g>
                </g>
              </svg>
            </div>

            {/* Ambient Corner Glow */}
            <div 
              className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[90px] pointer-events-none"
              aria-hidden="true"
            />

            {/* ── AI Header with Elongated Condensed Typography ── */}
            <div className="p-6 sm:p-7 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal/20 border border-primary/30 flex items-center justify-center text-teal-bright relative shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-condensed-heading text-xl sm:text-2xl font-black tracking-wide text-white">
                      ACADEMIC INTELLIGENCE CONSOLE
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className={cn("w-2 h-2 rounded-full", error ? "bg-red-400" : "bg-emerald-400 animate-pulse")} />
                    <span className={cn("font-condensed text-xs font-bold uppercase tracking-widest", error ? "text-red-400" : "text-emerald-400/90")}>
                      {error ? "CONNECTION LOST" : "CONTEXT ENGINE READY"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)} 
                  className="p-2.5 hover:bg-white/5 rounded-xl text-muted-foreground hover:text-white transition-colors"
                  aria-label={isExpanded ? "Minimize" : "Maximize"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={onClose} 
                  className="p-2.5 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl text-muted-foreground transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Chat Flow with Condensed Typography ── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scroll-smooth custom-scrollbar relative z-10">
              {messages.map((msg, i) => {
                if (msg.role === 'ai' && msg.content === '') return null;
                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex gap-3 sm:gap-4",
                      msg.role === 'user' ? "flex-row-reverse" : ""
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border",
                      msg.role === 'user'
                        ? "bg-primary text-white border-primary/50 shadow-[0_0_15px_rgba(31, 129, 118, 0.4)]"
                        : "bg-white/5 text-teal-bright border-white/10"
                    )}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={cn(
                      "max-w-[85%] px-5 py-4 rounded-2xl font-condensed text-base font-medium tracking-wide leading-relaxed",
                      msg.role === 'user'
                        ? "bg-primary/30 text-white rounded-tr-none border border-primary/30 shadow-[0_4px_20px_rgba(31, 129, 118, 0.15)]"
                        : "bg-white/[0.04] text-white/90 rounded-tl-none border border-white/[0.08]"
                    )}>
                      {msg.role === 'user' ? (
                        <p>{msg.content}</p>
                      ) : (
                        <div className="prose prose-invert prose-p:my-1 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-teal-bright text-sm sm:text-base leading-relaxed">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {isStreaming && !text && (
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white/5 text-primary border border-white/10 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-white/5 px-5 py-4 rounded-2xl rounded-tl-none border border-white/8">
                    <span className="font-condensed text-sm text-teal-bright/80 font-bold uppercase tracking-widest">
                      Synthesizing academic reflection...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ── Input Node ── */}
            <div className="p-5 sm:p-6 border-t border-white/5 bg-white/[0.02] backdrop-blur-3xl relative z-10">
              <div className="relative flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Ask about exam targets, workload risks, or subject strategies..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-2xl pl-5 pr-16 py-4 font-condensed text-base font-medium tracking-wide text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-white/30 placeholder:font-condensed placeholder:tracking-wide"
                />
                <button
                  onClick={isStreaming ? abortStream : handleSend}
                  disabled={(!input.trim() && !isStreaming)}
                  className={cn(
                    "absolute right-2 p-3 rounded-xl shadow-lg transition-all active:scale-95",
                    isStreaming
                      ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30"
                      : "bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(31, 129, 118, 0.4)] hover:scale-105 disabled:opacity-30 disabled:scale-100"
                  )}
                  aria-label={isStreaming ? "Stop" : "Send message"}
                >
                  {isStreaming ? <Square className="w-4 h-4 fill-current" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NeuralConsole;
