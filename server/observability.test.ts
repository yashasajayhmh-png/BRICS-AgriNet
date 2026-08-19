import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  geminiMetrics,
  executeObservedGeminiCall,
  StructuredGeminiLog,
} from './observability';

describe('Gemini Observability & Metrics Module', () => {
  beforeEach(() => {
    geminiMetrics.reset();
  });

  it('starts with zero metrics and empty log buffer', () => {
    const snapshot = geminiMetrics.getSnapshot();
    expect(snapshot.totalCalls).toBe(0);
    expect(snapshot.successfulCalls).toBe(0);
    expect(snapshot.retryAttempts).toBe(0);
    expect(snapshot.fallbackCount).toBe(0);
    expect(snapshot.failureRatePercent).toBe(0);
    expect(snapshot.fallbackRatePercent).toBe(0);
    expect(snapshot.recentLogs).toHaveLength(0);
  });

  it('correctly classifies Gemini error types', () => {
    expect(geminiMetrics.classifyError({ message: 'Resource has been exhausted (429)' })).toBe('RATE_LIMIT_429');
    expect(geminiMetrics.classifyError({ message: '503 Service Unavailable, high demand' })).toBe('UNAVAILABLE_503');
    expect(geminiMetrics.classifyError({ message: 'API key not valid. Please pass a valid API key.' })).toBe('AUTH_OR_CONFIG');
    expect(geminiMetrics.classifyError({ message: 'SyntaxError: Unexpected token < in JSON at position 0' })).toBe('JSON_PARSE_ERROR');
    expect(geminiMetrics.classifyError({ message: 'TypeError: fetch failed - network timeout' })).toBe('NETWORK_TIMEOUT');
    expect(geminiMetrics.classifyError({ message: 'INVALID_ARGUMENT: Crop parameter missing' })).toBe('INVALID_PAYLOAD');
  });

  it('records successful Gemini calls and computes average latency', () => {
    geminiMetrics.recordSuccess({
      endpoint: 'diagnose-crop',
      model: 'gemini-3.7-flash',
      attemptNumber: 1,
      durationMs: 400,
    });

    geminiMetrics.recordSuccess({
      endpoint: 'diagnose-crop',
      model: 'gemini-3.7-flash',
      attemptNumber: 1,
      durationMs: 600,
    });

    const snapshot = geminiMetrics.getSnapshot();
    expect(snapshot.totalCalls).toBe(2);
    expect(snapshot.successfulCalls).toBe(2);
    expect(snapshot.fallbackCount).toBe(0);
    expect(snapshot.avgLatencyMs).toBe(500);
    expect(snapshot.endpoints['diagnose-crop']).toBeDefined();
    expect(snapshot.endpoints['diagnose-crop'].successfulCalls).toBe(2);
    expect(snapshot.endpoints['diagnose-crop'].avgLatencyMs).toBe(500);
    expect(snapshot.recentLogs).toHaveLength(2);
    expect(snapshot.recentLogs[0].status).toBe('SUCCESS');
  });

  it('records retry events and updates error category breakdown', () => {
    geminiMetrics.recordRetry({
      endpoint: 'advisory',
      model: 'gemini-3.7-flash',
      attemptNumber: 1,
      durationMs: 120,
      error: new Error('503 Service Unavailable'),
    });

    const snapshot = geminiMetrics.getSnapshot();
    expect(snapshot.retryAttempts).toBe(1);
    expect(snapshot.errorTypeBreakdown.UNAVAILABLE_503).toBe(1);
    expect(snapshot.recentLogs[0].status).toBe('RETRYING');
    expect(snapshot.recentLogs[0].errorCategory).toBe('UNAVAILABLE_503');
  });

  it('records fallback events and calculates accurate failure and fallback rates', () => {
    // 1 Success
    geminiMetrics.recordSuccess({
      endpoint: 'outbreak-forecast',
      model: 'gemini-3.7-flash',
      attemptNumber: 1,
      durationMs: 300,
    });

    // 1 Fallback due to 429
    geminiMetrics.recordFallback({
      endpoint: 'outbreak-forecast',
      model: 'gemini-3.7-flash',
      attemptNumber: 3,
      durationMs: 200,
      error: new Error('429 RESOURCE_EXHAUSTED: Quota exceeded'),
    });

    const snapshot = geminiMetrics.getSnapshot();
    expect(snapshot.totalCalls).toBe(2);
    expect(snapshot.successfulCalls).toBe(1);
    expect(snapshot.fallbackCount).toBe(1);
    expect(snapshot.fallbackRatePercent).toBe(50);
    expect(snapshot.errorTypeBreakdown.RATE_LIMIT_429).toBe(1);
    expect(snapshot.endpoints['outbreak-forecast'].fallbackCalls).toBe(1);
  });

  it('executes executeObservedGeminiCall successfully when action resolves', async () => {
    const mockAction = vi.fn().mockResolvedValue({ status: 'ok', value: 42 });
    const mockFallback = vi.fn().mockReturnValue({ status: 'fallback', value: 0 });

    const result = await executeObservedGeminiCall({
      endpoint: 'test-endpoint',
      model: 'gemini-3.7-flash',
      action: mockAction,
      fallback: mockFallback,
    });

    expect(result).toEqual({ status: 'ok', value: 42 });
    expect(mockAction).toHaveBeenCalledTimes(1);
    expect(mockFallback).not.toHaveBeenCalled();

    const snapshot = geminiMetrics.getSnapshot();
    expect(snapshot.successfulCalls).toBe(1);
    expect(snapshot.fallbackCount).toBe(0);
  });

  it('retries on transient errors and invokes fallback when exhausted', async () => {
    const transientError = new Error('503 Service Unavailable');
    const mockAction = vi.fn().mockRejectedValue(transientError);
    const mockFallback = vi.fn().mockReturnValue({ status: 'fallback-triggered' });

    const result = await executeObservedGeminiCall({
      endpoint: 'resilience-test',
      model: 'gemini-3.7-flash',
      action: mockAction,
      fallback: mockFallback,
      maxRetries: 2,
      initialDelayMs: 10,
    });

    expect(result).toEqual({ status: 'fallback-triggered' });
    // 1 initial + 2 retries = 3 calls
    expect(mockAction).toHaveBeenCalledTimes(3);
    expect(mockFallback).toHaveBeenCalledTimes(1);

    const snapshot = geminiMetrics.getSnapshot();
    expect(snapshot.retryAttempts).toBe(2);
    expect(snapshot.fallbackCount).toBe(1);
    expect(snapshot.errorTypeBreakdown.UNAVAILABLE_503).toBe(3);
  });
});
