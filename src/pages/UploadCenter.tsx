import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  ArrowRight,
  RotateCcw,
  Save,
  X,
  Keyboard,
  Cpu,
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Clock,
  BookOpen
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { processAcademicImage } from '../services/ai/aiService';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { ManualForms, type FormType } from '../components/upload/ManualForms';
import { subscribeToSemesters, addSubject, recomputeSemesterStats, getAcademicProfile } from '../services/academic/semesterService';
import type { Semester, AcademicProfile } from '../types/academic-v2';

const UploadCenter = () => {
  const { user } = useAuth();
  
  // Segmented Control State
  const [inputMode, setInputMode] = useState<'ai' | 'manual'>('ai');
  const [type, setType] = useState<FormType>('marks'); // Defaulting to marks for new system
  
  // Semester Data
  const [profile, setProfile] = useState<AcademicProfile | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    getAcademicProfile(user.id).then(p => setProfile(p));
    const unsub = subscribeToSemesters(user.id, (sems) => {
      setSemesters(sems);
      if (sems.length > 0 && !selectedSemesterId) {
        const active = sems.find(s => s.status === 'active');
        setSelectedSemesterId(active ? active.id! : sems[0].id!);
      }
    });
    return () => unsub();
  }, [user]);

  // AI Extraction State
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [extractedData, setExtractedData] = useState<any[] | null>(null);
  const [confidence, setConfidence] = useState(0);
  
  // Manual Input State
  const [manualData, setManualData] = useState<any>(null);

  // Global Sync State
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.includes('pdf')) {
      alert('Please upload an image or PDF file.');
      return;
    }
    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const startAIProcessing = async () => {
    if (!file) return;
    setProcessing(true);
    const steps = [
      'Uploading neural document...',
      'Analyzing academic structure...',
      'Extracting data vectors...',
      'Validating intelligence...'
    ];
    try {
      for (const step of steps) {
        setProcessStep(step);
        await new Promise(r => setTimeout(r, 800));
      }
      const result = await processAcademicImage(file, type);
      setExtractedData(result.structuredData);
      setConfidence(result.confidence);
    } catch (err) {
      alert('AI Processing failed. Please try a clearer image.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async (sourceData: any[], saveSource: 'ai_upload' | 'manual_input') => {
    if (!user || !sourceData || sourceData.length === 0) return;
    if (type === 'marks' && !selectedSemesterId) {
      alert("Please select a semester first.");
      return;
    }
    
    setProcessing(true);
    setProcessStep('Committing to neural vault...');
    
    try {
      if (type === 'marks') {
        const sem = semesters.find(s => s.id === selectedSemesterId);
        for (const record of sourceData) {
          await addSubject(user.id, {
            ...record,
            semesterId: selectedSemesterId,
            semesterNumber: sem?.number || 1,
            userId: user.id,
            source: saveSource
          });
        }
        if (profile) {
          await recomputeSemesterStats(user.id, selectedSemesterId, profile);
        }
      } else {
        const collectionName = type;
        for (const record of sourceData) {
          await addDoc(collection(db, 'users', user.id, collectionName), {
            ...record,
            semesterId: selectedSemesterId, // Link old types to semester too
            userId: user.id,
            timestamp: serverTimestamp(),
            source: saveSource
          });
        }
      }
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (saveSource === 'ai_upload') {
          setExtractedData(null);
          setFile(null);
          setPreview(null);
        } else {
          setManualData(null);
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to sync to database.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-4xl font-black font-heading tracking-tight mb-2">Neural Upload Center</h1>
        <p className="text-muted-foreground font-medium">Ingest academic data into your intelligence ecosystem</p>
      </header>

      {/* Segmented Control */}
      <div className="flex bg-white/5 p-1.5 rounded-2xl w-fit border border-white/10 shadow-lg">
        <button
          onClick={() => setInputMode('ai')}
          className={cn(
            "relative px-6 py-2.5 rounded-xl text-sm font-black transition-colors z-10 flex items-center gap-2",
            inputMode === 'ai' ? "text-white" : "text-muted-foreground hover:text-white"
          )}
        >
          {inputMode === 'ai' && (
            <motion.div layoutId="upload-mode-bg" className="absolute inset-0 bg-primary rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.4)] -z-10" />
          )}
          <Cpu className="w-4 h-4" /> AI Extraction
        </button>
        <button
          onClick={() => setInputMode('manual')}
          className={cn(
            "relative px-6 py-2.5 rounded-xl text-sm font-black transition-colors z-10 flex items-center gap-2",
            inputMode === 'manual' ? "text-white" : "text-muted-foreground hover:text-white"
          )}
        >
          {inputMode === 'manual' && (
            <motion.div layoutId="upload-mode-bg" className="absolute inset-0 bg-primary rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.4)] -z-10" />
          )}
          <Keyboard className="w-4 h-4" /> Manual Input
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Col: Input Zone */}
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden border-primary/20">
            <div className="p-6 border-b border-white/5 bg-primary/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                  {inputMode === 'ai' ? <Upload className="w-5 h-5" /> : <Keyboard className="w-5 h-5" />}
                </div>
                <h3 className="font-black font-heading">Data Source</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['attendance', 'marks', 'assignment', 'timetable'] as FormType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      type === t ? "bg-primary text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {inputMode === 'manual' ? (
                  <motion.div
                    key="manual"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="mb-6 space-y-2">
                      <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Target Semester Vault</label>
                      <select 
                        value={selectedSemesterId}
                        onChange={(e) => setSelectedSemesterId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-white appearance-none"
                      >
                        {semesters.map(s => (
                          <option key={s.id} value={s.id} className="bg-[#1a1a1a] text-white py-2">{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <ManualForms type={type} onDataChange={setManualData} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                      "flex flex-col items-center text-center transition-all duration-300 rounded-2xl border-2 border-dashed p-10",
                      dragActive ? "bg-primary/10 border-primary scale-[0.99]" : "border-white/10",
                      file ? "py-8" : "py-20"
                    )}
                  >
                    {!file ? (
                      <>
                        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h4 className="text-xl font-bold mb-2">Drop academic screenshot here</h4>
                        <p className="text-sm text-muted-foreground mb-8 max-w-xs">
                          Supported: Attendance, CA Marks, Timetables, and PDF Reports
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                          accept="image/*,application/pdf"
                        />
                        <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="rounded-2xl h-12 px-8">
                          Select Neural File
                        </Button>
                      </>
                    ) : (
                      <div className="w-full space-y-6">
                        {preview ? (
                          <div className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            <img src={preview} alt="Preview" className="w-full h-auto" />
                            <button 
                              onClick={() => { setFile(null); setPreview(null); }}
                              className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-rose-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="p-10 bg-white/5 rounded-2xl flex items-center gap-4">
                            <FileText className="w-10 h-10 text-primary" />
                            <div className="text-left">
                              <p className="font-bold">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                        )}

                        {!extractedData && (
                          <Button 
                            onClick={startAIProcessing} 
                            isLoading={processing}
                            className="w-full h-14 rounded-2xl text-lg font-black group"
                          >
                            {processing ? processStep : (
                              <>
                                Initialize AI Extraction <Sparkles className="ml-2 w-5 h-5 transition-transform group-hover:rotate-12" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>

        {/* Right Col: Live Preview & Results Zone */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {inputMode === 'manual' && manualData ? (
              // MANUAL LIVE PREVIEW
              <motion.div
                key="manual-preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <Card className="border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/20 text-primary rounded-lg">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black">Live Neural Projections</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                        Real-time Analytics
                      </p>
                    </div>
                  </div>

                  {/* Attendance Preview */}
                  {type === 'attendance' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                        <span className="font-bold">Calculated Attendance</span>
                        <span className={cn(
                          "text-2xl font-black",
                          manualData.percentage < 75 ? "text-rose-400" : "text-green-400"
                        )}>
                          {manualData.percentage || 0}%
                        </span>
                      </div>
                      {manualData.percentage > 0 && manualData.percentage < 75 && (
                        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                          <AlertTriangle className="w-5 h-5 text-rose-400" />
                          <p className="text-xs text-rose-200">Critical: Attendance shortage detected. Immediate action required.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Marks Preview */}
                  {type === 'marks' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-black">Total Score</p>
                          <p className="text-3xl font-black text-primary">{manualData.total || 0}</p>
                        </div>
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-black">Projected Grade</p>
                          <p className={cn(
                            "text-3xl font-black",
                            ['O', 'A+', 'A'].includes(manualData.grade) ? "text-green-400" :
                            ['B', 'C'].includes(manualData.grade) ? "text-amber-400" : "text-rose-400"
                          )}>{manualData.grade || 'F'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <p className="text-xs text-muted-foreground">Adding this result will dynamically update your global GPA trend.</p>
                      </div>
                    </div>
                  )}

                  {/* Assignments Preview */}
                  {type === 'assignment' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                         <div className="flex justify-between items-center">
                           <div className="flex items-center gap-2">
                             <BookOpen className="w-4 h-4 text-primary" />
                             <span className="font-bold text-sm truncate w-40">{manualData.title || 'Untitled Task'}</span>
                           </div>
                           <span className={cn(
                             "text-[10px] px-2 py-1 rounded-full font-black uppercase",
                             manualData.priority === 'Critical' ? "bg-rose-500/20 text-rose-400" :
                             manualData.priority === 'High' ? "bg-amber-500/20 text-amber-400" :
                             "bg-primary/20 text-primary"
                           )}>{manualData.priority}</span>
                         </div>
                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
                           <Clock className="w-3.5 h-3.5" />
                           {manualData.deadline ? new Date(manualData.deadline).toLocaleDateString() : 'No deadline set'}
                         </div>
                      </div>
                    </div>
                  )}

                  {/* Timetable Preview */}
                  {type === 'timetable' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex gap-4 items-center">
                         <div className="p-3 bg-primary/20 rounded-xl text-primary text-center min-w-[60px]">
                           <span className="block text-xs font-black uppercase tracking-wider">{manualData.day?.substring(0,3) || 'DAY'}</span>
                           <span className="block text-lg font-black">{manualData.time?.split(':')[0] || '00'}</span>
                         </div>
                         <div>
                           <p className="font-bold">{manualData.subject || 'Subject'}</p>
                           <p className="text-xs text-muted-foreground">{manualData.room || 'Room'} • {manualData.faculty || 'Faculty'}</p>
                         </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-8">
                    <Button 
                      onClick={() => handleSave([manualData], 'manual_input')} 
                      isLoading={processing}
                      disabled={!manualData || (!manualData.subject && !manualData.subjectName && !manualData.title)}
                      className="w-full h-14 rounded-2xl font-black bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                    >
                      {success ? (
                        <><CheckCircle2 className="w-5 h-5 mr-2" /> Synced Successfully!</>
                      ) : (
                        <><Save className="w-5 h-5 mr-2" /> Sync to Dashboard Engine</>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : inputMode === 'ai' && extractedData ? (
              // AI EXTRACTION RESULTS PREVIEW
              <motion.div
                key="ai-results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <Card className="border-green-500/20 bg-green-500/5">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 text-green-400 rounded-lg">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black font-heading">AI Verification Required</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                          Extraction Confidence: <span className={cn(confidence > 80 ? "text-green-400" : "text-amber-400")}>{confidence}%</span>
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setExtractedData(null)} className="rounded-xl">
                      <RotateCcw className="w-4 h-4 mr-2" /> Retry
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {extractedData.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/5 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Subject</label>
                          <input 
                            className="w-full bg-transparent font-bold text-sm outline-none focus:text-primary transition-colors"
                            value={item.subjectName || item.subject}
                            onChange={(e) => {
                              const newData = [...extractedData];
                              newData[idx].subjectName = e.target.value;
                              setExtractedData(newData);
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                            {type === 'attendance' ? 'Percentage' : 'Marks'}
                          </label>
                          <input 
                            type="number"
                            className="w-full bg-transparent font-bold text-sm outline-none focus:text-primary transition-colors"
                            value={item.attendancePercentage || item.marks || item.total}
                            onChange={(e) => {
                              const newData = [...extractedData];
                              if (type === 'attendance') newData[idx].attendancePercentage = parseFloat(e.target.value);
                              else newData[idx].marks = parseFloat(e.target.value);
                              setExtractedData(newData);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-col gap-3">
                    <Button 
                      onClick={() => handleSave(extractedData, 'ai_upload')} 
                      isLoading={processing}
                      className="w-full h-14 rounded-2xl font-black bg-green-500 hover:bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                    >
                      {success ? (
                        <><CheckCircle2 className="w-5 h-5 mr-2" /> Sync Complete!</>
                      ) : (
                        <><Save className="w-5 h-5 mr-2" /> Confirm & Sync to Dashboard</>
                      )}
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground px-4">
                      By confirming, you verify that this data is accurate as per your official academic record.
                    </p>
                  </div>
                </Card>
              </motion.div>
            ) : (
              // EMPTY STATE
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 border-dashed border-white/10 bg-transparent">
                  <div className="p-4 bg-white/5 rounded-full mb-6">
                    <Sparkles className="w-8 h-8 text-primary/40" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Awaiting Intelligence Input...</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {inputMode === 'ai' 
                      ? "Upload a file and initialize AI to see structured academic data here."
                      : "Start typing in the manual forms to see live neural projections and validation."}
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UploadCenter;
