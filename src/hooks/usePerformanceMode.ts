import { useState, useEffect } from 'react';

export type PerformanceTier = 'PREMIUM' | 'BALANCED' | 'LOW_END';

export const usePerformanceMode = () => {
  const [tier, setTier] = useState<PerformanceTier>('BALANCED');

  useEffect(() => {
    const detectPerformance = () => {
      if (typeof navigator === 'undefined') return 'BALANCED';
      const ua = navigator.userAgent.toLowerCase();
      
      // 1. Browser Detection
      const isEdge = typeof navigator !== 'undefined' && ua.includes('edg/');
      const isAndroid = typeof navigator !== 'undefined' && ua.includes('android');
      const isMobile = typeof navigator !== 'undefined' && /iphone|ipad|ipod|android|blackberry|mini|windows\sphone/i.test(ua);
      
      // 2. Hardware Capability (where supported)
      const cores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
      // @ts-ignore - deviceMemory is not in standard lib yet
      const memory = typeof navigator !== 'undefined' ? (navigator.deviceMemory || 4) : 4;
      
      // 3. Logic:
      // PREMIUM: Desktop Chrome/Firefox with good specs
      // BALANCED: Edge Desktop, High-end Tablets
      // LOW_END: All Android, Mobile Edge, low-spec devices
      
      if (isAndroid || (isMobile && isEdge) || memory < 4 || cores < 4) {
        return 'LOW_END';
      }
      
      if (isEdge || isMobile) {
        return 'BALANCED';
      }
      
      return 'PREMIUM';
    };

    const currentTier = detectPerformance();
    setTier(currentTier);
    
    // Set a data attribute on document body for CSS targeting
    document.body.setAttribute('data-perf-tier', currentTier.toLowerCase());
  }, []);

  return {
    tier,
    isLowEnd: tier === 'LOW_END',
    isPremium: tier === 'PREMIUM',
    isBalanced: tier === 'BALANCED'
  };
};
