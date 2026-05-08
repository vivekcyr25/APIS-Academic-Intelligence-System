import { useState } from 'react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { getPerformanceAnalysis } from '../../services/ai/aiService.ts';
import { Sparkles, BrainCircuit, RefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  marks: any[];
}

export const AnalysisModal = ({ isOpen, onClose, marks }: AnalysisModalProps) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const result = await getPerformanceAnalysis(marks);
      setAnalysis(result);
    } catch (err) {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Intelligence Report"
    >
      <div className="space-y-6">
        {!analysis && !loading && (
          <div className="py-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
              <BrainCircuit className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black font-heading">Ready for Deep Analysis?</h3>
              <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                APIS will analyze your performance across all subjects to generate a strategic improvement roadmap.
              </p>
            </div>
            <Button onClick={generateAnalysis} className="w-full h-14 rounded-2xl gap-2">
              <Sparkles className="w-5 h-5" /> Initialize AI Analysis
            </Button>
          </div>
        )}

        {loading && (
          <div className="py-20 text-center space-y-6 animate-pulse">
            <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest text-primary">Scanning Performance Matrix...</p>
          </div>
        )}

        {analysis && !loading && (
          <div className="space-y-6">
            <div className="prose prose-invert prose-sm max-w-none bg-white/5 p-6 rounded-2xl border border-white/5 max-h-[400px] overflow-y-auto">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
            <Button 
              variant="outline" 
              onClick={generateAnalysis} 
              className="w-full gap-2 border-white/10 hover:bg-white/5"
            >
              <RefreshCcw className="w-4 h-4" /> Re-analyze Data
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
