import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { subscribeToMarks, type MarkRecord } from '../services/marks/marksService.ts';
import { Card } from '../components/ui/Card.tsx';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  Zap, 
  Target,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToMarks(user.id, (data) => {
      setMarks(data);
    });
    return () => unsubscribe();
  }, [user]);

  const gradeDist = marks.reduce((acc: any, m) => {
    acc[m.grade] = (acc[m.grade] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(gradeDist).map(([name, value]) => ({ name, value: value as number }));
  
  const COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316'];

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  
  const radarData = [
    { subject: 'CA1', A: (avg(marks.map(m => m.ca1)) / 10) * 100, fullMark: 100 },
    { subject: 'CA2', A: (avg(marks.map(m => m.ca2)) / 10) * 100, fullMark: 100 },
    { subject: 'MTE', A: (avg(marks.map(m => m.mte)) / 30) * 100, fullMark: 100 },
    { subject: 'ETE', A: (avg(marks.map(m => m.ete)) / 50) * 100, fullMark: 100 },
    { subject: 'Total', A: avg(marks.map(m => m.total)), fullMark: 100 },
  ];

  const areaData = marks.map((m) => ({
    name: m.subject.length > 8 ? m.subject.substring(0, 8) + '...' : m.subject,
    ca1: m.ca1,
    ca2: m.ca2,
    mte: m.mte,
    ete: m.ete,
    total: m.total,
  }));

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 md:p-10 space-y-8"
    >
      <header>
        <h1 className="text-3xl font-bold font-heading">Deep Analytics</h1>
        <p className="text-muted-foreground">Multi-dimensional performance visualization</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart */}
        <motion.div variants={item}>
          <Card className="h-[450px]">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold">Skill Radar</h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Performance"
                    dataKey="A"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.2}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d0f14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4 italic">
              * Normalized component performance across all subjects
            </p>
          </Card>
        </motion.div>

        {/* Pie Chart */}
        <motion.div variants={item}>
          <Card className="h-[450px]">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
                <PieIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold">Grade Distribution</h3>
            </div>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d0f14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold">{marks.length}</span>
                <span className="text-[10px] uppercase text-muted-foreground">Total</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-muted-foreground">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Area Chart */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-green-400/10 text-green-400 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold">Trend Analysis</h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorCa1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCa2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d946ef" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMte" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEte" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d0f14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Area stackId="1" type="monotone" dataKey="ca1" stroke="#8b5cf6" fill="url(#colorCa1)" onClick={(data: any) => setSelectedSubject(data.payload)} cursor="pointer" />
                  <Area stackId="1" type="monotone" dataKey="ca2" stroke="#d946ef" fill="url(#colorCa2)" onClick={(data: any) => setSelectedSubject(data.payload)} cursor="pointer" />
                  <Area stackId="1" type="monotone" dataKey="mte" stroke="#3b82f6" fill="url(#colorMte)" onClick={(data: any) => setSelectedSubject(data.payload)} cursor="pointer" />
                  <Area stackId="1" type="monotone" dataKey="ete" stroke="#10b981" fill="url(#colorEte)" onClick={(data: any) => setSelectedSubject(data.payload)} cursor="pointer" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <AnimatePresence>
              {selectedSubject && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-primary">{selectedSubject.name} — Detailed Split</h4>
                    <button onClick={() => setSelectedSubject(null)} className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-white">Close</button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-muted-foreground">CA1</p>
                      <p className="text-xl font-bold">{selectedSubject.ca1}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-muted-foreground">CA2</p>
                      <p className="text-xl font-bold">{selectedSubject.ca2}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-muted-foreground">MTE</p>
                      <p className="text-xl font-bold">{selectedSubject.mte}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-muted-foreground">ETE</p>
                      <p className="text-xl font-bold">{selectedSubject.ete}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Analytics;
