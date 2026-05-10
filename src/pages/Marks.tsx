import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { subscribeToMarks, addMark, updateMark, deleteMark, type MarkRecord } from '../services/marks/marksService.ts';
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

// ── Syncfusion Grid ──────────────────────────────────────────────────────────
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Sort,
  Search as SfSearch,
  Toolbar,
  ExcelExport,
  PdfExport,
  Page,
  Filter as SfFilter,
  Edit,
} from '@syncfusion/ej2-react-grids';

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

  const gridRef = useRef<GridComponent | null>(null);

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

  const toolbarClick = (args: any) => {
    if (!gridRef.current) return;
    if (args.item.id?.includes('excelexport')) gridRef.current.excelExport();
    if (args.item.id?.includes('pdfexport'))   gridRef.current.pdfExport();
    if (args.item.id?.includes('print'))       gridRef.current.print();
  };

  const handleActionComplete = async (args: any) => {
    if (args.requestType === 'save') {
      const data = args.data as MarkRecord;
      if (data.id) {
        try {
          await updateMark(data.id, {
            ...data,
            ca1: Number(data.ca1),
            ca2: Number(data.ca2),
            mte: Number(data.mte),
            ete: Number(data.ete)
          });
          addToast(`${data.subject} updated successfully!`, 'success');
        } catch (err: any) {
          addToast(err.message || 'Failed to update record', 'error');
        }
      }
    }
  };

  // Custom cell templates for Syncfusion Grid
  const gradeTemplate = (m: MarkRecord) => (
    <span className={cn(
      "inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-xs",
      m.total >= 80 ? "bg-green-400/10 text-green-400" :
      m.total >= 60 ? "bg-amber-400/10 text-amber-400" :
      "bg-rose-400/10 text-rose-400"
    )}>
      {m.grade}
    </span>
  );

  const actionsTemplate = (m: MarkRecord) => (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => {
          // Select the row first then start edit
          const index = gridRef.current?.getRowIndexByPrimaryKey(m.subject);
          if (index !== undefined && index !== -1) {
            gridRef.current?.selectRow(index);
            gridRef.current?.startEdit();
          }
        }}
        className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
      >
        <Edit3 className="w-4 h-4" />
      </button>
      <button
        onClick={async () => {
          if (m.id && user) {
            try {
              await deleteMark(m.id, user.id);
              addToast('Record deleted', 'info');
            } catch { addToast('Failed to delete record', 'error'); }
          }
        }}
        className="p-2 hover:bg-rose-400/10 text-rose-400 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

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

      {/* Main Content — Syncfusion Grid */}
      <Card className="p-0 border-white/5 bg-white/2 backdrop-blur-3xl overflow-hidden">
        <div className="sf-marks-grid-wrapper">
          <GridComponent
            ref={gridRef}
            dataSource={filteredAndSortedMarks}
            allowSorting
            allowFiltering
            allowPaging
            pageSettings={{ pageSize: 10 }}
            toolbar={['Search', 'Edit', 'Update', 'Cancel', 'ExcelExport', 'PdfExport', 'Print']}
            toolbarClick={toolbarClick}
            allowExcelExport
            allowPdfExport
            editSettings={{ allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Normal' }}
            actionComplete={handleActionComplete}
            filterSettings={{ type: 'Menu' }}
            gridLines="Horizontal"
            rowHeight={56}
            cssClass="sf-neural-grid"
            height="auto"
            width="100%"
          >
            <ColumnsDirective>
              <ColumnDirective field="subject"  headerText="Subject" minWidth="140" textAlign="Left"  isPrimaryKey />
              <ColumnDirective field="ca1"      headerText="CA 1"   width="80"   textAlign="Center" editType="numericEdit" />
              <ColumnDirective field="ca2"      headerText="CA 2"   width="80"   textAlign="Center" editType="numericEdit" />
              <ColumnDirective field="mte"      headerText="MTE"    width="80"   textAlign="Center" editType="numericEdit" />
              <ColumnDirective field="ete"      headerText="ETE"    width="80"   textAlign="Center" editType="numericEdit" />
              <ColumnDirective field="total"    headerText="Total"  width="90"   textAlign="Center" allowEditing={false} />
              <ColumnDirective field="grade"    headerText="Grade"  width="90"   textAlign="Center" template={gradeTemplate} allowEditing={false} />
              <ColumnDirective headerText="Actions" width="100" textAlign="Center" template={actionsTemplate} allowSorting={false} allowFiltering={false} />
            </ColumnsDirective>
            <Inject services={[Sort, SfSearch, Toolbar, ExcelExport, PdfExport, Page, SfFilter, Edit]} />
          </GridComponent>
        </div>
      </Card>
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
