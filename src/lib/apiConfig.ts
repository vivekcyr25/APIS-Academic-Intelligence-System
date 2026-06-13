const DEFAULT_API_URL = 'http://localhost:3001';

/**
 * Resolves the backend base URL for API calls.
 * Strips BOM/whitespace so a polluted env var is not treated as a relative path.
 */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;
  const cleaned = String(raw).replace(/^\uFEFF/, '').trim();

  if (!cleaned) return DEFAULT_API_URL;
  if (/^https?:\/\//i.test(cleaned)) return cleaned.replace(/\/+$/, '');

  return DEFAULT_API_URL;
}
