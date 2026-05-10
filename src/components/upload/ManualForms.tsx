import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AlertTriangle, CheckCircle2, TrendingUp, Calendar, BookOpen, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { calculateDynamicTotal } from '../../services/marks/marksService.ts';

export type FormType = 'attendance' | 'marks' | 'assignment' | 'timetable';

interface ManualFormsProps {
  type: FormType;
  onDataChange: (data: any) => void;
}

export const ManualForms: React.FC<ManualFormsProps> = ({ type, onDataChange }) => {
  // We manage the local form state, and emit changes upwards to drive the live preview
  
  if (type === 'attendance') return <AttendanceForm onChange={onDataChange} />;
  if (type === 'marks') return <MarksForm onChange={onDataChange} />;
  if (type === 'assignment') return <AssignmentForm onChange={onDataChange} />;
  if (type === 'timetable') return <TimetableForm onChange={onDataChange} />;
  return null;
};

// ---------------------------------------------------------
// ATTENDANCE FORM
// ---------------------------------------------------------
const AttendanceForm = ({ onChange }: { onChange: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    subject: '',
    totalClasses: '',
    attendedClasses: '',
    faculty: ''
  });

  useEffect(() => {
    const totalLectures = parseInt(formData.totalClasses) || 0;
    const attendedLectures = parseInt(formData.attendedClasses) || 0;
    const attendancePercentage = totalLectures > 0 ? parseFloat(((attendedLectures / totalLectures) * 100).toFixed(1)) : 0;
    const shortageRisk: 'low' | 'medium' | 'high' = attendancePercentage < 60 ? 'high' : attendancePercentage < 75 ? 'medium' : 'low';
    
    onChange({
      type: 'attendance',
      subjectName: formData.subject,
      faculty: formData.faculty,
      totalLectures,
      attendedLectures,
      attendancePercentage,
      shortageRisk,
      // Keep these for the live preview panel
      subject: formData.subject,
      percentage: attendancePercentage
    });
  }, [formData]);

  return (
    <div className="space-y-4">
      <Input 
        label="Subject Name" 
        placeholder="e.g. Advanced AI Models" 
        value={formData.subject}
        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input 
          label="Attended Classes" 
          type="number"
          placeholder="e.g. 34" 
          value={formData.attendedClasses}
          onChange={(e) => setFormData(prev => ({ ...prev, attendedClasses: e.target.value }))}
        />
        <Input 
          label="Total Classes" 
          type="number"
          placeholder="e.g. 40" 
          value={formData.totalClasses}
          onChange={(e) => setFormData(prev => ({ ...prev, totalClasses: e.target.value }))}
        />
      </div>
      <Input 
        label="Faculty Name" 
        placeholder="e.g. Dr. Turing" 
        value={formData.faculty}
        onChange={(e) => setFormData(prev => ({ ...prev, faculty: e.target.value }))}
      />
    </div>
  );
};

