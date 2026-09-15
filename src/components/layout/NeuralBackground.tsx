import { memo } from 'react';
import { AcademicDoodleWallpaper } from './AcademicDoodleWallpaper';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * NeuralBackground — Theme-aware Academic Study Wallpaper
 * Dark: charcoal-green ink (#17201F)
 * Light: warm parchment paper (#F7F4EC)
 */
export const NeuralBackground = memo(() => {
  const { isDark } = useTheme();

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none select-none"
      aria-hidden="true"
      style={{ background: isDark ? '#17201F' : '#F7F4EC', transition: 'background 0.4s ease' }}
    >
      {/* 1. Base Tone */}
      <div className="absolute inset-0" style={{ background: isDark ? '#17201F' : '#F7F4EC', transition: 'background 0.4s ease' }} />

      {/* 2. Subtle Notebook Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(rgba(247, 244, 236, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(247, 244, 236, 0.06) 1px, transparent 1px)`
            : `linear-gradient(rgba(23, 32, 31, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(23, 32, 31, 0.06) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          opacity: isDark ? 0.4 : 0.55,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* 3. Academic Doodle Wallpaper */}
      <div className="academic-doodle-layer">
        <AcademicDoodleWallpaper />
      </div>

      {/* 4. Peripheral Vignette / Edge Fade */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 90% 80% at 50% 40%, transparent 60%, rgba(6, 3, 15, 0.40) 100%)'
            : 'radial-gradient(ellipse 90% 80% at 50% 40%, transparent 65%, rgba(240, 237, 255, 0.30) 100%)',
          transition: 'background 0.4s ease',
        }}
      />
    </div>
  );
});

NeuralBackground.displayName = 'NeuralBackground';
