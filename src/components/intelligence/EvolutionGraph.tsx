import { memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import type { Semester } from '../../types/academic-v2';

interface Props {
  semesters: Semester[];
}

export const EvolutionGraph = memo(({ semesters }: Props) => {
  if (semesters.length === 0) return null;

  // Filter out upcoming/uninitialized semesters, sort by number
  const data = semesters
    .filter(s => s.status === 'completed' || s.status === 'active' || s.status === 'archived')
    .sort((a, b) => a.number - b.number)
    .map(s => ({
      name: s.label,
      sgpa: s.sgpa,
      attendance: s.avgAttendance,
      credits: s.earnedCredits
    }));

  return (
    <Card className="p-6 border-white/5 bg-black/40">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black gradient-title">Academic Evolution</h3>
          <p className="text-sm text-muted-foreground mt-1">Longitudinal SGPA & Attendance tracking</p>
        </div>
      </div>

      <div className="h-[300px] w-full mt-4 relative">
        {/* Glow backdrop for the chart */}
        <div className="absolute inset-0 bg-primary/5 blur-[100px] pointer-events-none rounded-full" />
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="sgpaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="attGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              domain={[0, 10]} 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              domain={[0, 100]} 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)'
              }}
              itemStyle={{ fontWeight: 600 }}
            />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="sgpa" 
              name="SGPA"
              stroke="var(--primary)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#sgpaGradient)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)', style: { filter: 'drop-shadow(0 0 10px rgba(139,92,246,0.8))' } }}
            />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="attendance" 
              name="Attendance %"
              stroke="#34d399" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#attGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});
