import { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Brain, 
  BarChart2, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2
} from 'lucide-react';

const steps = [
  {
    number: '01',
    phase: 'DATA INGESTION & NORMALIZATION',
    icon: Database,
    title: 'COLLECT & UNIFY ACADEMIC RECORDS',
    subtitle: 'Consolidating fragmented marks, attendance registers, and semester transcripts',
    description:
      'APIS ingests your continuous assessment (CA1, CA2), Mid-Term (MTE), and End-Term (ETE) marks alongside lecture attendance logs and syllabus structures. Instead of isolated spreadsheets or portals, every academic record is unified into a normalized personal vault.',
    keyInsights: [
      'Course Evaluation Splits (CA, MTE, ETE, Lab, Attendance)',
      'Real-Time Lecture Attendance Registry & Shortage Limits',
      'Accredited Credit Weights per Subject (Theory vs Lab vs Electives)',
    ],
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    tagBg: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    accentGrad: 'from-violet-500/15 via-transparent to-transparent'
  },
  {
    number: '02',
    phase: 'LONGITUDINAL PERSISTENCE',
    icon: Brain,
    title: 'BUILD LONGITUDINAL ACADEMIC MEMORY',
    subtitle: 'Connecting completed terms into a continuous longitudinal history',
    description:
      'Individual terms usually get forgotten once grades are released. APIS stitches every completed semester into persistent Academic Memory — calculating term-over-term SGPA deltas, cumulative credit velocity, and multi-term performance consistency vectors.',
    keyInsights: [
      'Term-over-Term SGPA & Attendance Progression Deltas',
      'Persistent Historical Memory & Cumulative CGPA Weighting',
      'Consistency & Stability Index (0–100 Rating)',
    ],
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    tagBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    accentGrad: 'from-indigo-500/15 via-transparent to-transparent'
  },
  {
    number: '03',
    phase: 'DETERMINISTIC PATTERN ANALYSIS',
    icon: BarChart2,
    title: 'DETECT HIDDEN PATTERNS & RISKS',
    subtitle: 'Algorithmic identification of grade velocity, credit exposure, and attendance drops',
    description:
      'The engine automatically detects academic vulnerabilities: high-credit subjects with lagging internal marks, attendance nearing the 75% mandatory threshold, and subject-type discrepancies (such as consistent drops in programming-heavy or math-heavy subjects).',
    keyInsights: [
      'Credit Density Exposure (High-credit subjects at risk)',
      'Mandatory 75% Attendance Shortage Early-Warning Warnings',
      'Subject Category Clustering (Weakness identification)',
    ],
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    tagBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    accentGrad: 'from-blue-500/15 via-transparent to-transparent'
  },
  {
    number: '04',
    phase: 'CONTEXTUAL REASONING LAYER',
    icon: Sparkles,
    title: 'AI CONTEXT INTERPRETATION',
    subtitle: 'Grounded Large Language Models explaining patterns without hallucination',
    description:
      'AI acts strictly as an analytical layer over your verified records. It reasons through detected trends in plain language — explaining what caused performance shifts, how workload pressure is trending, and what specific factors require attention before finals.',
    keyInsights: [
      'Objective Plain-Language Retrospective Summaries',
      'Workload Pressure Analysis (Balanced vs High-Concentration)',
      'Zero Fabricated Metrics — 100% Grounded in User Data',
    ],
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    tagBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    accentGrad: 'from-purple-500/15 via-transparent to-transparent'
  },
  {
    number: '05',
    phase: 'STRATEGIC EXECUTION & ROADMAP',
    icon: ArrowRight,
    title: 'ACTIONABLE ACADEMIC RECOMMENDATIONS',
    subtitle: 'Mathematical exam score targets, study schedules, and priority roadmaps',
    description:
      'Turn insights into immediate results. APIS calculates the exact End-Term Exam (ETE) scores needed in each subject to achieve your target letter grades (A+, O) and provides prioritized revision timelines to optimize your cumulative standing.',
    keyInsights: [
      'Target ETE Score Calculators for Desired Grade Boundaries',
      'Tailored Study Priority Timelines based on Credit Impact',
      'Proactive Risk Mitigation before Examination Deadlines',
    ],
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/20',
    tagBg: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
    accentGrad: 'from-fuchsia-500/20 via-transparent to-transparent'
  },
];

// Silky smooth luxury easing (Apple/Linear signature ease)
const LUXURY_EASE = [0.22, 1, 0.36, 1];