// ---------------------------------------------------------
// MARKS FORM
// ---------------------------------------------------------
const MarksForm = ({ onChange }: { onChange: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    subject: '',
    code: '',
    subjectType: 'theory',
    faculty: '',
    ca1: '',
    ca2: '',
    assignments: '',
    mte: '',
    ete: '',
    labMarks: '',
    credits: '3'
  });

  useEffect(() => {
    // Elegant inline validation boundaries
    const safeMax = (val: string, max: number) => {
      const num = parseFloat(val);
      if (isNaN(num)) return 0;
      return Math.min(Math.max(num, 0), max);
    };

    const ca1 = safeMax(formData.ca1, 30);
    const ca2 = safeMax(formData.ca2, 30);
    const assignments = safeMax(formData.assignments, 100);
    const mte = safeMax(formData.mte, 40);
    const ete = safeMax(formData.ete, 100);
    const labMarks = safeMax(formData.labMarks, 50);
    const credits = parseFloat(formData.credits) || 3;

    // Use shared engine for identical frontend/backend logic
    const { total, percentage, grade } = calculateDynamicTotal({
      ca1, ca2, assignments, mte, lab: labMarks, ete
    });

    onChange({
      type: 'marks',
      ...formData,
      ca1, ca2, assignments, mte, ete, labMarks,
      credits,
      total,
      percentage,
      grade,
      name: formData.subject,
      code: formData.code,
      subjectType: formData.subjectType,
      faculty: formData.faculty
    });
  }, [formData]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-2">
          <Input 
            label="Subject Name" 
            placeholder="e.g. Data Structures" 
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          />
        </div>
        <Input 
          label="Course Code" 
          placeholder="e.g. CSE201" 
          value={formData.code}
          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
        />
        <Input 
          label="Credits" 
          type="number"
          placeholder="3" 
          value={formData.credits}
          onChange={(e) => setFormData(prev => ({ ...prev, credits: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type</label>
          <select 
            value={formData.subjectType}
            onChange={(e) => setFormData(prev => ({ ...prev, subjectType: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors appearance-none"
          >
            <option value="theory" className="bg-[#1a1a1a] text-white py-2">Theory</option>
            <option value="lab" className="bg-[#1a1a1a] text-white py-2">Lab / Practical</option>
            <option value="project" className="bg-[#1a1a1a] text-white py-2">Project</option>
            <option value="elective" className="bg-[#1a1a1a] text-white py-2">Elective</option>
            <option value="pel" className="bg-[#1a1a1a] text-white py-2">Professional Elective (PEL)</option>
          </select>
        </div>
        <Input 
          label="Faculty Name" 
          placeholder="e.g. Dr. Alan Turing" 
          value={formData.faculty}
          onChange={(e) => setFormData(prev => ({ ...prev, faculty: e.target.value }))}
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Input 
          label="CA 1" type="number" placeholder="/ 30" 
          value={formData.ca1} onChange={(e) => setFormData(prev => ({ ...prev, ca1: e.target.value }))}
        />
        <Input 
          label="CA 2" type="number" placeholder="/ 30" 
          value={formData.ca2} onChange={(e) => setFormData(prev => ({ ...prev, ca2: e.target.value }))}
        />
        <Input 
          label="Assignments" type="number" placeholder="/ 100" 
          value={formData.assignments} onChange={(e) => setFormData(prev => ({ ...prev, assignments: e.target.value }))}
        />
        <Input 
          label="Midterm" type="number" placeholder="/ 40" 
          value={formData.mte} onChange={(e) => setFormData(prev => ({ ...prev, mte: e.target.value }))}
        />
        <Input 
          label="End Term" type="number" placeholder="/ 100" 
          value={formData.ete} onChange={(e) => setFormData(prev => ({ ...prev, ete: e.target.value }))}
        />
        <Input 
          label="Lab Marks" type="number" placeholder="/ 50" 
          value={formData.labMarks} onChange={(e) => setFormData(prev => ({ ...prev, labMarks: e.target.value }))}
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// ASSIGNMENT FORM
// ---------------------------------------------------------
const AssignmentForm = ({ onChange }: { onChange: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    deadline: '',
    status: 'pending' as 'pending' | 'submitted' | 'graded',
    priority: 'medium' as 'low' | 'medium' | 'high',
    marks: 0,
    maxMarks: 100,
    faculty: ''
  });

  useEffect(() => {
    onChange({ type: 'assignment', ...formData });
  }, [formData]);

  return (
    <div className="space-y-4">
      <Input 
        label="Task Title" 
        placeholder="e.g. Final Project Report" 
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input 
          label="Subject" 
          placeholder="e.g. Machine Learning" 
          value={formData.subject}
          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
        />
        <Input 
          label="Deadline" 
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</label>
          <select 
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white appearance-none"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'pending' | 'submitted' | 'graded' }))}
          >
            <option value="pending" className="bg-background text-white">Pending</option>
            <option value="submitted" className="bg-background text-white">Submitted</option>
            <option value="graded" className="bg-background text-white">Graded</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Priority</label>
          <select 
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white appearance-none"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
          >
            <option value="low" className="bg-background text-white">Low</option>
            <option value="medium" className="bg-background text-white">Medium</option>
            <option value="high" className="bg-background text-white">High</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// TIMETABLE FORM
// ---------------------------------------------------------
const TimetableForm = ({ onChange }: { onChange: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    subject: '',
    day: 'Monday',
    time: '',
    room: '',
    faculty: ''
  });

  useEffect(() => {
    onChange({ type: 'timetable', ...formData });
  }, [formData]);

  return (
    <div className="space-y-4">
      <Input 
        label="Subject Name" 
        placeholder="e.g. Operating Systems" 
        value={formData.subject}
        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Day of Week</label>
          <select 
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white appearance-none"
            value={formData.day}
            onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
          >
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
              <option key={d} className="bg-background text-white">{d}</option>
            ))}
          </select>
        </div>
        <Input 
          label="Time (e.g. 10:00 AM)" 
          type="time"
          value={formData.time}
          onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input 
          label="Room / Block" 
          placeholder="e.g. Block 32 - 401" 
          value={formData.room}
          onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
        />
        <Input 
          label="Faculty" 
          placeholder="e.g. Prof. Smith" 
          value={formData.faculty}
          onChange={(e) => setFormData(prev => ({ ...prev, faculty: e.target.value }))}
        />
      </div>
    </div>
  );
};
