import { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { Card, StatsCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/SkeletonLoader';
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
  deleteDoc,
} from 'firebase/firestore';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';
import type { AssignmentRecord } from '../types/academic';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    deadline: '',
    priority: 'medium' as AssignmentRecord['priority'],
    faculty: '',
  });

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const q = query(collection(db, 'users', user.id, 'assignment'), orderBy('deadline', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as AssignmentRecord[];
        setAssignments(data);
        setLoading(false);
      },
      () => {
        setError('Could not load assignments. Check your connection and try again.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'users', user.id, 'assignment'), {
        ...formData,
        userId: user.id,
        status: 'pending',
        deadline: Timestamp.fromDate(new Date(formData.deadline)),
        marks: 0,
        maxMarks: 100,
      });
      setIsAddModalOpen(false);
      setFormData({ title: '', subject: '', deadline: '', priority: 'medium', faculty: '' });
      toast.success('Assignment added');
    } catch {
      toast.error('Failed to add assignment');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    if (!user) return;
    const newStatus = currentStatus === 'pending' ? 'submitted' : 'pending';
    try {
      await updateDoc(doc(db, 'users', user.id, 'assignment', id), {
        status: newStatus,
      });
      toast.success(newStatus === 'submitted' ? 'Marked complete' : 'Reopened');
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.id, 'assignment', id));
      toast.success('Assignment removed');
    } catch {
      toast.error('Delete failed');
    }
  };

  const pending = assignments.filter((a) => a.status === 'pending');
  const critical = pending.filter((a) => a.priority === 'high');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assignments;
    return assignments.filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        a.subject?.toLowerCase().includes(q) ||
        a.faculty?.toLowerCase().includes(q)
    );
  }, [assignments, search]);

  const hasData = assignments.length > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Tasks"
        title="Assignments"
        description="Deadlines and priorities from your records — add manually or import via Upload."
        actions={
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" aria-hidden /> Add assignment
          </Button>
        }
      />

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="Total tasks"
          value={assignments.length}
          icon={ClipboardList}
          color="primary"
          loading={loading}
        />
        <StatsCard
          label="Pending"
          value={pending.length}
          icon={Clock}
          color="warning"
          loading={loading}
        />
        <StatsCard
          label="High priority"
          value={critical.length}
          icon={AlertCircle}
          color={critical.length > 0 ? 'danger' : 'success'}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
              <label htmlFor="assignment-search" className="sr-only">
                Search assignments
              </label>
              <input
                id="assignment-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, subject, or faculty…"
                className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground/60"
              />
            </div>

            {loading ? (
              <div className="space-y-3" aria-busy="true" aria-label="Loading assignments">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            ) : !hasData ? (
              <EmptyState
                icon={ClipboardList}
                title="No assignments yet"
                description="Add a task manually, or upload an assignment list. Deadlines and priority will show here once data exists."
                action={
                  <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" aria-hidden /> Add your first assignment
                  </Button>
                }
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                compact
                icon={Search}
                title="No matching assignments"
                description={`Nothing matches “${search}”. Try a different title or subject.`}
                action={
                  <Button variant="ghost" onClick={() => setSearch('')}>
                    Clear search
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-3">
                {filtered.map((assignment) => (
                  <li
                    key={assignment.id}
                    className="p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border/50"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div
                          className={cn(
                            'p-2.5 rounded-xl flex items-center justify-center shrink-0',
                            assignment.status === 'graded' || assignment.status === 'submitted'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-primary/10 text-primary'
                          )}
                          aria-hidden
                        >
                          {assignment.status === 'submitted' || assignment.status === 'graded' ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold leading-snug mb-1 truncate">
                            {assignment.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            <span className="text-primary font-medium">{assignment.subject}</span>
                            {assignment.faculty ? ` · ${assignment.faculty}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="text-right">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                            Deadline
                          </p>
                          <p
                            className={cn(
                              'text-sm font-semibold',
                              assignment.priority === 'high' && 'text-rose-400',
                              assignment.status === 'submitted' && 'line-through opacity-50'
                            )}
                          >
                            {assignment.deadline?.toDate?.().toLocaleDateString() || 'No date'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleStatus(assignment.id, assignment.status)}
                          aria-label={
                            assignment.status === 'submitted'
                              ? 'Mark as pending'
                              : 'Mark as complete'
                          }
                          className={cn(
                            'w-9 h-9 rounded-full border-2 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                            assignment.status === 'submitted'
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                          )}
                        >
                          <CheckCircle2 className="w-4 h-4" aria-hidden />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(assignment.id)}
                          aria-label={`Delete ${assignment.title}`}
                          className="p-2 text-muted-foreground hover:text-rose-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Focus</h2>
            {loading ? (
              <Skeleton className="h-24 w-full rounded-2xl" />
            ) : critical.length > 0 ? (
              <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2">
                  High priority
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {critical.length} high-priority task{critical.length === 1 ? '' : 's'} pending.
                  Start with <span className="text-foreground font-medium">{critical[0].title}</span>.
                </p>
              </div>
            ) : hasData ? (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                  No high-priority backlog
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Nothing marked high priority. Use pending items for steady progress.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Priority guidance appears after you add or upload assignments.
              </p>
            )}
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add assignment"
      >
        <form onSubmit={handleAddAssignment} className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Lab report"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Subject"
              placeholder="PHY101"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
            <Input
              label="Faculty"
              placeholder="Optional"
              value={formData.faculty}
              onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
            />
            <div className="space-y-2">
              <label
                htmlFor="assignment-priority"
                className="block text-sm font-semibold text-muted-foreground ml-1"
              >
                Priority
              </label>
              <select
                id="assignment-priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as AssignmentRecord['priority'],
                  })
                }
                className="w-full h-12 bg-muted/40 border border-border/80 rounded-2xl px-4 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <Button type="submit" className="w-full h-12 mt-2" isLoading={saving}>
            Save assignment
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Assignments;