// Card container animation variant
const cardVariants = {
  hidden: { 
    opacity: 0, 
    scaleY: 0.94,
    y: 22,
  },
  visible: { 
    opacity: 1, 
    scaleY: 1,
    y: 0,
    transition: { 
      duration: 0.65, 
      ease: LUXURY_EASE,
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

// Smooth elongated text stretch reveal variants
const textStretchVariant = {
  hidden: { 
    opacity: 0, 
    scaleY: 0.88, 
    y: 12,
  },
  visible: { 
    opacity: 1, 
    scaleY: 1, 
    y: 0,
    transition: { 
      duration: 0.55, 
      ease: LUXURY_EASE 
    }
  }
};

const numberStretchVariant = {
  hidden: { 
    opacity: 0, 
    scaleY: 0.75, 
    scaleX: 1.15,
    y: 15,
  },
  visible: { 
    opacity: 1, 
    scaleY: 1, 
    scaleX: 1,
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: LUXURY_EASE 
    }
  }
};

/**
 * HowApisWorks — Silky Smooth Elongated Stretch Pop-Up Flow
 */
export const HowApisWorks = memo(() => {
  return (
    <section aria-label="How APIS works" className="w-full max-w-full space-y-6 sm:space-y-8 pt-6 pb-12">
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, scaleY: 0.92, y: 15 }}
        whileInView={{ opacity: 1, scaleY: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.6, ease: LUXURY_EASE }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6 origin-bottom"
      >
        <div>
          <span className="font-condensed-heading text-xs font-bold text-violet-400 tracking-widest block mb-1">
            CORE ARCHITECTURE & PIPELINE
          </span>
          <h2 className="font-condensed-heading text-3xl sm:text-4xl font-extrabold text-white tracking-wide">
            HOW APIS WORKS — STEP BY STEP
          </h2>
        </div>
        <p className="font-condensed text-base text-muted-foreground tracking-wide max-w-lg leading-relaxed">
          A systematic 5-stage transformation turning scattered university marks and logs into verified, actionable intelligence.
        </p>
      </motion.div>

      {/* Dynamic Size Stacked Step Frames with Silky Smooth Stretch Animation */}
      <div className="w-full space-y-5 sm:space-y-6 relative">
        {/* Subtle vertical connection spine */}
        <div 
          className="hidden md:block absolute left-[3.75rem] top-12 bottom-12 w-px bg-gradient-to-b from-violet-500/40 via-indigo-500/25 to-fuchsia-500/40 pointer-events-none" 
          aria-hidden="true" 
        />

        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <motion.div
              key={step.number}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              whileHover={{ 
                scale: 1.008,
                borderColor: 'rgba(255,255,255,0.2)'
              }}
              style={{
                contain: 'content',
                willChange: 'transform, opacity'
              }}
              className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-card/85 backdrop-blur-md shadow-xl transition-all duration-300 origin-bottom"
            >
              {/* Soft corner gradient accent */}
              <div 
                className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${step.accentGrad} opacity-30 rounded-bl-full pointer-events-none transition-opacity duration-500`}
                aria-hidden="true"
              />

              <div className="p-6 sm:p-8 lg:p-9 relative z-10">
                <div className="flex flex-col md:flex-row md:items-start gap-5 sm:gap-7 lg:gap-8">
                  {/* Step Number & Icon Capsule */}
                  <div className="flex items-center md:flex-col gap-4 shrink-0 md:w-20 text-center">
                    <motion.span 
                      variants={numberStretchVariant}
                      className="font-condensed font-black text-4xl sm:text-5xl text-white/35 group-hover:text-white/80 transition-colors select-none tracking-tight origin-bottom block"
                    >
                      {step.number}
                    </motion.span>

                    <motion.div
                      variants={textStretchVariant}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center shrink-0 shadow-inner`}
                      aria-hidden="true"
                    >
                      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${step.color}`} />
                    </motion.div>
                  </div>

                  {/* Main Content Body */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="space-y-1">
                      {/* Phase Tag */}
                      <motion.div variants={textStretchVariant} className="flex flex-wrap items-center gap-2 mb-1.5 origin-left">
                        <span className={`font-condensed text-xs font-black uppercase px-3 py-1 rounded-full border tracking-widest ${step.tagBg}`}>
                          {step.phase}
                        </span>
                      </motion.div>

                      {/* Title */}
                      <motion.h3 
                        variants={textStretchVariant}
                        className="font-condensed-heading text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-wide break-words origin-bottom"
                      >
                        {step.title}
                      </motion.h3>
                      
                      {/* Subtitle */}
                      <motion.p 
                        variants={textStretchVariant}
                        className="font-condensed text-sm sm:text-base font-semibold text-violet-300/80 tracking-wider"
                      >
                        {step.subtitle}
                      </motion.p>
                    </div>

                    {/* Description Paragraph */}
                    <motion.p 
                      variants={textStretchVariant}
                      className="font-condensed text-base sm:text-lg text-muted-foreground leading-relaxed font-medium tracking-wide origin-bottom"
                    >
                      {step.description}
                    </motion.p>

                    {/* Bulleted Insights List */}
                    <motion.div 
                      variants={textStretchVariant}
                      className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 border-t border-white/[0.06]"
                    >
                      {step.keyInsights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs sm:text-sm font-condensed text-white/75 font-semibold tracking-wider">
                          <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{insight}</span>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Clarification */}
      <motion.div 
        initial={{ opacity: 0, scaleY: 0.9 }}
        whileInView={{ opacity: 1, scaleY: 1 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.5, ease: LUXURY_EASE }}
        className="p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center origin-bottom"
      >
        <p className="font-condensed text-xs sm:text-sm text-white/50 font-bold tracking-widest uppercase">
          ✦ AI acts as an analytical reasoning layer over your records — never guessing or generating fake academic statistics.
        </p>
      </motion.div>
    </section>
  );
});

HowApisWorks.displayName = 'HowApisWorks';
