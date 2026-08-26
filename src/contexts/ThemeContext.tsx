import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
  isDark: true,
});

// ─── Origami fold transition ─────────────────────────────────────────────────
//
// Sequence:
//   1. A thin fold-crease element sweeps across the viewport (left → right).
//   2. Simultaneously, the View Transitions API (where available) cross-fades
//      old/new snapshots using a subtle clip-path slide — giving the impression
//      the old page peels away and the new one is revealed underneath.
//   3. On browsers without VTA, step 1 still runs; the theme change happens at
//      the sweep midpoint so the crease visually "carries" the colour switch.
//   4. prefers-reduced-motion: both effects are skipped entirely.
//
function runOrigamiTransition(applyTheme: () => void): void {
  // Reduced-motion bail-out
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    applyTheme();
    return;
  }

  const DURATION = 400; // ms — must match CSS animation-duration

  // ── 1. Inject the fold-crease overlay ──────────────────────────────────
  const crease = document.createElement('div');
  crease.setAttribute('aria-hidden', 'true');
  crease.id = 'origami-crease-overlay';
  document.body.appendChild(crease);

  // ── 2. View Transitions API path ───────────────────────────────────────
  if ('startViewTransition' in document) {
    document.documentElement.classList.add('origami-active');

    const transition = (document as any).startViewTransition(() => {
      applyTheme();
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove('origami-active');
      crease.remove();
    });
  } else {
    // ── 3. CSS-only fallback ────────────────────────────────────────────
    // Apply theme at crease midpoint (45% through sweep ≈ 180ms)
    const mid = DURATION * 0.45;
    setTimeout(applyTheme, mid);
    setTimeout(() => crease.remove(), DURATION + 60);
  }
}


// ─── Provider ────────────────────────────────────────────────────────────────
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('apis-theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Apply data-theme attribute + persist whenever state changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('apis-theme', theme); } catch { /* unavailable */ }
  }, [theme]);

  // Toggle with origami transition
  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    runOrigamiTransition(() => setTheme(next));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
