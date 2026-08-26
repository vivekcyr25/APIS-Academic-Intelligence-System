import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePerformanceMode } from '../../hooks/usePerformanceMode';

/**
 * AcademicDoodleWallpaper
 * 
 * Elegant, subtle academic doodle wallpaper replacing the sci-fi starfield.
 * Uses lightweight hand-drawn SVG vector line-art of study desk objects,
 * books, graduation caps, math formulas, code brackets, and academic tools.
 * 
 * Features:
 * - Low-opacity lavender/muted violet/soft purple line-art.
 * - Center-clearing radial mask for maximum headline readability.
 * - Seamless distribution around margins, edges, and corners.
 * - Ultra-subtle calm floating animation for organic depth.
 */
export const AcademicDoodleWallpaper = memo(() => {
  const { isLowEnd } = usePerformanceMode();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* ── 1. Base Ambient Lighting (Rich Deep Violet/Navy Glow) ── */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse 90% 60% at 50% 20%, rgba(99, 60, 220, 0.15) 0%, rgba(20, 10, 45, 0.4) 60%, transparent 100%)'
        }}
      />

      {/* ── 2. Seamless SVG Doodle Pattern Layer ── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          {/* Subtle Radial Gradient to fade out doodles in center for maximum text legibility */}
          <mask id="hero-center-mask">
            <radialGradient id="center-fade" cx="50%" cy="38%" r="65%">
              <stop offset="0%" stopColor="white" stopOpacity="0.08" />
              <stop offset="35%" stopColor="white" stopOpacity="0.35" />
              <stop offset="70%" stopColor="white" stopOpacity="0.85" />
              <stop offset="100%" stopColor="white" stopOpacity="1" />
            </radialGradient>
            <rect width="100%" height="100%" fill="url(#center-fade)" />
          </mask>

          {/* Master 420x420 Seamless Doodle Pattern */}
          <pattern
            id="academic-doodles-pattern"
            width="420"
            height="420"
            patternUnits="userSpaceOnUse"
          >
            <g
              fill="none"
              stroke="#a78bfa"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.14"
            >
              {/* 1. Open Book (Top Left) */}
              <g transform="translate(30, 40) rotate(-6)">
                <path d="M0,18 C8,12 18,12 26,16 C34,12 44,12 52,18 L52,38 C44,32 34,32 26,36 C18,32 8,32 0,38 Z" />
                <path d="M26,16 L26,36" />
                <path d="M6,22 C12,18 19,18 23,20" strokeWidth="0.9" opacity="0.7" />
                <path d="M6,27 C12,23 19,23 23,25" strokeWidth="0.9" opacity="0.7" />
                <path d="M29,20 C33,18 40,18 46,22" strokeWidth="0.9" opacity="0.7" />
                <path d="M29,25 C33,23 40,23 46,27" strokeWidth="0.9" opacity="0.7" />
              </g>

              {/* 2. Graduation Cap (Top Right) */}
              <g transform="translate(320, 35) rotate(8)">
                <polygon points="24,6 48,16 24,26 0,16" />
                <path d="M10,21 L10,32 C10,32 16,36 24,36 C32,36 38,32 38,32 L38,21" />
                <path d="M48,16 L48,34" />
                <circle cx="48" cy="35" r="1.5" fill="#a78bfa" />
              </g>

              {/* 3. Pencil & Ruler Cross (Top Middle) */}
              <g transform="translate(180, 25) rotate(12)">
                {/* Pencil */}
                <path d="M10,0 L20,0 L20,32 L15,38 L10,32 Z" />
                <line x1="10" y1="6" x2="20" y2="6" />
                <line x1="15" y1="6" x2="15" y2="32" strokeWidth="0.8" />
              </g>

              {/* 4. Coffee Mug with Steam (Mid-Upper Left) */}
              <g transform="translate(120, 110) rotate(-4)">
                <rect x="0" y="8" width="22" height="20" rx="3" />
                <path d="M22,12 C27,12 28,22 22,23" />
                {/* Steam */}
                <path d="M6,3 C7,0 5,-2 6,-5" strokeWidth="1" opacity="0.7" />
                <path d="M12,3 C13,0 11,-2 12,-5" strokeWidth="1" opacity="0.7" />
                <path d="M18,3 C19,0 17,-2 18,-5" strokeWidth="1" opacity="0.7" />
              </g>

              {/* 5. Mathematical Integral & Sigma (Upper Center-Right) */}
              <g transform="translate(260, 95)">
                {/* Integral */}
                <path d="M6,0 C3,0 1,3 1,7 L1,23 C1,27 -1,30 -4,30" strokeWidth="1.4" />
                {/* Summation Sigma */}
                <path d="M22,6 L36,6 L27,17 L36,28 L22,28" strokeWidth="1.4" />
              </g>

              {/* 6. Desk Lightbulb / Idea (Far Right) */}
              <g transform="translate(360, 140) rotate(-10)">
                <path d="M12,0 C5,0 0,5 0,12 C0,16 3,20 5,23 L5,27 L19,27 L19,23 C21,20 24,16 24,12 C24,5 19,0 12,0 Z" />
                <line x1="7" y1="30" x2="17" y2="30" />
                <line x1="9" y1="33" x2="15" y2="33" />
                {/* Filament */}
                <path d="M9,15 L12,8 L15,15" strokeWidth="0.9" opacity="0.8" />
              </g>

              {/* 7. Code Brackets & Snippet (Far Left Middle) */}
              <g transform="translate(20, 190) rotate(5)">
                <path d="M8,0 L0,10 L8,20" strokeWidth="1.5" />
                <path d="M24,0 L32,10 L24,20" strokeWidth="1.5" />
                <line x1="18" y1="2" x2="14" y2="18" strokeWidth="1.2" />
              </g>

              {/* 8. Study Clock / Pomodoro (Center-Left) */}
              <g transform="translate(130, 210)">
                <circle cx="16" cy="16" r="14" />
                <polyline points="16,7 16,16 22,16" strokeWidth="1.3" />
                <line x1="16" y1="0" x2="16" y2="2" />
                <line x1="32" y1="16" x2="30" y2="16" />
                <line x1="16" y1="32" x2="16" y2="30" />
                <line x1="0" y1="16" x2="2" y2="16" />
              </g>

              {/* 9. Stack of Books (Center-Right) */}
              <g transform="translate(280, 200) rotate(-5)">
                {/* Bottom Book */}
                <rect x="0" y="24" width="44" height="10" rx="2" />
                <line x1="6" y1="24" x2="6" y2="34" strokeWidth="0.8" />
                {/* Middle Book */}
                <rect x="4" y="13" width="38" height="9" rx="2" />
                <line x1="10" y1="13" x2="10" y2="22" strokeWidth="0.8" />
                {/* Top Book with Bookmark */}
                <rect x="2" y="2" width="36" height="9" rx="2" />
                <path d="M28,2 L28,8 L31,6 L34,8 L34,2" fill="#a78bfa" opacity="0.3" />
              </g>

              {/* 10. Calculator (Far Right Middle) */}
              <g transform="translate(350, 260) rotate(8)">
                <rect x="0" y="0" width="28" height="40" rx="4" />
                <rect x="4" y="4" width="20" height="9" rx="1" strokeWidth="0.9" />
                {/* Keypad */}
                <circle cx="8" cy="19" r="1.5" fill="#a78bfa" />
                <circle cx="14" cy="19" r="1.5" fill="#a78bfa" />
                <circle cx="20" cy="19" r="1.5" fill="#a78bfa" />
                <circle cx="8" cy="26" r="1.5" fill="#a78bfa" />
                <circle cx="14" cy="26" r="1.5" fill="#a78bfa" />
                <circle cx="20" cy="26" r="1.5" fill="#a78bfa" />
                <circle cx="8" cy="33" r="1.5" fill="#a78bfa" />
                <circle cx="14" cy="33" r="1.5" fill="#a78bfa" />
                <circle cx="20" cy="33" r="1.5" fill="#a78bfa" />
              </g>

              {/* 11. Diploma / Scroll with Ribbon (Bottom Left) */}
              <g transform="translate(45, 310) rotate(-12)">
                <path d="M0,6 C6,2 18,2 24,6 L48,6 C54,2 66,2 72,6 L72,22 C66,18 54,18 48,22 L24,22 C18,18 6,18 0,22 Z" />
                <ellipse cx="72" cy="14" rx="3" ry="8" />
                {/* Ribbon Tag */}
                <path d="M34,14 L30,28 L36,25 L42,28 L38,14" fill="#a78bfa" opacity="0.25" />
              </g>

              {/* 12. Sticky Note with Pushpin (Bottom Center-Left) */}
              <g transform="translate(160, 320) rotate(6)">
                <path d="M0,0 L26,0 L26,20 L20,26 L0,26 Z" />
                <path d="M20,20 L26,20 L20,26 Z" strokeWidth="0.9" />
                {/* Push pin */}
                <circle cx="13" cy="4" r="2" fill="#c084fc" opacity="0.6" />
                <line x1="4" y1="10" x2="18" y2="10" strokeWidth="0.8" opacity="0.6" />
                <line x1="4" y1="15" x2="21" y2="15" strokeWidth="0.8" opacity="0.6" />
              </g>

              {/* 13. Upward Trend Chart (Bottom Center-Right) */}
              <g transform="translate(260, 330) rotate(-4)">
                <line x1="0" y1="30" x2="40" y2="30" />
                <line x1="0" y1="0" x2="0" y2="30" />
                <polyline points="4,24 14,18 24,22 36,6" strokeWidth="1.5" />
                <circle cx="36" cy="6" r="2" fill="#a78bfa" />
              </g>

              {/* 14. Geometry Compass & Pi (Bottom Right) */}
              <g transform="translate(345, 350)">
                {/* Pi */}
                <path d="M4,10 L24,10 M10,10 L8,26 M18,10 L20,26" strokeWidth="1.4" />
                {/* Square Root */}
                <path d="M28,20 L31,26 L35,12 L46,12" strokeWidth="1.2" />
                <text x="37" y="24" fontSize="10" stroke="none" fill="#a78bfa" fontFamily="sans-serif">x</text>
              </g>

              {/* 15. Sparkles & Little Study Stars (Scattered Accents) */}
              <g transform="translate(90, 20)">
                <path d="M4,0 L5,3 L8,4 L5,5 L4,8 L3,5 L0,4 L3,3 Z" fill="#d8b4fe" opacity="0.4" stroke="none" />
              </g>
              <g transform="translate(240, 60)">
                <path d="M3,0 L4,2 L6,3 L4,4 L3,6 L2,4 L0,3 L2,2 Z" fill="#d8b4fe" opacity="0.4" stroke="none" />
              </g>
              <g transform="translate(390, 90)">
                <path d="M4,0 L5,3 L8,4 L5,5 L4,8 L3,5 L0,4 L3,3 Z" fill="#d8b4fe" opacity="0.4" stroke="none" />
              </g>
              <g transform="translate(100, 260)">
                <path d="M3,0 L4,2 L6,3 L4,4 L3,6 L2,4 L0,3 L2,2 Z" fill="#d8b4fe" opacity="0.4" stroke="none" />
              </g>
              <g transform="translate(220, 270)">
                <path d="M4,0 L5,3 L8,4 L5,5 L4,8 L3,5 L0,4 L3,3 Z" fill="#d8b4fe" opacity="0.4" stroke="none" />
              </g>
              <g transform="translate(310, 140)">
                <path d="M3,0 L4,2 L6,3 L4,4 L3,6 L2,4 L0,3 L2,2 Z" fill="#d8b4fe" opacity="0.4" stroke="none" />
              </g>
            </g>
          </pattern>
        </defs>

        {/* Apply Pattern with Center Radial Fade Mask */}
        <rect
          width="100%"
          height="100%"
          fill="url(#academic-doodles-pattern)"
          mask="url(#hero-center-mask)"
        />
      </svg>

      {/* ── 3. Subtle Floating Accent Clusters on Margins (Depth Layering) ── */}
      {!isLowEnd && !shouldReduceMotion && (
        <>
          {/* Floating Book on Top-Left Edge */}
          <motion.div
            className="absolute top-24 left-8 lg:left-16 opacity-30 text-violet-300 pointer-events-none hidden sm:block"
            animate={{
              y: [0, -8, 0],
              rotate: [-6, -4, -6],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <svg width="60" height="48" viewBox="0 0 60 48" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4,12 C14,6 24,6 30,10 C36,6 46,6 56,12 L56,38 C46,32 36,32 30,36 C24,32 14,32 4,38 Z" />
              <path d="M30,10 L30,36" />
              <line x1="10" y1="18" x2="24" y2="16" opacity="0.6" strokeWidth="0.9" />
              <line x1="10" y1="24" x2="24" y2="22" opacity="0.6" strokeWidth="0.9" />
              <line x1="36" y1="16" x2="50" y2="18" opacity="0.6" strokeWidth="0.9" />
              <line x1="36" y1="22" x2="50" y2="24" opacity="0.6" strokeWidth="0.9" />
            </svg>
          </motion.div>

          {/* Floating Graduation Cap on Top-Right Edge */}
          <motion.div
            className="absolute top-28 right-8 lg:right-20 opacity-30 text-purple-300 pointer-events-none hidden sm:block"
            animate={{
              y: [0, 8, 0],
              rotate: [8, 11, 8],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          >
            <svg width="56" height="44" viewBox="0 0 56 44" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="28,4 54,16 28,28 2,16" />
              <path d="M12,22 L12,34 C12,34 18,38 28,38 C38,38 44,34 44,34 L44,22" />
              <path d="M54,16 L54,34" />
              <circle cx="54" cy="35" r="1.5" fill="currentColor" />
            </svg>
          </motion.div>

          {/* Floating Idea Lightbulb on Mid-Left */}
          <motion.div
            className="absolute top-[48vh] left-6 lg:left-12 opacity-25 text-indigo-300 pointer-events-none hidden md:block"
            animate={{
              y: [0, -6, 0],
              rotate: [4, 0, 4],
            }}
            transition={{
              duration: 7.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          >
            <svg width="40" height="48" viewBox="0 0 40 48" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20,2 C10,2 2,10 2,20 C2,26 6,31 10,35 L10,40 L30,40 L30,35 C34,31 38,26 38,20 C38,10 30,2 20,2 Z" />
              <line x1="14" y1="44" x2="26" y2="44" />
              <line x1="16" y1="47" x2="24" y2="47" />
              <path d="M15,22 L20,13 L25,22" strokeWidth="0.9" opacity="0.7" />
            </svg>
          </motion.div>

          {/* Floating Code Snippet on Mid-Right */}
          <motion.div
            className="absolute top-[52vh] right-6 lg:right-16 opacity-25 text-violet-300 pointer-events-none hidden md:block"
            animate={{
              y: [0, 7, 0],
              rotate: [-5, -2, -5],
            }}
            transition={{
              duration: 8.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          >
            <svg width="48" height="36" viewBox="0 0 48 36" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12,4 L2,18 L12,32" />
              <path d="M36,4 L46,18 L36,32" />
              <line x1="28" y1="4" x2="20" y2="32" strokeWidth="1.2" />
            </svg>
          </motion.div>
        </>
      )}

      {/* ── 4. Smooth Ambient Base ── */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(6, 3, 15, 0.4) 100%)'
        }}
      />
    </div>
  );
});

AcademicDoodleWallpaper.displayName = 'AcademicDoodleWallpaper';
