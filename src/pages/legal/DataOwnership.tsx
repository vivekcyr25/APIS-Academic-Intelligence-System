import { motion } from 'framer-motion';
import { Database, Download, History, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const DataOwnership = () => {
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
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6 border border-amber-500/30">
            <Database className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Data Ownership</h1>
          <p className="text-xl text-muted-foreground font-medium">Your academic history, your property.</p>
        </header>

        <div className="space-y-12 prose prose-invert max-w-none">
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Download className="w-6 h-6 text-primary" /> Right to Export
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We believe that your academic data should never be "locked in" to a single platform. APIS AI provides comprehensive <strong>JSON and PDF export</strong> tools, allowing you to take your entire academic memory with you at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-secondary" /> Offline First, User First
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By utilizing <strong>IndexedDB persistence</strong>, your data exists on your device even when disconnected from our servers. This ensures that you retain access to your intelligence vault regardless of network availability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <History className="w-6 h-6 text-violet-400" /> Continuity & Deletion
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the absolute right to delete your academic profile. Upon request, we will purge all your semesters, subjects, and analytical history from our production databases. Note that local device caches may need to be cleared manually via browser settings.
            </p>
          </section>

          <section className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-bold mb-2">Our Commitment</h3>
            <p className="text-sm text-muted-foreground">
              APIS AI is architected to support you, not exploit you. We treat your academic evolution with the same respect we give our own engineering documentation.
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

export default DataOwnership;
