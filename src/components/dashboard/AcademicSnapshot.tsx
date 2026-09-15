import { memo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, BookOpen, Clock, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

interface AcademicSnapshotProps {
  cgpa?: number | null;
  sgpa?: number | null;
  attendancePercentage?: number | null;
  creditsEarned?: number | null;
  totalCredits?: number | null;
  marksCount?: number;
  attendanceCount?: number;
  semestersCount?: number;
}

export const AcademicSnapshot = memo(({
  cgpa,
  sgpa,
  attendancePercentage,
  creditsEarned,
  totalCredits,
  marksCount = 0,
  attendanceCount = 0,
  semestersCount = 0,
}: AcademicSnapshotProps) => {
  const navigate = useNavigate();

  const metrics = [
    {
      id: 'cgpa',
      label: 'Cumulative CGPA',
      value: cgpa !== null && cgpa !== undefined && cgpa > 0 ? cgpa.toFixed(2) : null,
      emptyLabel: 'Awaiting semester data',
      provenance: semestersCount > 0 ? `Across ${semestersCount} semester${semestersCount > 1 ? 's' : ''}` : 'Requires completed semesters',
      icon: Trophy,
      color: 'text-primary',
      bg: 'bg-teal/10',
      border: 'border-primary/20',
      status: cgpa && cgpa >= 8 ? 'Strong' : cgpa && cgpa >= 6 ? 'Steady' : null,
    },
    {
      id: 'sgpa',
      label: 'Current SGPA / Marks',
      value: sgpa !== null && sgpa !== undefined && sgpa > 0 ? sgpa.toFixed(2) : null,
      emptyLabel: 'No marks logged',
      provenance: marksCount > 0 ? `From ${marksCount} course evaluation${marksCount > 1 ? 's' : ''}` : 'Add marks in Semester Vault',
      icon: Target,
      color: 'text-info',
      bg: 'bg-info/10',
      border: 'border-info/20',
      status: sgpa && sgpa >= 8 ? 'Optimal' : sgpa && sgpa >= 6 ? 'Good' : null,
    },
    {
      id: 'attendance',
      label: 'Average Attendance',
      value: attendancePercentage !== null && attendancePercentage !== undefined && attendanceCount > 0 ? `${attendancePercentage.toFixed(1)}%` : null,
      emptyLabel: 'No attendance logs',
      provenance: attendanceCount > 0 ? `Derived from ${attendanceCount} subject record${attendanceCount > 1 ? 's' : ''}` : 'Track in Attendance Vault',
      icon: Clock,
      color: attendancePercentage && attendancePercentage < 75 ? 'text-amber-400' : 'text-emerald-400',
      bg: attendancePercentage && attendancePercentage < 75 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
      border: attendancePercentage && attendancePercentage < 75 ? 'border-amber-500/20' : 'border-emerald-500/20',
      status: attendancePercentage && attendancePercentage < 75 ? 'Below 75% Threshold' : attendancePercentage ? 'Above Threshold' : null,
    },
    {
      id: 'credits',
      label: 'Credits Earned',
      value: creditsEarned !== null && creditsEarned !== undefined && creditsEarned > 0 ? `${creditsEarned}${totalCredits ? ` / ${totalCredits}` : ''}` : null,
      emptyLabel: 'No credits recorded',
      provenance: creditsEarned && creditsEarned > 0 ? 'From verified subjects' : 'Calculated from completed courses',
      icon: BookOpen,
      color: 'text-amber',
      bg: 'bg-amber/10',
      border: 'border-amber/20',
      status: creditsEarned && totalCredits ? `${Math.round((creditsEarned / totalCredits) * 100)}% Completed` : null,
    },
  ];

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div>
          <span className="font-condensed-heading text-xs font-bold text-primary tracking-widest block mb-1">
            REALTIME REGISTRY
          </span>
          <h2 className="font-condensed-heading text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            ACADEMIC SNAPSHOT
          </h2>
        </div>
        <p className="font-condensed text-sm sm:text-base text-muted-foreground tracking-wide">
          Verified indicators computed strictly from your records.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const hasValue = metric.value !== null;

          return (
            <div
              key={metric.id}
              className={`p-6 rounded-2xl border transition-all duration-300 ${
                hasValue
                  ? 'bg-card/75 border-white/[0.08] hover:border-white/20'
                  : 'metric-empty'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl ${metric.bg} border ${metric.border} flex items-center justify-center`}
                  aria-hidden="true"
                >
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                {metric.status && (
                  <span className="font-condensed text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/70 uppercase tracking-wider">
                    {metric.status}
                  </span>
                )}
              </div>

              <div>
                <p className="font-condensed text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {metric.label}
                </p>
                <div className="mt-2 min-h-[3rem] flex items-baseline">
                  {hasValue ? (
                    <span className="font-condensed text-4xl font-black tracking-tight text-white">
                      {metric.value}
                    </span>
                  ) : (
                    <span className="font-condensed text-sm font-medium text-white/30 italic">
                      {metric.emptyLabel}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                <span className="font-condensed text-xs text-white/50 flex items-center gap-1.5 font-medium tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-bright/40" />
                  {metric.provenance}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

AcademicSnapshot.displayName = 'AcademicSnapshot';
