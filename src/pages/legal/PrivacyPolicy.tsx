import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 pb-32 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-8 text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <header className="mb-12">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 border border-primary/30">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground font-medium">Transparent data governance for your academic evolution.</p>
        </header>

        <div className="space-y-12 prose prose-invert max-w-none">
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-primary" /> Data Philosophy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              APIS AI is built on the principle of <strong>Absolute Data Ownership</strong>. Your academic memory is yours alone. We do not sell, rent, or trade your personal data with third parties. Our business model is focused on providing a premium academic tool, not on monetizing user information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Eye className="w-6 h-6 text-secondary" /> What We Collect
            </h2>
            <ul className="space-y-4 text-muted-foreground">
              <li><strong>Academic Data:</strong> Marks, subjects, attendance, and semester details you provide. This data is stored securely in Firebase and cached locally for offline resilience.</li>
              <li><strong>Technical Metadata:</strong> Device type, browser version, and PWA status to ensure a stable experience across platforms.</li>
              <li><strong>Telemetry:</strong> Anonymous performance metrics and interaction events to help us identify UI friction and improve system responsiveness.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <FileText className="w-6 h-6 text-amber-400" /> AI & Synthesis
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              When you use our AI features (like the Neural Synopsis), your anonymized academic data is processed by the Gemini API. We do not use your data to train public AI models. All insights generated are private to your session.
            </p>
          </section>

          <section className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-bold mb-2">Operational Clarity</h3>
            <p className="text-sm text-muted-foreground">
              This policy is governed by our commitment to calm, human-centric engineering. If our data practices ever change, you will be notified directly through the platform.
            </p>
            <p className="text-xs text-muted-foreground mt-6 font-black uppercase tracking-widest">
              Last Updated: May 2026 • Version 1.2.0 (RC)
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
