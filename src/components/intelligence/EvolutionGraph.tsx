import { memo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card } from '../ui/Card';
import type { Semester } from '../../types/academic-v2';
import { TrendingUp, Clock, BookOpen } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

interface Props {
  semesters: Semester[];
}

type ViewMode = 'sgpa' | 'attendance' | 'credits';

export const EvolutionGraph = memo(({ semesters }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>('sgpa');

  // Filter out upcoming/uninitialized semesters, sort by number
  const data = semesters
    .filter(s => s.status === 'completed' || s.status === 'active' || s.status === 'archived')
    .sort((a, b) => a.number - b.number)
    .map(s => ({
      name: s.label || `Sem ${s.number}`,
      sgpa: s.sgpa,
      attendance: s.avgAttendance,
      credits: s.earnedCredits
    }));

  if (data.length < 2) {
    return (
      <Card className="p-6 border-white/[0.08] bg-card/70">
        <div className="mb-4">
          <h3 className="text-base font-bold text-white">Academic History</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Longitudinal trend tracking across completed terms
          </p>
        </div>
        <EmptyState
          icon={TrendingUp}
          title="Not enough semesters for trend visualization"
          description={
            data.length === 1
              ? "You have 1 semester recorded. A longitudinal evolution requires at least 2 completed semesters."
              : "No semester records found. Add your semester marks in Semester Vault to begin tracking trends."
          }
          hint="APIS never fabricates trendlines when data is insufficient."
          compact
        />
      </Card>
    );
  }

  const activeConfig = {
    sgpa: {
      key: 'sgpa',
      name: 'SGPA (0–10 Scale)',
      color: '#1F8176',
      domain: [0, 10] as [number, number],
      unit: '',
    },
    attendance: {
      key: 'attendance',
      name: 'Average Attendance %',
      color: '#10b981',
      domain: [0, 100] as [number, number],
      unit: '%',
    },
    credits: {
      key: 'credits',
      name: 'Credits Earned',
      color: '#39747A',
      domain: [0, 'auto'] as [number, string],
      unit: ' cr',
    },
  }[viewMode];

  return (
    <Card className="p-6 border-white/[0.08] bg-card/70">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Academic History</h3>
            <span className="provenance-tag">
              From {data.length} recorded semesters
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Explore single-metric longitudinal progression
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] self-start sm:self-auto">
          <button
            onClick={() => setViewMode('sgpa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              viewMode === 'sgpa'
                ? 'bg-teal/20 text-teal-bright border border-primary/30'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            SGPA
          </button>
          <button
            onClick={() => setViewMode('attendance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              viewMode === 'attendance'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Attendance
          </button>
          <button
            onClick={() => setViewMode('credits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              viewMode === 'credits'
                ? 'bg-info/20 text-info border border-info/30'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Credits
          </button>
        </div>
      </div>

      <div className="h-[280px] w-full mt-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              domain={activeConfig.domain} 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
              dx={-5}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(23, 32, 31, 0.95)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
              }}
              itemStyle={{ fontWeight: 600, color: activeConfig.color }}
            />
            <Area 
              type="monotone" 
              dataKey={activeConfig.key} 
              name={activeConfig.name}
              stroke={activeConfig.color} 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#metricGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});

EvolutionGraph.displayName = 'EvolutionGraph';
