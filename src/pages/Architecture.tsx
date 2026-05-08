import { motion } from 'framer-motion';
import { 
  Cpu, 
  Layers, 
  Workflow, 
  Activity, 
  ArrowLeft,
  Settings,
  Database,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const Architecture = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 pb-32 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-8 text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <header className="mb-16">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 border border-primary/30">
            <Cpu className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Engineering Methodology</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
            APIS AI is built using rigorous engineering practices inspired by structured software lifecycle management and quality-driven iterative refinement.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <section className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-primary/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6 border border-primary/20 group-hover:neural-glow">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-4">Structured Lifecycle</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Our development process follows a phased evolution model inspired by <strong>IEEE software engineering lifecycle</strong> thinking. Every feature undergoes a research, planning, execution, and verification cycle before reaching production.
            </p>
          </section>

          <section className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-secondary/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-6 border border-secondary/20 group-hover:neural-glow">
              <Activity className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-4">Operational Maturity</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We prioritize <strong>Telemetry-Driven Iteration</strong>. By monitoring system health, sync latency, and UI friction in real-time, we can refine the platform based on objective performance data rather than assumptions.
            </p>
          </section>

          <section className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-6 border border-amber-500/20 group-hover:neural-glow">
              <Database className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-4">Offline-First Resilience</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Inspired by <strong>CMMI-style quality management</strong>, we implemented multi-tab IndexedDB persistence and smart recovery paths to ensure your academic memory remains stable under stress or network failure.
            </p>
          </section>

          <section className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-6 border border-violet-500/20 group-hover:neural-glow">
              <ShieldCheck className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold mb-4">Security Hardening</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Utilizing <strong>Firebase App Check</strong> and strict data isolation, we ensure that your academic intelligence vault is protected from unauthorized access while maintaining low-latency synchronization.
            </p>
          </section>
        </div>

        <div className="p-10 rounded-[40px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-center gap-4 mb-6">
            <Workflow className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">The Quality Loop</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-8">
            APIS AI avoids "feature explosion" in favor of <strong>Process-Oriented Refinement</strong>. Every release candidate is audited for hydration consistency, typography overflow, and emotional tone to ensure it meets our production-grade standards.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-black text-white mb-1">99.9%</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Uptime Goal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white mb-1">&lt;200ms</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Sync Latency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white mb-1">60FPS</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Interaction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white mb-1">100%</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Ownership</div>
            </div>
          </div>
        </div>

        <footer className="mt-16 pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-muted-foreground italic">
            "Software engineering is not just about writing code; it is about building resilient systems that quietly serve human needs over time."
          </p>
        </footer>
      </motion.div>
    </div>
  );
};

export default Architecture;
