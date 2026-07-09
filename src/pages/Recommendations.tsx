import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { subscribeToMarks, type MarkRecord } from '../services/marks/marksService.ts';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Sparkles, ArrowRight, Target, AlertCircle, BrainCircuit, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getRoadmapAnalysis, getCustomStudyPlan } from '../services/ai/aiService.ts';
import { Modal } from '../components/ui/Modal.tsx';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils.ts';

const Recommendations = () => {
  const { user } = useAuth();
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<string>('');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToMarks(user.id, (data) => {
      setMarks(data);
    });
    return () => unsubscribe();
  }, [user]);

  const generatePlan = async () => {
    setPlanLoading(true);
    setIsPlanModalOpen(true);
    try {
      const plan = await getCustomStudyPlan(marks);
      setStudyPlan(plan);
    } catch (err) {
      // Plan generation failed
    } finally {
      setPlanLoading(false);
    }
  };

  useEffect(() => {
    if (marks.length === 0) return;

    let cancelled = false;
    const generateRoadmap = async () => {
      setLoading(true);
      try {
        const data = await getRoadmapAnalysis(marks);
        if (!cancelled) setRoadmap(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void generateRoadmap();
    return () => {
      cancelled = true;
    };
  }, [marks]);

  const weakSubjects = marks.filter(m => m.total < 60);
  const strongSubjects = marks.filter(m => m.total >= 80);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 md:p-10 space-y-8"
    >
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">Academic Roadmap</h1>
          <p className="text-muted-foreground">AI-generated suggestions for performance optimization</p>
        </div>
        <Button onClick={() => navigate('/analytics')}>
          Analysis Engine <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Critical Focus Section */}
        <motion.div variants={item} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Critical Interventions</h2>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-3xl animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Synthesizing Strategy...</p>
            </div>
          ) : roadmap?.interventions?.length > 0 ? (
            roadmap.interventions.map((s: any, i: number) => (
              <Card key={i} className={cn(
                "border-rose-500/20 bg-rose-500/5",
                s.priority === 'high' ? 'border-rose-500/40' : ''
              )}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">{s.subject}</h3>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    s.priority === 'high' ? 'bg-rose-500 text-white' : 'bg-rose-500/20 text-rose-500'
                  )}>
                    {s.priority} priority
                  </span>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.reason}
                  </p>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
                    <Target className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                    <p className="text-xs font-bold text-foreground">Action: {s.action}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
              <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Performance Optimal</h3>
              <p className="text-sm text-muted-foreground">No critical interventions required for current semester.</p>
            </Card>
          )}
        </motion.div>

        {/* Growth & Optimization Section */}
        <motion.div variants={item} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Growth Opportunities</h2>
          </div>

          {roadmap?.growth?.map((g: any, i: number) => (
            <Card key={i} className="space-y-6 border-primary/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">{g.title}</h3>
                  <p className="text-[10px] uppercase font-black text-primary tracking-widest">Target: {g.target}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {g.description}
              </p>
            </Card>
          ))}

          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BrainCircuit className="w-24 h-24 rotate-12" />
            </div>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> AI Strategy Advisor
            </h3>
            <p className="text-sm text-muted-foreground mb-6 relative z-10">
              Generate a highly personalized study schedule for the next 7 days based on your specific academic weak points and strengths.
            </p>
            <Button onClick={generatePlan} className="w-full relative z-10 gap-2 shadow-lg shadow-primary/20">
              <FileText className="w-4 h-4" /> GENERATE CUSTOM STUDY PLAN
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Study Plan Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="7-Day Academic Survival Plan"
      >
        {planLoading ? (
          <div className="py-20 text-center space-y-6">
            <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-primary">Assembling Curriculum...</p>
              <p className="text-[10px] text-muted-foreground italic">AI is calculating optimal study intervals</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="prose prose-invert prose-sm max-w-none bg-white/5 p-6 rounded-3xl border border-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
              <ReactMarkdown>{studyPlan}</ReactMarkdown>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => window.print()} variant="outline" className="flex-1 gap-2 border-white/10">
                <FileText className="w-4 h-4" /> Save as PDF
              </Button>
              <Button onClick={() => setIsPlanModalOpen(false)} className="flex-1">
                Acknowledge Plan
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default Recommendations;
