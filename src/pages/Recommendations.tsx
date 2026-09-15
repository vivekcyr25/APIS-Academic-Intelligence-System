import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { subscribeToMarks, type MarkRecord } from '../services/marks/marksService.ts';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import {
  Sparkles,
  ArrowRight,
  Target,
  AlertCircle,
  BrainCircuit,
  Loader2,
  FileText,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getRoadmapAnalysis, getCustomStudyPlan } from '../services/ai/aiService.ts';
import { Modal } from '../components/ui/Modal.tsx';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils.ts';

const Recommendations = () => {
  const { user } = useAuth();
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [marksReady, setMarksReady] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<string>('');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToMarks(user.id, (data) => {
      setMarks(data);
      setMarksReady(true);
    });
    return () => unsubscribe();
  }, [user]);

  const generatePlan = async () => {
    if (marks.length === 0) {
      setPlanError('Upload marks before generating a study plan.');
      setIsPlanModalOpen(true);
      return;
    }
    setPlanError(null);
    setPlanLoading(true);
    setIsPlanModalOpen(true);
    try {
      const plan = await getCustomStudyPlan(marks);
      setStudyPlan(plan);
    } catch {
      setPlanError('Could not generate a study plan. Try again in a moment.');
      setStudyPlan('');
    } finally {
      setPlanLoading(false);
    }
  };

  useEffect(() => {
    if (marks.length === 0) {
      setRoadmap(null);
      setLoading(false);
      return;
    }

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

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  const hasMarks = marks.length > 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <PageHeader
        eyebrow="Roadmap"
        title="Recommendations"
        description="Study priorities derived from your uploaded marks — not generic tips."
        actions={
          <Button
            variant="outline"
            onClick={() => navigate('/academic-intelligence')}
            className="gap-2"
          >
            Academic Intelligence <ArrowRight className="w-4 h-4" aria-hidden />
          </Button>
        }
      />

      {!marksReady ? (
        <div
          className="flex items-center justify-center py-20 text-muted-foreground gap-3"
          role="status"
        >
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
          <span className="text-sm">Loading your marks…</span>
        </div>
      ) : !hasMarks ? (
        <EmptyState
          icon={Upload}
          title="Recommendations need marks data"
          description="Upload subject marks first. Once records exist, APIS can surface weak areas and a study plan grounded in your scores."
          action={
            <Link to="/upload">
              <Button className="gap-2">
                <Upload className="w-4 h-4" aria-hidden /> Go to Upload
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div variants={item} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                <AlertCircle className="w-5 h-5" aria-hidden />
              </div>
              <h2 className="text-xl font-semibold">Critical focus</h2>
            </div>

            {loading ? (
              <div
                className="flex flex-col items-center justify-center p-12 glass-panel-unified rounded-3xl"
                role="status"
              >
                <Loader2 className="w-7 h-7 animate-spin text-primary mb-3" aria-hidden />
                <p className="text-sm text-muted-foreground">Analyzing your marks…</p>
              </div>
            ) : roadmap?.interventions?.length > 0 ? (
              roadmap.interventions.map((s: any, i: number) => (
                <Card
                  key={i}
                  className={cn(
                    'border-rose-500/20 bg-rose-500/5',
                    s.priority === 'high' ? 'border-rose-500/40' : ''
                  )}
                >
                  <div className="flex items-center justify-between mb-4 gap-3">
                    <h3 className="font-semibold text-lg">{s.subject}</h3>
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize',
                        s.priority === 'high'
                          ? 'bg-rose-500 text-white'
                          : 'bg-rose-500/20 text-rose-400'
                      )}
                    >
                      {s.priority} priority
                    </span>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.reason}</p>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-start gap-3">
                      <Target className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" aria-hidden />
                      <p className="text-xs font-medium text-foreground">Action: {s.action}</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="flex flex-col items-center justify-center p-10 text-center border-dashed">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" aria-hidden />
                </div>
                <h3 className="font-semibold text-foreground mb-1">No critical interventions</h3>
                <p className="text-sm text-muted-foreground">
                  Based on current marks, nothing is flagged as high-risk right now.
                </p>
              </Card>
            )}
          </motion.div>

          <motion.div variants={item} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Target className="w-5 h-5" aria-hidden />
              </div>
              <h2 className="text-xl font-semibold">Growth</h2>
            </div>

            {roadmap?.growth?.length > 0 ? (
              roadmap.growth.map((g: any, i: number) => (
                <Card key={i} className="space-y-4 border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                      <Sparkles className="w-5 h-5" aria-hidden />
                    </div>
                    <div>
                      <h3 className="font-semibold">{g.title}</h3>
                      <p className="text-xs text-primary font-medium">Target: {g.target}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{g.description}</p>
                </Card>
              ))
            ) : (
              !loading && (
                <p className="text-sm text-muted-foreground">
                  Growth suggestions appear when the advisor finds actionable patterns in your marks.
                </p>
              )
            )}

            <Card className="border-primary/20 relative overflow-hidden">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-primary" aria-hidden /> Study plan
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                Generate a 7-day plan from your weak and strong subjects. Requires existing marks.
              </p>
              <Button onClick={generatePlan} className="w-full gap-2" disabled={!hasMarks}>
                <FileText className="w-4 h-4" aria-hidden /> Generate study plan
              </Button>
            </Card>
          </motion.div>
        </div>
      )}

      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="7-day study plan"
      >
        {planLoading ? (
          <div className="py-16 text-center space-y-4" role="status">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" aria-hidden />
            <p className="text-sm text-muted-foreground">Building your plan from marks data…</p>
          </div>
        ) : planError ? (
          <div className="space-y-4">
            <p className="text-sm text-rose-400" role="alert">
              {planError}
            </p>
            <Button onClick={() => setIsPlanModalOpen(false)} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/40 p-5 rounded-2xl border border-border/50 max-h-[500px] overflow-y-auto">
              <ReactMarkdown>{studyPlan || 'No plan content returned.'}</ReactMarkdown>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => window.print()} variant="outline" className="flex-1 gap-2">
                <FileText className="w-4 h-4" aria-hidden /> Print
              </Button>
              <Button onClick={() => setIsPlanModalOpen(false)} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default Recommendations;
