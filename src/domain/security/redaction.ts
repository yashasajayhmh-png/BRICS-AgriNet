/**
 * Pure Security Domain Module: PII Redaction, Token Expiry Verification, and Coordinate Fuzzing.
 * 
 * Invariants:
 * 1. Pure functions without side-effects or external network calls.
 * 2. Injected clock for deterministic token evaluation.
 * 3. Consistent redaction masking of phone numbers, emails, and exact high-precision GPS coordinates.
 */

export interface TokenClaims {
  sub?: string;
  role?: string;
  exp?: number; // UNIX timestamp in seconds
  iat?: number;
}

export function isTokenExpired(claims: TokenClaims, now: () => Date, bufferSeconds = 60): boolean {
  if (!claims.exp) {
    return true; // Token without expiration is considered untrusted / expired
  }
  const currentSec = Math.floor(now().getTime() / 1000);
  return currentSec >= claims.exp - bufferSeconds;
}

/**
 * Sanitizes phone numbers by masking middle digits (e.g., +91-98***-**210)
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone || phone.length < 7) return '***-***';
  const clean = phone.trim();
  const start = clean.slice(0, 5);
  const end = clean.slice(-3);
  return `${start}****${end}`;
}

/**
 * Sanitizes email addresses (e.g., g***h@domain.com)
 */
export function sanitizeEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@private.net';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `*@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/**
 * Coordinate Fuzzing: Truncates high-precision GPS coordinates to ~1.1km resolution (2 decimal places)
 * for public outbreak telemetry to protect farmer land privacy.
 */
export function fuzzCoordinatesForPrivacy(
  latitude: number,
  longitude: number
): { latitude: number; longitude: number } {
  return {
    latitude: Math.round(latitude * 100) / 100,
    longitude: Math.round(longitude * 100) / 100,
  };
}

/**
 * Recursively sanitizes a telemetry or field observation object by masking PII fields.
 */
export function sanitizeFieldPayload<T extends Record<string, unknown>>(payload: T): T {
  const result: Record<string, unknown> = { ...payload };

  for (const [key, value] of Object.entries(result)) {
    const lowerKey = key.toLowerCase();
    if (typeof value === 'string') {
      if (lowerKey.includes('phone')) {
        result[key] = sanitizePhoneNumber(value);
      } else if (lowerKey.includes('email')) {
        result[key] = sanitizeEmail(value);
      }
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeFieldPayload(value as Record<string, unknown>);
    }
  }

  return result as T;
}
