import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { DOMAIN_CONFIGS, type AcademicDomain, type GradeScale } from '../../types/academic-v2';
import { saveAcademicProfile } from '../../services/academic/semesterService';
import { initializeSemesters } from '../../services/academic/semesterService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { CheckCircle2, ChevronRight, GraduationCap, ChevronLeft, BrainCircuit } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AcademicSetup = ({ onComplete }: { onComplete: () => void }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState<AcademicDomain>('engineering');
  const [programName, setProgramName] = useState('');
  const [totalSemesters, setTotalSemesters] = useState(8);
  const [gradeScale, setGradeScale] = useState<GradeScale>('lpu_10');

  const selectedConfig = DOMAIN_CONFIGS.find(c => c.domain === domain)!;

  const handleDomainSelect = (d: AcademicDomain) => {
    setDomain(d);
    const config = DOMAIN_CONFIGS.find(c => c.domain === d)!;
    setTotalSemesters(config.defaultTotalSemesters);
    setGradeScale(config.defaultGradeScale);
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const profileData = {
        domain,
        institutionName: 'My Institution', // Can be expanded later
        programName: programName || selectedConfig.label,
        totalSemesters,
        currentSemester: 1, // Defaulting to 1 for new setup
        gradeScale,
        creditSystem: selectedConfig.defaultCreditSystem,
        bestOfCA: selectedConfig.evaluationModel === 'lpu',
        onboardingComplete: true
      };
      
      await saveAcademicProfile(user.id, profileData);
      await initializeSemesters(user.id, profileData as any);
      
      onComplete();
    } catch (error) {
      // Handle error gracefully in real app (toast, etc)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-3xl overflow-y-auto">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10 my-8"
      >
        <Card className="p-8 md:p-12 border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          
          {/* Header */}
          <div className="text-center mb-12 relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 neural-glow"
            >
              <BrainCircuit className="w-10 h-10 text-primary" />
            </motion.div>
            <h1 className="text-4xl font-black tracking-tight mb-3">Initialize Intelligence Vault</h1>
            <p className="text-muted-foreground text-lg">Configure your academic operating system.</p>
          </div>

          {/* Progress Bar */}
          <div className="flex justify-center gap-2 mb-12 relative z-10">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  step >= i ? "w-12 bg-primary neural-glow" : "w-4 bg-white/10"
                )}
              />
            ))}
          </div>

          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {/* STEP 1: DOMAIN */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold mb-6 text-center">Select Academic Domain</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DOMAIN_CONFIGS.map((config) => (
                      <motion.div
                        key={config.domain}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDomainSelect(config.domain)}
                        className={cn(
                          "p-6 rounded-2xl cursor-pointer transition-all border",
                          domain === config.domain
                            ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                            : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                        )}
                      >
                        <div className="text-3xl mb-4">{config.icon}</div>
                        <h4 className="font-bold text-lg mb-2">{config.label}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {config.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-10">
                    <Button
                      onClick={() => setStep(2)}
                      className="px-8 h-12 rounded-xl text-md"
                    >
                      Next Phase <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: PROGRAM DETAILS */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h3 className="text-xl font-bold text-center">Configure Structure</h3>
                  
                  <div className="max-w-xl mx-auto space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                        Program Name
                      </label>
                      <input
                        type="text"
                        value={programName}
                        onChange={(e) => setProgramName(e.target.value)}
                        placeholder={`e.g. ${selectedConfig.label}`}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                          Total {selectedConfig.semesterLabel}s
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={totalSemesters}
                          onChange={(e) => setTotalSemesters(parseInt(e.target.value) || 1)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                          Grading System
                        </label>
                        <select
                          value={gradeScale}
                          onChange={(e) => setGradeScale(e.target.value as GradeScale)}
                          className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-white appearance-none"
                        >
                          <option value="lpu_10">LPU 10-Point</option>
                          <option value="vtu_10">Standard 10-Point</option>
                          <option value="gpa_4">US 4.0 GPA</option>
                          <option value="percentage">Percentage</option>
                          <option value="cbse_10">CBSE Grades</option>
                        </select>
                      </div>
                    </div>

                    {selectedConfig.defaultCreditSystem && (
                      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-4 mt-6">
                        <GraduationCap className="w-6 h-6 text-primary shrink-0" />
                        <div>
                          <h4 className="font-bold text-sm text-primary mb-1">Credit Intelligence Enabled</h4>
                          <p className="text-xs text-muted-foreground">
                            APIS will automatically calculate weighted CGPA and identify high-priority credit risks for your {selectedConfig.label} program.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between max-w-xl mx-auto mt-10">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(1)}
                      className="px-6 h-12 rounded-xl text-md"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" /> Back
                    </Button>
                    <Button
                      onClick={handleComplete}
                      isLoading={loading}
                      className="px-8 h-12 rounded-xl text-md neural-glow"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" /> Initialize System
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
