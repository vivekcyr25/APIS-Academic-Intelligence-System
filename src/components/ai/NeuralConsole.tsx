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
              "glass-panel rounded-[32px] flex flex-col overflow-hidden transition-all duration-500 mt-6 shadow-[0_0_50px_rgba(37,99,235,0.1)] border-blue-500/20",
              isExpanded ? "h-[800px]" : "h-[500px]"
            )}
          >
            {/* AI Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 relative">
                  <Zap className="w-6 h-6 animate-glow-pulse" />
                </div>
                <div>
                  <h3 className="font-black font-heading tracking-tight text-lg text-blue-100">Neural Console</h3>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", error ? "bg-red-400" : "bg-blue-400")} />
                    <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", error ? "text-red-400" : "text-blue-400")}>
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
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg",
                      msg.role === 'user' ? "bg-blue-600 text-white" : "bg-white/10 text-blue-400 border border-blue-400/30"
                    )}>
                      {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className={cn(
                      "max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed relative",
                      msg.role === 'user' 
                        ? "bg-blue-600/20 text-foreground rounded-tr-none border border-blue-500/30" 
                        : "bg-white/5 text-foreground rounded-tl-none border border-white/5"
                    )}>
                      {msg.content.split('\n').map((line, idx) => (
                        <p key={idx} className={line ? "mb-2" : "mb-4"}>{line}</p>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
              {isStreaming && !text && (
                <div className="flex gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-blue-400 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="bg-white/5 p-5 rounded-3xl rounded-tl-none border border-white/5">
                    <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Opening Stream...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Node */}
            <div className="p-8 border-t border-white/5 bg-white/2 backdrop-blur-3xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Transmit vectors to Groq Engine..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full bg-background border border-white/10 rounded-3xl pl-6 pr-16 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-500/50 transition-all placeholder:text-muted-foreground/30"
                />
                <button
                  onClick={isStreaming ? abortStream : handleSend}
                  disabled={(!input.trim() && !isStreaming)}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-2xl shadow-lg transition-all active:scale-95",
                    isStreaming 
                      ? "bg-rose-500 hover:bg-rose-600 text-white" 
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:scale-110 disabled:opacity-50 disabled:scale-100"
                  )}
                >
                  {isStreaming ? <Square className="w-5 h-5 fill-current" /> : <Send className="w-5 h-5" />}
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
