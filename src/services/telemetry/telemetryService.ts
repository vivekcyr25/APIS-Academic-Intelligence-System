import { trackEvent } from '../firebase/config';

// ─── TYPES & CONSTANTS ────────────────────────────────────
export const TELEMETRY_EVENTS = {
  UX_INTERACTION: 'ux_interaction',
  PERFORMANCE: 'performance_metric',
  ERROR: 'exception',
  SYNC: 'sync_event',
  EXPORT: 'data_export',
  FEEDBACK: 'feedback_event'
} as const;

/**
 * APIS AI Telemetry Service
 * Professional observability for production monitoring.
 */
export const telemetryService = {
  // ─── CORE LOGGER ──────────────────────────────────────────
  logEvent: async (event: string, params?: Record<string, any>) => {
    try {
      trackEvent(event, params);
    } catch (e) {
      console.warn('[telemetry:silent_failure]', e);
    }
  },

  // ─── ERROR TELEMETRY ──────────────────────────────────────
  logError: (error: Error | string, context?: any) => {
    const message = typeof error === 'string' ? error : error.message;
    
    trackEvent(TELEMETRY_EVENTS.ERROR, {
      description: message,
      fatal: false,
      ...context
    });
  },

  logCrash: (error: Error, componentStack?: string) => {
    trackEvent(TELEMETRY_EVENTS.ERROR, {
      description: error.message,
      fatal: true,
      component_stack: componentStack
    });
  },

  // ─── PERFORMANCE TELEMETRY ────────────────────────────────
  logPerformance: (metric: string, value: number, context?: any) => {
    trackEvent(TELEMETRY_EVENTS.PERFORMANCE, {
      metric_name: metric,
      value: Math.round(value),
      ...context
    });
  },

  // ─── SYNC & OFFLINE TELEMETRY ─────────────────────────────
  logSyncConflict: (collection: string, docId: string) => {
    trackEvent('sync_conflict', { collection, doc_id: docId });
  },

  logOfflineSession: (durationMinutes: number) => {
    trackEvent('offline_session', { duration_minutes: durationMinutes });
  },

  // ─── EXPORT TELEMETRY ─────────────────────────────────────
  logExport: (type: 'pdf' | 'json', sizeBytes: number) => {
    trackEvent(TELEMETRY_EVENTS.EXPORT, { 
      export_type: type, 
      size_kb: Math.round(sizeBytes / 1024) 
    });
  },

  // ─── BETA BEHAVIORAL METRICS ──────────────────────────────
  logOnboardingCompletion: (timeSeconds: number) => {
    trackEvent('onboarding_complete', { duration_sec: timeSeconds });
  },

  logFeatureEngagement: (feature: string, action: string) => {
    trackEvent('feature_engagement', { feature, action });
  },

  logSyncLatency: (latencyMs: number) => {
    trackEvent('sync_latency', { latency_ms: Math.round(latencyMs) });
  }
};

// Backwards compatibility
export const Telemetry = telemetryService;
