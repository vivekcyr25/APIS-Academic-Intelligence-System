import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload,
  Loader2, 
  CheckCircle2,
  Brain,
  Camera,
  ShieldCheck,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { umsService } from '../../services/ums/umsService';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase/config';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

interface AcademicEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicEvidenceModal = ({ isOpen, onClose }: AcademicEvidenceModalProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'upload' | 'analyzing' | 'preview' | 'success'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState('Initializing AI Vision...');
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAIExtraction = async () => {
    if (!selectedImage || !user) return;
    setLoading(true);
    setStep('analyzing');
    setError(null);

    try {
      const result = await umsService.extractFromVision(
        selectedImage,
        (msg) => setSyncProgress(msg)
      );
      setPreviewData(result);
      setStep('preview');
    } catch (err: any) {
      setStep('upload');
      setError(err.message || 'AI Vision analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSync = async () => {
    if (!user || !previewData) return;
    setLoading(true);

    try {
      const studentRef = `students/${user.id}`;
      const ingestions = [
        ...(previewData.attendance || []).map((r: any) => addDoc(collection(db, studentRef, 'attendance'), { ...r, source: 'ai_vision_ocr', syncedAt: serverTimestamp() })),
        ...(previewData.assignments || []).map((r: any) => addDoc(collection(db, studentRef, 'assignments'), { ...r, source: 'ai_vision_ocr', syncedAt: serverTimestamp() })),
        ...(previewData.marks || []).map((r: any) => addDoc(collection(db, studentRef, 'marks'), { ...r, source: 'ai_vision_ocr', syncedAt: serverTimestamp() }))
      ];
      await Promise.all(ingestions);
      setStep('success');
    } catch (err: any) {
      setError('Vault commitment failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={cn("relative w-full z-[101] transition-all", step === 'preview' ? "max-w-4xl" : "max-w-md")}
      >
        <Card className="p-8 border-white/10 bg-[#0d0f14]/95 shadow-2xl overflow-hidden">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-black font-heading tracking-tight">Academic Evidence</h2>
            <p className="text-sm text-muted-foreground">AI extraction for institutional intelligence</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div onClick={() => fileInputRef.current?.click()} className={cn("relative cursor-pointer border-2 border-dashed rounded-3xl p-12 flex flex-col items-center gap-4 transition-all", selectedImage ? "border-primary/50 bg-primary/5" : "border-white/10 hover:border-primary/30 hover:bg-white/5")}>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                  {selectedImage ? (
                    <img src={selectedImage} alt="Preview" className="w-full aspect-video object-cover rounded-xl border border-white/10" />
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center"><Upload className="w-8 h-8 text-muted-foreground" /></div>
                      <div className="text-center"><p className="text-sm font-bold">Select UMS Screenshot</p></div>
                    </>
                  )}
                </div>
                {error && <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 text-xs border border-rose-500/20">{error}</div>}
                <Button onClick={startAIExtraction} disabled={!selectedImage || loading} className="w-full h-14 rounded-2xl bg-primary text-white font-black">
                  Extract Intelligence <Sparkles className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            )}

            {step === 'analyzing' && (
              <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 flex flex-col items-center text-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin mb-8" />
                <h3 className="text-xl font-black mb-2">Neural Analysis Active</h3>
                <p className="text-sm text-muted-foreground">{syncProgress}</p>
              </motion.div>
            )}

            {step === 'preview' && (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Attendance Extracted</h4>
                    <div className="space-y-3">
                      {(previewData.attendance || []).map((a: any, i: number) => (
                        <div key={i} className="flex justify-between p-3 rounded-xl bg-white/5"><span className="text-xs font-bold truncate max-w-[150px]">{a.subject}</span><span className="text-xs font-black text-green-400">{a.percentage}%</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Performance Metrics</h4>
                    <div className="space-y-3">
                      {(previewData.marks || []).map((m: any, i: number) => (
                        <div key={i} className="flex justify-between p-3 rounded-xl bg-white/5"><span className="text-xs font-bold">{m.subject}</span><span className="text-xs font-black text-primary">{m.score}/{m.total}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep('upload')} className="flex-1 h-12 rounded-xl">Re-Upload</Button>
                  <Button onClick={handleConfirmSync} isLoading={loading} className="flex-[2] h-12 rounded-xl bg-primary text-white">Save to Vault</Button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 flex flex-col items-center text-center">
                <ShieldCheck className="w-20 h-20 text-green-400 mb-6" />
                <h3 className="text-2xl font-black mb-2">Sync Successful</h3>
                <p className="text-sm text-muted-foreground mb-8">Academic data has been atomically ingested.</p>
                <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-green-500 text-white font-black">Close</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
};
