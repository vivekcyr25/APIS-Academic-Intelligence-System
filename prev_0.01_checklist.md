# Premium UI v0.01 Implementation Checklist

This document contains the checklist and code references for the UI/UX improvements demonstrated in the `PremiumPreview.tsx` component. We will use this to systematically apply these changes to the entire application in the future.

## 1. Dynamic Lighting & Textures
- [ ] Add the Noise Texture SVG overlay to the main `AppLayout` or `global.css` background.
- [ ] Implement the `mousePos` radial gradient tracking for the `.neural-glow` effect across all dashboard views.
- [ ] Ensure `pointer-events-none` is on all overlay layers so they don't block clicks.

## 2. Framer Motion Interactions
- [ ] Refactor main page containers to use `staggerChildren` (e.g., delay of 0.1s between cards loading).
- [ ] Apply the `spring` transition physics (`stiffness: 300, damping: 24`) to all card mount animations.
- [ ] Replace standard hover effects on primary buttons with the `group-hover:scale-110` icon pop and subtle box-shadow glows.

## 3. Typography & Styling
- [ ] Replace standard fonts on Data Metrics (numbers, percentages, GPAs) with `JetBrains Mono`.
- [ ] Update all major headings (`h1`, `h2`) to use `Space Grotesk` with `tracking-tight`.
- [ ] Use `backdrop-blur-xl` combined with semi-transparent background colors (e.g., `bg-[rgba(17,25,40,0.6)]`) for glass panels instead of opaque dark backgrounds.

## 4. Recharts & Data Visualization
- [ ] Inject `<defs>` with `<linearGradient>` into all AreaCharts.
- [ ] Configure `Tooltip` components to use `rgba(17,25,40,0.85)` with a `blur(12px)` backdrop filter instead of solid colors.
- [ ] Remove `axisLine` and `tickLine` from Recharts XAxis/YAxis for a cleaner look.

## 5. Premium Empty States
- [ ] Replace empty table/data views with centered `<Inbox />` or `<Ghost />` icons, surrounded by dashed borders and low-opacity helper text.

---

## Backup: `PremiumPreview.tsx` Source Code (v0.01)

```tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, TrendingUp, BookOpen, Inbox } from 'lucide-react';

const mockData = [
  { name: 'Week 1', score: 65 },
  { name: 'Week 2', score: 72 },
  { name: 'Week 3', score: 68 },
  { name: 'Week 4', score: 85 },
  { name: 'Week 5', score: 82 },
  { name: 'Week 6', score: 90 },
];

export default function PremiumPreview() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative min-h-screen bg-[#0B1120] text-[#F8FAFC] overflow-hidden p-6 md:p-12 font-sans isolate flex flex-col pt-24">
      {/* Dynamic Glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 255, 0.06), transparent 40%)`
        }}
      />
      
      {/* Noise Texture Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-7xl mx-auto space-y-8"
      >
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00E5FF] to-[#7C3AED]">Premium</span> Preview
            </h1>
            <p className="text-[#F8FAFC]/60 mt-2 font-medium">UI/UX Concept Implementation Showcase</p>
          </div>
          <button className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 group shadow-lg hover:shadow-[0_0_20px_rgba(0,229,255,0.2)]">
            <Sparkles className="w-4 h-4 text-[#00E5FF] group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sm">Analyze Focus</span>
          </button>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="relative group overflow-hidden rounded-3xl border border-white/10 bg-[rgba(17,25,40,0.6)] backdrop-blur-xl p-6 shadow-2xl hover:shadow-[0_0_40px_rgba(0,229,255,0.15)] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-white/50 uppercase tracking-widest text-[10px]">Current GPA</p>
                <p className="text-5xl font-bold mt-2 tracking-tighter" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  9.<span className="text-white/40 text-4xl">42</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00E5FF]/20 to-transparent flex items-center justify-center border border-[#00E5FF]/30">
                <TrendingUp className="text-[#00E5FF] w-6 h-6" />
              </div>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-[#22C55E]">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#22C55E]/20">+</span>
              0.15 from last semester
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative group overflow-hidden rounded-3xl border border-white/10 bg-[rgba(17,25,40,0.6)] backdrop-blur-xl p-6 shadow-2xl hover:shadow-[0_0_40px_rgba(124,58,237,0.15)] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-white/50 uppercase tracking-widest text-[10px]">Attendance</p>
                <p className="text-5xl font-bold mt-2 tracking-tighter" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  88<span className="text-white/40 text-4xl">%</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-transparent flex items-center justify-center border border-[#7C3AED]/30">
                <BookOpen className="text-[#7C3AED] w-6 h-6" />
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-1.5">
               <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#7C3AED] h-full rounded-full" style={{ width: '88%' }} />
               </div>
               <span className="text-xs font-semibold text-white/40">On track</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative rounded-3xl border border-dashed border-white/10 bg-[rgba(17,25,40,0.3)] backdrop-blur-md p-6 flex flex-col items-center justify-center text-center group transition-colors hover:border-white/30">
            <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white/60 transition-colors">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No Assignments Due</h3>
            <p className="text-xs text-white/40 mt-2 max-w-[200px]">You are all caught up for this week. Enjoy your free time!</p>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="rounded-3xl border border-white/10 bg-[rgba(17,25,40,0.6)] backdrop-blur-xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Performance Trend</h2>
            <div className="text-xs font-semibold px-3 py-1 bg-white/5 rounded-full border border-white/10">Last 6 Weeks</div>
          </div>
          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17,25,40,0.85)', 
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8)',
                    fontFamily: "'Space Grotesk', sans-serif",
                    backdropFilter: 'blur(12px)'
                  }} 
                  itemStyle={{ color: '#00E5FF', fontWeight: 'bold' }}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="score" stroke="#00E5FF" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
```
