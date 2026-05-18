import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BrainCircuit,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Card, StatsCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase/config';
import { cn } from '../lib/utils';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc, 
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    deadline: '',
    priority: 'medium' as AssignmentRecord['priority'],
    faculty: ''
  });

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.id, 'assignment'),
      orderBy('deadline', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AssignmentRecord[];
      setAssignments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'users', user.id, 'assignment'), {
        ...formData,
        userId: user.id,
        status: 'pending',
        deadline: Timestamp.fromDate(new Date(formData.deadline)),
        marks: 0,
        maxMarks: 100
      });
      setIsAddModalOpen(false);
      setFormData({ title: '', subject: '', deadline: '', priority: 'medium', faculty: '' });
      toast.success('Assignment added to queue');
    } catch (err) {
      toast.error('Failed to add assignment');
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    if (!user) return;
    const newStatus = currentStatus === 'pending' ? 'submitted' : 'pending';
    try {
      await updateDoc(doc(db, 'users', user.id, 'assignment', id), {
        status: newStatus
      });
      toast.success(newStatus === 'submitted' ? 'Task completed!' : 'Task reopened');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.id, 'assignment', id));
      toast.success('Task removed');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const pending = assignments.filter(a => a.status === 'pending');
  const critical = pending.filter(a => a.priority === 'high');

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-heading tracking-tight mb-2">Assignment Intelligence</h1>
          <p className="text-muted-foreground font-medium">Priority-ranked task management and deadline vectors</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-2xl h-12 px-6 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Assignment
        </Button>
      </header>

      {/* KPI Overlays */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          label="Total Tasks" 
          value={assignments.length}
          icon={ClipboardList}
          color="primary"
        />
        <StatsCard 
          label="Pending Intelligence" 
          value={pending.length}
          icon={Clock}
          color="warning"
        />
        <StatsCard 
          label="Critical Deadlines" 
          value={critical.length}
          icon={AlertCircle}
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignment List */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search assignments..." 
                  className="bg-transparent border-none outline-none text-sm font-medium w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="rounded-xl border border-white/5">
                  <Filter className="w-3 h-3 mr-2" /> Filter
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {assignments.length > 0 ? assignments.map((assignment) => (
                <div key={assignment.id} className="p-5 rounded-2xl bg-white/3 border border-white/5 group hover:bg-white/5 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-xl flex items-center justify-center shrink-0",
                        assignment.status === 'graded' ? "bg-green-500/10 text-green-400" : "bg-primary/10 text-primary"
                      )}>
                        {assignment.status === 'graded' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg leading-tight mb-1">{assignment.title}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">{assignment.subject}</span>
                          <span className="text-white/10">•</span>
                          <span className="text-xs text-muted-foreground">{assignment.faculty}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Deadline</p>
                        <p className={cn(
                          "text-sm font-bold",
                          assignment.priority === 'high' ? "text-rose-400" : "text-foreground",
                          assignment.status === 'submitted' && "line-through opacity-50"
                        )}>
                          {assignment.deadline?.toDate?.().toLocaleDateString() || 'No Date'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleStatus(assignment.id, assignment.status)}
                          className={cn(
                            "w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                            assignment.status === 'submitted' 
                              ? "bg-green-500 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]" 
                              : "border-white/20 text-white/10 hover:border-primary hover:text-primary hover:bg-primary/10"
                          )}
                          title={assignment.status === 'submitted' ? "Mark as Pending" : "Mark as Complete"}
                        >
                          <CheckCircle2 className="w-5 h-5 text-inherit" />
                        </button>
                        
                        <button 
                          onClick={() => handleDelete(assignment.id)}
                          className="p-2 text-muted-foreground hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto text-muted-foreground">
                    <ClipboardList className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-muted-foreground">Your assignment queue is clear. Use the Upload Center to ingest new tasks.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* AI Priority Matrix */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary text-white rounded-lg neural-glow">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black font-heading tracking-tight">Priority Matrix</h3>
            </div>
            
            <div className="space-y-4">
              {critical.length > 0 ? (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-rose-400">Immediate Action</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    You have <span className="text-white font-bold">{critical.length}</span> assignments due within 48 hours. Focus on <span className="text-white font-bold">{critical[0].title}</span> first to avoid penalty.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-green-400">Optimal State</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    No immediate deadline risks detected. Use this window for advanced preparation or revision.
                  </p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Neural Advice</p>
                <ul className="space-y-3">
                  <li className="text-xs text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Group similar subjects for faster context switching.
                  </li>
                  <li className="text-xs text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Optimal productivity window: 10PM - 12AM.
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Assignment"
      >
        <form onSubmit={handleAddAssignment} className="space-y-4 pt-4">
          <Input 
            label="Title"
            placeholder="e.g., Quantum Mechanics Report"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Subject"
              placeholder="PHY101"
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
              required
            />
            <Input 
              label="Faculty"
              placeholder="Dr. Smith"
              value={formData.faculty}
              onChange={e => setFormData({...formData, faculty: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Deadline"
              type="date"
              value={formData.deadline}
              onChange={e => setFormData({...formData, deadline: e.target.value})}
              required
            />
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Priority</label>
              <select 
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value as any})}
                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-primary/50 transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl mt-4 neural-glow">
            Save Assignment
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Assignments;
