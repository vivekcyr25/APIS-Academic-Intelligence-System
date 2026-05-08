import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSemesterTimeline } from '../../services/academic/timelineService';
import type { TimelineEvent, TimelineEventType } from '../../types/academic-v2';
import { Calendar, Clock, BookOpen, AlertTriangle, CheckCircle2, ChevronRight, Briefcase, Award } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  semesterId: string;
}

const EVENT_CONFIG: Record<TimelineEventType, { icon: any; color: string; bg: string }> = {
  ca_exam: { icon: BookOpen, color: 'text-primary', bg: 'bg-primary/20' },
  mte_exam: { icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/20' },
  ete_exam: { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-600/20' },
  assignment_deadline: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  lab_submission: { icon: Clock, color: 'text-teal-400', bg: 'bg-teal-500/20' },
  project_deadline: { icon: Briefcase, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/20' },
  holiday: { icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  semester_start: { icon: Calendar, color: 'text-white', bg: 'bg-white/20' },
  semester_end: { icon: CheckCircle2, color: 'text-white', bg: 'bg-white/20' },
  internship: { icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  workshop: { icon: Award, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  placement_prep: { icon: Award, color: 'text-violet-400', bg: 'bg-violet-500/20' },
  result_declaration: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' },
  viva: { icon: BookOpen, color: 'text-rose-300', bg: 'bg-rose-400/20' },
  practical: { icon: Clock, color: 'text-teal-300', bg: 'bg-teal-400/20' },
};

export const SemesterTimeline = ({ semesterId }: Props) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getSemesterTimeline(user.id, semesterId).then(data => {
      setEvents(data);
      setLoading(false);
    });
  }, [user, semesterId]);

  if (loading) return null;
  if (events.length === 0) return null; // Hide if no events

  return (
    <div className="mb-10 mt-2">
      <div className="flex items-center gap-2 mb-4">
        <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Semester Timeline</h4>
        <div className="h-[1px] flex-1 bg-white/5" />
      </div>

      <div className="relative overflow-x-auto pb-4 hide-scrollbar">
        {/* Horizontal Line */}
        <div className="absolute top-6 left-4 right-4 h-0.5 bg-white/10 rounded-full" />
        
        <div className="flex items-start gap-6 px-4 w-max min-w-full">
          {events.map((event, idx) => {
            const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.semester_start;
            const Icon = config.icon;
            
            return (
              <motion.div 
                key={event.id || idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="relative group w-48 shrink-0 flex flex-col items-center"
              >
                {/* Connecting Node */}
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-4 relative z-10 border-4 border-black transition-transform group-hover:scale-110",
                  config.bg, config.color,
                  event.status === 'completed' && "opacity-50"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Event Card */}
                <div className={cn(
                  "p-3 rounded-xl border w-full text-center transition-colors",
                  event.status === 'completed' ? "bg-white/5 border-white/5 opacity-50" : "bg-card border-white/10 hover:border-white/20 hover:bg-white/5"
                )}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-muted-foreground">
                    {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <h5 className="text-sm font-bold leading-tight line-clamp-2">{event.title}</h5>
                  {event.subjectId && (
                    <p className="text-[10px] mt-1 text-primary font-medium opacity-80">Subject Event</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
