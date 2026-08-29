/**
 * Safety & Content Moderation Filter for APIS AI Engine
 */

const EXPLICIT_PATTERNS = [
  // Sexual & Adult Content
  /\b(sex|sexual|porn|pornography|nude|nudity|nsfw|erotic|orgasm|masturbat|fetish|boobs|penis|vagina|intercourse|stripper|blowjob|hookup|hentai|xxx)\b/i,
  // Harm & Violence
  /\b(kill\s+yourself|suicide|self-harm|bomb\s+making|terrorist|weapon\s+assembly|rape|molest)\b/i,
  // Extreme profanity / explicit abuse
  /\b(bitch|slut|whore|motherfucker|cock|cunt)\b/i
];

export const SAFETY_REFUSAL_MESSAGE = "Sorry, I can't answer that. can I help you with regarding any other academic-related request?";

/**
 * Validates whether user prompt violates content policies.
 * @returns true if prompt is unsafe/inappropriate
 */
export function isExplicitOrInappropriate(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const normalized = text.toLowerCase();
  return EXPLICIT_PATTERNS.some(pattern => pattern.test(normalized));
}
