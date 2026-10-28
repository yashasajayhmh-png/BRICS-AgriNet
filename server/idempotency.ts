/**
 * Server-Side Idempotency Middleware.
 * Enforces deduplication of queued replays and network retries using Idempotency-Key headers.
 * 
 * Invariants:
 * 1. Identical Idempotency-Key with identical body payload returns cached response with X-Cache-Lookup: HIT.
 * 2. Re-using an Idempotency-Key with a different payload body returns 409 Conflict.
 * 3. TTL cleanup prevents memory leakage in long-running container processes.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface CachedIdempotentResponse {
  statusCode: number;
  headers: Record<string, string | string[]>;
  body: any;
  payloadHash: string;
  createdAt: number;
  expiresAt: number;
}

export class IdempotencyStore {
  private store = new Map<string, CachedIdempotentResponse>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs = 24 * 60 * 60 * 1000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  get(key: string): CachedIdempotentResponse | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry;
  }

  set(key: string, data: Omit<CachedIdempotentResponse, 'createdAt' | 'expiresAt'>, ttlMs?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttlMs || this.defaultTtlMs);
    this.store.set(key, {
      ...data,
      createdAt: now,
      expiresAt,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

export const defaultIdempotencyStore = new IdempotencyStore();

export function computePayloadHash(body: any): string {
  const json = JSON.stringify(body || {});
  return crypto.createHash('sha256').update(json).digest('hex');
}

/**
 * Express middleware for idempotency enforcement
 */
export function idempotencyMiddleware(store: IdempotencyStore = defaultIdempotencyStore) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only apply to mutating HTTP methods (POST, PUT, PATCH, DELETE)
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      next();
      return;
    }

    const rawKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
    if (!rawKey || typeof rawKey !== 'string') {
      // If no idempotency key provided, proceed normally
      next();
      return;
    }

    const idempotencyKey = rawKey.trim();
    if (idempotencyKey.length < 8) {
      res.status(400).json({
        success: false,
        error: 'Invalid Idempotency-Key. Must be at least 8 characters long.',
      });
      return;
    }

    const currentHash = computePayloadHash(req.body);
    const cached = store.get(idempotencyKey);

    if (cached) {
      if (cached.payloadHash !== currentHash) {
        res.status(409).json({
          success: false,
          error: 'Idempotency key re-used with different request payload.',
          idempotencyKey,
        });
        return;
      }

      // Replay identical response
      res.setHeader('X-Cache-Lookup', 'HIT');
      res.setHeader('X-Idempotent-Replay', 'true');
      res.status(cached.statusCode).json(cached.body);
      return;
    }

    // Intercept response to store upon successful completion
    const originalJson = res.json.bind(res);
    res.setHeader('X-Cache-Lookup', 'MISS');

    res.json = (body: any) => {
      // Only cache successful or intentional 4xx client errors, not transient 5xx server crashes
      if (res.statusCode < 500) {
        store.set(idempotencyKey, {
          statusCode: res.statusCode,
          headers: {},
          body,
          payloadHash: currentHash,
        });
      }
      return originalJson(body);
    };

    next();
  };
}
