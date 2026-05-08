import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { subscribeToMarks, addMark, deleteMark, type MarkRecord } from '../services/marks/marksService.ts';
import { useCountUp } from '../hooks/useCountUp.ts';
import { useToastStore } from '../store/useToastStore.ts';
import { Button } from '../components/ui/Button.tsx';
import { AnalysisModal } from '../components/marks/AnalysisModal.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  FileText, 
  Filter,
  ArrowUpDown,
  Book,
  Sparkles,
  Download,
  Printer
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { exportToCSV, triggerPrint } from '../lib/exportUtils.ts';
import { calculateGPA, getGradeFromTotal } from '../utils/academicUtils.ts';

const Marks = () => {
  const { user } = useAuth();
  const { addToast } = useToastStore();
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof MarkRecord; direction: 'asc' | 'desc' } | null>(null);
  const [showFailingOnly, setShowFailingOnly] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    ca1: '',
    ca2: '',
    mte: '',
    ete: '',
  });

  const liveTotal = Number(formData.ca1) + Number(formData.ca2) + Number(formData.mte) + Number(formData.ete);
  const liveGrade = getGradeFromTotal(liveTotal);

  const predictedETE = formData.ca1 && formData.ca2 && formData.mte 
    ? Math.min(50, Math.round(((Number(formData.ca1) + Number(formData.ca2) + Number(formData.mte)) / 50) * 50 * 1.1))
    : 0;

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToMarks(user.id, (data) => {
      setMarks(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAddMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await addMark(user.id, {
        subject: formData.subject,
        ca1: Number(formData.ca1),
        ca2: Number(formData.ca2),
        mte: Number(formData.mte),
        ete: Number(formData.ete),
      });
      setIsModalOpen(false);
      setFormData({ subject: '', ca1: '', ca2: '', mte: '', ete: '' });
      addToast('Performance record saved successfully!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to save record', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedMarks = Array.from(marks)
    .filter(m => {
      const matchesSearch = m.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFailing = showFailingOnly ? m.total < 40 : true;
      return matchesSearch && matchesFailing;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      if (a[key]! < b[key]!) return direction === 'asc' ? -1 : 1;
      if (a[key]! > b[key]!) return direction === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (key: keyof MarkRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExportCSV = () => {
    const dataToExport = filteredAndSortedMarks.map(m => ({
      Subject: m.subject,
      CA1: m.ca1,
      CA2: m.ca2,
      MTE: m.mte,
      ETE: m.ete,
      Total: m.total,
      Grade: m.grade
    }));
    exportToCSV(dataToExport, `marks_report_${new Date().toLocaleDateString()}`);
    addToast('CSV Exported!', 'success');
  };

  const gpa = calculateGPA(marks);
  const animatedGPA = useCountUp(gpa * 100) / 100;
  const animatedTotal = useCountUp(marks.length);

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-heading tracking-tight mb-2">Marks Core</h1>
          <p className="text-muted-foreground font-medium">Manage and optimize your academic performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsAnalysisOpen(true)} 
            variant="outline" 
            className="rounded-2xl border-primary/20 text-primary hover:bg-primary/5"
            disabled={marks.length === 0}
          >
            <Sparkles className="w-5 h-5 mr-2" /> AI Insights
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="rounded-2xl">
            <Plus className="w-5 h-5 mr-2" /> Record Performance
          </Button>
        </div>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-6 bg-primary/5 border-primary/10">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Book className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Current GPA</p>
            <h3 className="text-3xl font-black font-heading tracking-tight">{animatedGPA.toFixed(2)}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Subjects</p>
            <h3 className="text-3xl font-black font-heading tracking-tight">{animatedTotal}</h3>
          </div>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="p-0 border-white/5 bg-white/2 backdrop-blur-3xl overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search subjects..."
              className="w-full bg-white/5 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setSearchTerm('')}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={showFailingOnly ? "primary" : "ghost"} 
              size="sm" 
              className="rounded-xl"
              onClick={() => setShowFailingOnly(!showFailingOnly)}
            >
              <Filter className="w-4 h-4 mr-2" /> {showFailingOnly ? "Showing Failing" : "Filter Failing"}
            </Button>
            <Button 
              variant={sortConfig ? "primary" : "ghost"} 
              size="sm" 
              className="rounded-xl"
              onClick={() => setSortConfig(null)}
            >
              <ArrowUpDown className="w-4 h-4 mr-2" /> Reset Sort
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl border-white/10 hover:bg-white/5"
              onClick={handleExportCSV}
              disabled={filteredAndSortedMarks.length === 0}
            >
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl border-white/10 hover:bg-white/5"
              onClick={triggerPrint}
            >
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th 
                  className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('subject')}
                >
                  Subject {sortConfig?.key === 'subject' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">CA1</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">CA2</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">MTE</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">ETE</th>
                <th 
                  className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('total')}
                >
                  Total {sortConfig?.key === 'total' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('grade')}
                >
                  Grade {sortConfig?.key === 'grade' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {filteredAndSortedMarks.map((m) => (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-sm">{m.subject}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{m.ca1}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{m.ca2}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{m.mte}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{m.ete}</td>
                    <td className="px-6 py-4 text-sm font-black text-center text-primary">{m.total}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-xs",
                        m.total >= 80 ? "bg-green-400/10 text-green-400" : 
                        m.total >= 60 ? "bg-amber-400/10 text-amber-400" : 
                        "bg-rose-400/10 text-rose-400"
                      )}>
                        {m.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={async () => {
                            if (m.id && user) {
                              try {
                                await deleteMark(m.id, user.id);
                                addToast('Record deleted', 'info');
                              } catch (err: any) {
                                addToast('Failed to delete record', 'error');
                              }
                            }
                          }}
                          className="p-2 hover:bg-rose-400/10 text-rose-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredAndSortedMarks.length === 0 && (
            <div className="p-20 text-center space-y-4 opacity-50">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold">No Records Detected</h3>
              <p className="text-sm max-w-[280px] mx-auto">Start by recording your academic performance data to unlock intelligence features.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Add Mark Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Record Performance"
      >
        <form onSubmit={handleAddMark} className="space-y-6">
          <Input
            label="Subject Title"
            placeholder="e.g. Advanced Calculus"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CA 1 (10)"
              type="number"
              max="10"
              value={formData.ca1}
              onChange={(e) => setFormData({...formData, ca1: e.target.value})}
              required
            />
            <Input
              label="CA 2 (10)"
              type="number"
              max="10"
              value={formData.ca2}
              onChange={(e) => setFormData({...formData, ca2: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="MTE (30)"
              type="number"
              max="30"
              value={formData.mte}
              onChange={(e) => setFormData({...formData, mte: e.target.value})}
              required
            />
            <Input
              label="ETE (50)"
              type="number"
              max="50"
              value={formData.ete}
              onChange={(e) => setFormData({...formData, ete: e.target.value})}
              required
            />
          </div>
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Live Calculation</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">{liveTotal}</span>
                <span className="text-sm font-bold text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Predicted Grade</p>
              <span className={cn(
                "inline-flex items-center justify-center w-12 h-12 rounded-xl font-black text-xl",
                liveTotal >= 40 ? "bg-primary text-white" : "bg-rose-500 text-white"
              )}>
                {liveGrade}
              </span>
            </div>
          </div>

          <Button type="submit" className="w-full h-14" isLoading={loading}>
            Save Record
          </Button>
          
          <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
            Target ETE for A+: {Math.max(0, 80 - (Number(formData.ca1) + Number(formData.ca2) + Number(formData.mte)))}
          </p>
        </form>
      </Modal>

      <AnalysisModal 
        isOpen={isAnalysisOpen} 
        onClose={() => setIsAnalysisOpen(false)} 
        marks={marks} 
      />
    </div>
  );
};

export default Marks;
