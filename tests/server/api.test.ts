/**
 * API Integration and Security Tests using Supertest.
 * Tests health endpoints, idempotency deduplication, circuit breakers, and auth token refresh.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server';
import { CircuitBreaker } from '../../server/fallbacks';
import { generateRefreshToken } from '../../server/auth';
import type { Express } from 'express';

describe('Server Hardening & Security API Suite', () => {
  let app: Express;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    app = await createApp();
  });

  it('GET /api/health/live returns shallow liveness status', async () => {
    const res = await request(app).get('/api/health/live');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'live' });
  });

  it('GET /api/health/ready returns readiness check without leaking secrets or paths', async () => {
    const res = await request(app).get('/api/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.database).toBe('connected');
    // Ensure no secret keys or environment details are leaked
    expect(res.body.apiKey).toBeUndefined();
    expect(res.body.hasKey).toBeUndefined();
    expect(res.body.path).toBeUndefined();
  });

  it('Enforces idempotency: identical Idempotency-Key returns cached response with X-Cache-Lookup: HIT', async () => {
    const idempotencyKey = `test-key-${Date.now()}`;
    const payload = {
      farmerId: 'farmer-01',
    };

    // First request: Cache MISS
    const res1 = await request(app)
      .post('/api/auth/demo-token')
      .set('Idempotency-Key', idempotencyKey)
      .send(payload);

    expect(res1.status).toBe(200);
    expect(res1.headers['x-cache-lookup']).toBe('MISS');
    expect(res1.body.success).toBe(true);
    const firstToken = res1.body.token;

    // Second request with SAME key and SAME body: Cache HIT
    const res2 = await request(app)
      .post('/api/auth/demo-token')
      .set('Idempotency-Key', idempotencyKey)
      .send(payload);

    expect(res2.status).toBe(200);
    expect(res2.headers['x-cache-lookup']).toBe('HIT');
    expect(res2.headers['x-idempotent-replay']).toBe('true');
    expect(res2.body.token).toBe(firstToken);

    // Third request with SAME key but DIFFERENT payload: 409 Conflict
    const res3 = await request(app)
      .post('/api/auth/demo-token')
      .set('Idempotency-Key', idempotencyKey)
      .send({ farmerId: 'different-farmer' });

    expect(res3.status).toBe(409);
    expect(res3.body.error).toContain('different request payload');
  });

  it('CircuitBreaker transitions: CLOSED -> OPEN -> HALF_OPEN -> CLOSED with fake timers', async () => {
    let fakeTime = 1000000;
    const now = () => fakeTime;

    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 5000,
      halfOpenSuccessThreshold: 2,
      now,
    });

    expect(breaker.getState()).toBe('CLOSED');

    // 1st failure: still CLOSED
    const fallbackVal = 'FALLBACK_TRIGGERED';
    let res = await breaker.execute(
      async () => { throw new Error('API failure 1'); },
      () => fallbackVal
    );
    expect(res).toBe(fallbackVal);
    expect(breaker.getState()).toBe('CLOSED');

    // 2nd failure: trips to OPEN
    res = await breaker.execute(
      async () => { throw new Error('API failure 2'); },
      () => fallbackVal
    );
    expect(res).toBe(fallbackVal);
    expect(breaker.getState()).toBe('OPEN');

    // Fast-shedding while OPEN: doesn't even call action
    let actionCalled = false;
    res = await breaker.execute(
      async () => { actionCalled = true; return 'SUCCESS'; },
      () => 'SHED_LOAD'
    );
    expect(actionCalled).toBe(false);
    expect(res).toBe('SHED_LOAD');

    // Advance time past resetTimeoutMs (5000ms)
    fakeTime += 5500;
    expect(breaker.getState()).toBe('HALF_OPEN');

    // 1st success in HALF_OPEN
    await breaker.execute(
      async () => 'OK_1',
      () => 'ERR'
    );
    expect(breaker.getState()).toBe('HALF_OPEN');

    // 2nd success in HALF_OPEN -> resets to CLOSED
    await breaker.execute(
      async () => 'OK_2',
      () => 'ERR'
    );
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('POST /api/auth/refresh issues fresh access token from valid refresh token', async () => {
    // Generate valid refresh token for test farmer
    const testFarmer = {
      id: 'farmer-01',
      farmerName: 'Gurpreet Singh',
      phoneOrEmail: '+91-98765-43210',
      country: 'India',
      flag: '🇮🇳',
      region: 'Punjab',
      cropFocus: 'Wheat',
      farmSizeHa: 3.2,
      plotId: 'in-punjab-01',
      role: 'farmer' as const,
    };

    const refreshToken = generateRefreshToken(testFarmer);

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.id).toBe('farmer-01');
  });
});
