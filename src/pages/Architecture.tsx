import { motion } from 'framer-motion';
import { 
  Cpu, 
  Layers, 
  Workflow, 
  Database, 
  ShieldCheck, 
  ArrowLeft,
  Server,
  Lock,
  Sparkles,
  BarChart2,
  FileSpreadsheet,
  Brain
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const Architecture = () => {
  const navigate = useNavigate();

  const productFlow = [
    {
      step: '01',
      title: 'Academic Data Layer',
      desc: 'Raw student inputs: semester records, course evaluation marks (CA1, CA2, MTE, ETE), attendance percentages, and credit weightings.',
      icon: FileSpreadsheet,
      color: 'text-primary',
      bg: 'bg-teal/10',
      border: 'border-primary/20'
    },
    {
      step: '02',
      title: 'Academic Memory Engine',
      desc: 'Normalized multi-term aggregation creating longitudinal deltas, subject weakness vectors, and attendance stability indicators.',
      icon: Brain,
      color: 'text-info',
      bg: 'bg-info/10',
      border: 'border-info/20'
    },
    {
      step: '03',
      title: 'Pattern Detection',
      desc: 'Algorithmic calculations of CGPA progression, credit velocity, and workload concentration without probabilistic guessing.',
      icon: BarChart2,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      step: '04',
      title: 'AI Interpretation',
      desc: 'Server-side LLM proxies analyze detected patterns in context, explaining academic changes in plain, actionable language.',
      icon: Sparkles,
      color: 'text-amber',
      bg: 'bg-amber/10',
      border: 'border-amber/20'
    },
    {
      step: '05',
      title: 'Action & Recommendations',
      desc: 'Synthesized study priority schedules, exam target calculators, and early risk alerts provided to the student.',
      icon: Workflow,
      color: 'text-amber',
      bg: 'bg-amber/10',
      border: 'border-amber/20'
    }
  ];

  const engineeringLayers = [
    {
      title: 'React & TypeScript Client',
      role: 'Presentation & Interaction',
      details: 'Strictly typed frontend utilizing modular React components, client-side routing, and responsive data visualizers with zero fake metrics.',
      icon: Layers,
      color: 'text-primary'
    },
    {
      title: 'Firebase & Cloud Firestore',
      role: 'Secure Persistence & Realtime Sync',
      details: 'User-scoped document trees with strict security rules ensuring student privacy and multi-device synchronization.',
      icon: Database,
      color: 'text-emerald-400'
    },
    {
      title: 'Secure AI Proxy & Health Service',
      role: 'Serverless Execution Boundary',
      details: 'Protected API handlers insulating API credentials, enforcing prompt structures, and checking AI subsystem availability.',
      icon: Server,
      color: 'text-amber-400'
    },
    {
      title: 'Google Gemini Pro Intelligence',
      role: 'Contextual Academic Reasoning',
      details: 'Structured generative synthesis producing grounded academic retrospectives strictly anchored to provided records.',
      icon: Cpu,
      color: 'text-amber'
    }
  ];

  return (
    <div className="min-h-screen pt-12 pb-32 max-w-5xl mx-auto px-4">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-16"
      >
        <div>
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6 text-xs text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 border border-primary/20 mb-4">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-teal-bright uppercase tracking-widest">
              System Architecture
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black font-heading text-white tracking-tight mb-4">
            How APIS Is Built
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            APIS separates raw academic records from analytical intelligence and AI interpretation. AI is a reasoning layer on top of verifiable data — not the source of truth.
          </p>
        </div>

      {/* SECTION 1: PRODUCT ARCHITECTURE */}
        <section className="space-y-6">
          <div className="border-b border-white/[0.08] pb-3">
            <h2 className="text-xl font-bold text-white tracking-tight">1. Product Flow Architecture</h2>
            <p className="text-sm text-muted-foreground">The end-to-end transformation of raw student records into verified intelligence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {productFlow.map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.step}
                  className="p-5 rounded-2xl border border-white/[0.08] bg-card/60 space-y-3 relative group"
                >
                  <span className="text-[11px] font-black text-primary tracking-widest">{item.step}</span>
                  <div className={`w-9 h-9 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: ENGINEERING STACK & SECURITY */}
        <section className="space-y-6">
          <div className="border-b border-white/[0.08] pb-3">
            <h2 className="text-xl font-bold text-white tracking-tight">2. Engineering & Infrastructure Stack</h2>
            <p className="text-sm text-muted-foreground">Technical isolation and zero-leakage security boundaries.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {engineeringLayers.map((layer) => {
              const Icon = layer.icon;
              return (
                <div 
                  key={layer.title}
                  className="p-6 rounded-2xl border border-white/[0.08] bg-card/60 space-y-2 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
                      <Icon className={`w-5 h-5 ${layer.color}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{layer.title}</h3>
                      <span className="text-[11px] text-primary font-medium">{layer.role}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{layer.details}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: CORE DATA INTEGRITY PRINCIPLES */}
        <section className="p-8 rounded-3xl border border-white/[0.08] bg-card/40 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Data Integrity & Trust Guarantee</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 text-xs text-muted-foreground leading-relaxed">
            <div>
              <strong className="text-white block mb-1">Zero Fabricated Analytics</strong>
              Visualizations and GPA models strictly require genuine user-recorded input. The system will clearly display empty states when records are missing.
            </div>
            <div>
              <strong className="text-white block mb-1">Grounded LLM Prompting</strong>
              AI reflections are strictly bounded by user data payloads. AI models are instructed never to hallucinate grades, GPAs, or attendance values.
            </div>
            <div>
              <strong className="text-white block mb-1">Client-Isolated Data</strong>
              Academic records are bound to authenticated user accounts via Firebase security rules, with zero cross-tenant leakage.
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default Architecture;
