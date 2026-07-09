import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  Send, 
  X, 
  User, 
  Bot, 
  Loader2,
  Maximize2,
  Minimize2,
  Zap,
  Square
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { subscribeToMarks, type MarkRecord } from '../../services/marks/marksService.ts';
import { useAIStream } from '../../hooks/useAIStream.ts';
import { cn } from '../../lib/utils.ts';
import type { ChatMessage } from '../../services/ai/aiService.ts';

interface NeuralConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

const NeuralConsole = ({ isOpen, onClose }: NeuralConsoleProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: "Neural Console Online. Groq Engine Active. Awaiting input vectors..." }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const [marks, setMarks] = useState<MarkRecord[]>([]);

  // Use the new fetch-based streaming hook
  const { startStream, abortStream, isStreaming, error, text } = useAIStream({
    onChunk: (chunk) => {
      // The hook maintains the full text in `text`, but we also get it here
      // We will rely on an effect to update the last message
    },
    onComplete: (fullText) => {
      console.log('Stream completed.');
    },
    onError: (err) => {
      setMessages(prev => [...prev, { role: 'ai', content: `⚠️ Signal Error: ${err.message}` }]);
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
    return `Student: ${user?.name}\nRegNo: ${user?.regNo}\nPerformance:\n${marksStr}`;
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Add empty AI message placeholder
    setMessages(prev => [...prev, { role: 'ai', content: "" }]);

    const context = getContextString();
    startStream(input, context);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "rounded-3xl flex flex-col overflow-hidden transition-all duration-500 mt-6",
              "backdrop-blur-xl border border-white/10 bg-[rgba(11,17,32,0.9)]",
              "shadow-[0_0_60px_rgba(139,92,246,0.1)]",
              isExpanded ? "h-[800px]" : "h-[500px]"
            )}
          >
            {/* AI Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary relative">
                  <Zap className="w-6 h-6" />
                  <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold font-heading tracking-tight text-lg">Neural Console</h3>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", error ? "bg-red-400" : "bg-primary")} />
                    <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] font-mono", error ? "text-red-400" : "text-primary/80")}>
                      {error ? "CONNECTION LOST" : "GROQ V2 ACTIVE"}
                    </span>
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
                  onClick={onClose} 
                  className="p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Flow */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth custom-scrollbar">
              {messages.map((msg, i) => {
                if (msg.role === 'ai' && msg.content === '') return null; // Skip empty placeholder during init
                return (
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
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border",
                      msg.role === 'user'
                        ? "bg-primary text-white border-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                        : "bg-white/5 text-primary/80 border-white/10"
                    )}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={cn(
                      "max-w-[85%] px-5 py-4 rounded-3xl text-sm leading-relaxed",
                      msg.role === 'user'
                        ? "bg-gradient-to-br from-primary/25 to-secondary/15 text-foreground rounded-tr-none border border-primary/25 shadow-[0_4px_20px_rgba(139,92,246,0.1)]"
                        : "bg-white/5 text-foreground/90 rounded-tl-none border border-white/8"
                    )}>
                      {msg.content.split('\n').map((line, idx) => (
                        <p key={idx} className={line ? "mb-2" : "mb-4"}>{line}</p>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
              {isStreaming && !text && (
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white/5 text-primary border border-white/10 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-white/5 px-5 py-4 rounded-3xl rounded-tl-none border border-white/8">
                    <span className="text-xs font-mono text-primary/60 uppercase tracking-widest">Processing vectors...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Node */}
            <div className="p-8 border-t border-white/5 bg-white/2 backdrop-blur-3xl">
              <div className="relative flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Ask your academic AI..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl pl-5 pr-16 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-white/20"
                />
                <button
                  onClick={isStreaming ? abortStream : handleSend}
                  disabled={(!input.trim() && !isStreaming)}
                  className={cn(
                    "absolute right-2 p-3 rounded-xl shadow-lg transition-all active:scale-95",
                    isStreaming
                      ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30"
                      : "bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-110 disabled:opacity-30 disabled:scale-100"
                  )}
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
