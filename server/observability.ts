/**
 * BRICS AgriNet Gemini Observability & Metrics Module
 * 
 * Provides structured telemetry, structured JSON error logging, failure rate tracking,
 * retry attempt counters, and latency monitoring for all Gemini LLM invocations.
 */

export type ErrorCategory =
  | 'RATE_LIMIT_429'
  | 'UNAVAILABLE_503'
  | 'AUTH_OR_CONFIG'
  | 'INVALID_PAYLOAD'
  | 'JSON_PARSE_ERROR'
  | 'NETWORK_TIMEOUT'
  | 'UNKNOWN';

export interface StructuredGeminiLog {
  id: string;
  timestamp: string;
  endpoint: string;
  model: string;
  attemptNumber: number;
  durationMs: number;
  status: 'SUCCESS' | 'RETRYING' | 'FALLBACK_TRIGGERED';
  errorCategory?: ErrorCategory;
  errorMessage?: string;
  meta?: Record<string, any>;
}

export interface EndpointMetric {
  totalCalls: number;
  successfulCalls: number;
  retriedCalls: number;
  fallbackCalls: number;
  totalDurationMs: number;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  errorCategoryBreakdown: Record<ErrorCategory, number>;
}

const startTime = Date.now();
const MAX_LOG_BUFFER_SIZE = 100;

class GeminiMetricsCollector {
  private totalCalls = 0;
  private successfulCalls = 0;
  private retryAttempts = 0;
  private fallbackCount = 0;
  private totalLatencyMs = 0;
  private logsBuffer: StructuredGeminiLog[] = [];
  private endpointMetrics: Map<string, EndpointMetric> = new Map();
  private errorBreakdown: Record<ErrorCategory, number> = {
    RATE_LIMIT_429: 0,
    UNAVAILABLE_503: 0,
    AUTH_OR_CONFIG: 0,
    INVALID_PAYLOAD: 0,
    JSON_PARSE_ERROR: 0,
    NETWORK_TIMEOUT: 0,
    UNKNOWN: 0,
  };

  private getOrCreateEndpointMetric(endpoint: string): EndpointMetric {
    let metric = this.endpointMetrics.get(endpoint);
    if (!metric) {
      metric = {
        totalCalls: 0,
        successfulCalls: 0,
        retriedCalls: 0,
        fallbackCalls: 0,
        totalDurationMs: 0,
        avgLatencyMs: 0,
        minLatencyMs: Infinity,
        maxLatencyMs: 0,
        errorCategoryBreakdown: {
          RATE_LIMIT_429: 0,
          UNAVAILABLE_503: 0,
          AUTH_OR_CONFIG: 0,
          INVALID_PAYLOAD: 0,
          JSON_PARSE_ERROR: 0,
          NETWORK_TIMEOUT: 0,
          UNKNOWN: 0,
        },
      };
      this.endpointMetrics.set(endpoint, metric);
    }
    return metric;
  }

  public classifyError(error: any): ErrorCategory {
    const msg = String(error?.message || error || '').toLowerCase();
    const status = error?.status || error?.statusCode;

    if (status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted')) {
      return 'RATE_LIMIT_429';
    }
    if (status === 503 || msg.includes('503') || msg.includes('unavailable') || msg.includes('high demand') || msg.includes('overloaded')) {
      return 'UNAVAILABLE_503';
    }
    if (status === 401 || status === 403 || msg.includes('api key') || msg.includes('unauthorized') || msg.includes('permission_denied')) {
      return 'AUTH_OR_CONFIG';
    }
    if (msg.includes('json') || msg.includes('unexpected token') || msg.includes('parse')) {
      return 'JSON_PARSE_ERROR';
    }
    if (msg.includes('timeout') || msg.includes('econnrefused') || msg.includes('fetch failed') || msg.includes('network')) {
      return 'NETWORK_TIMEOUT';
    }
    if (status === 400 || msg.includes('invalid_argument') || msg.includes('bad request')) {
      return 'INVALID_PAYLOAD';
    }
    return 'UNKNOWN';
  }

  public recordSuccess(params: {
    endpoint: string;
    model: string;
    attemptNumber: number;
    durationMs: number;
    meta?: Record<string, any>;
  }) {
    this.totalCalls++;
    this.successfulCalls++;
    this.totalLatencyMs += params.durationMs;

    const endpointMetric = this.getOrCreateEndpointMetric(params.endpoint);
    endpointMetric.totalCalls++;
    endpointMetric.successfulCalls++;
    endpointMetric.totalDurationMs += params.durationMs;
    endpointMetric.avgLatencyMs = Math.round(endpointMetric.totalDurationMs / endpointMetric.totalCalls);
    endpointMetric.minLatencyMs = Math.min(endpointMetric.minLatencyMs, params.durationMs);
    endpointMetric.maxLatencyMs = Math.max(endpointMetric.maxLatencyMs, params.durationMs);

    const logEntry: StructuredGeminiLog = {
      id: `gemini-log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      endpoint: params.endpoint,
      model: params.model,
      attemptNumber: params.attemptNumber,
      durationMs: params.durationMs,
      status: 'SUCCESS',
      meta: params.meta,
    };

    this.appendLog(logEntry);
    this.emitStructuredLog(logEntry);
  }

  public recordRetry(params: {
    endpoint: string;
    model: string;
    attemptNumber: number;
    durationMs: number;
    error: any;
    meta?: Record<string, any>;
  }) {
    this.retryAttempts++;
    const category = this.classifyError(params.error);
    this.errorBreakdown[category]++;

    const endpointMetric = this.getOrCreateEndpointMetric(params.endpoint);
    endpointMetric.retriedCalls++;
    endpointMetric.errorCategoryBreakdown[category]++;

    const logEntry: StructuredGeminiLog = {
      id: `gemini-log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      endpoint: params.endpoint,
      model: params.model,
      attemptNumber: params.attemptNumber,
      durationMs: params.durationMs,
      status: 'RETRYING',
      errorCategory: category,
      errorMessage: params.error?.message || String(params.error),
      meta: params.meta,
    };

    this.appendLog(logEntry);
    this.emitStructuredLog(logEntry);
  }

  public recordFallback(params: {
    endpoint: string;
    model: string;
    attemptNumber: number;
    durationMs: number;
    error: any;
    meta?: Record<string, any>;
  }) {
    this.totalCalls++;
    this.fallbackCount++;
    this.totalLatencyMs += params.durationMs;

    const category = this.classifyError(params.error);
    this.errorBreakdown[category]++;

    const endpointMetric = this.getOrCreateEndpointMetric(params.endpoint);
    endpointMetric.totalCalls++;
    endpointMetric.fallbackCalls++;
    endpointMetric.totalDurationMs += params.durationMs;
    endpointMetric.avgLatencyMs = Math.round(endpointMetric.totalDurationMs / endpointMetric.totalCalls);
    endpointMetric.errorCategoryBreakdown[category]++;

    const logEntry: StructuredGeminiLog = {
      id: `gemini-log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      endpoint: params.endpoint,
      model: params.model,
      attemptNumber: params.attemptNumber,
      durationMs: params.durationMs,
      status: 'FALLBACK_TRIGGERED',
      errorCategory: category,
      errorMessage: params.error?.message || String(params.error),
      meta: params.meta,
    };

    this.appendLog(logEntry);
    this.emitStructuredLog(logEntry);
  }

  private appendLog(log: StructuredGeminiLog) {
    this.logsBuffer.unshift(log);
    if (this.logsBuffer.length > MAX_LOG_BUFFER_SIZE) {
      this.logsBuffer.pop();
    }
  }

  private emitStructuredLog(log: StructuredGeminiLog) {
    const prefix = log.status === 'SUCCESS' ? '🟢 [GEMINI_OBSERVABILITY]' : log.status === 'RETRYING' ? '🟡 [GEMINI_OBSERVABILITY]' : '🔴 [GEMINI_OBSERVABILITY]';
    console.log(`${prefix} ${JSON.stringify(log)}`);
  }

  public getSnapshot() {
    const total = this.totalCalls;
    const fallbackRate = total > 0 ? Number(((this.fallbackCount / total) * 100).toFixed(1)) : 0;
    const failureRate = total > 0 ? Number((((this.fallbackCount + this.retryAttempts) / (total + this.retryAttempts)) * 100).toFixed(1)) : 0;
    const avgLatency = total > 0 ? Math.round(this.totalLatencyMs / total) : 0;

    const endpointsObj: Record<string, EndpointMetric> = {};
    this.endpointMetrics.forEach((metric, key) => {
      endpointsObj[key] = {
        ...metric,
        minLatencyMs: metric.minLatencyMs === Infinity ? 0 : metric.minLatencyMs,
      };
    });

    return {
      totalCalls: this.totalCalls,
      successfulCalls: this.successfulCalls,
      retryAttempts: this.retryAttempts,
      fallbackCount: this.fallbackCount,
      failureRatePercent: failureRate,
      fallbackRatePercent: fallbackRate,
      avgLatencyMs: avgLatency,
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      errorTypeBreakdown: { ...this.errorBreakdown },
      endpoints: endpointsObj,
      recentLogs: [...this.logsBuffer.slice(0, 30)],
    };
  }

  public reset() {
    this.totalCalls = 0;
    this.successfulCalls = 0;
    this.retryAttempts = 0;
    this.fallbackCount = 0;
    this.totalLatencyMs = 0;
    this.logsBuffer = [];
    this.endpointMetrics.clear();
    this.errorBreakdown = {
      RATE_LIMIT_429: 0,
      UNAVAILABLE_503: 0,
      AUTH_OR_CONFIG: 0,
      INVALID_PAYLOAD: 0,
      JSON_PARSE_ERROR: 0,
      NETWORK_TIMEOUT: 0,
      UNKNOWN: 0,
    };
  }
}

export const geminiMetrics = new GeminiMetricsCollector();

/**
 * Executes a Gemini API call wrapped in structured metrics, retry logging, and fallback tracing.
 */
export async function executeObservedGeminiCall<T>(params: {
  endpoint: string;
  model: string;
  action: () => Promise<T>;
  fallback: (err: any) => T;
  maxRetries?: number;
  initialDelayMs?: number;
  meta?: Record<string, any>;
}): Promise<T> {
  const {
    endpoint,
    model,
    action,
    fallback,
    maxRetries = 2,
    initialDelayMs = 150,
    meta,
  } = params;

  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt <= maxRetries) {
    attempt++;
    const callStart = Date.now();

    try {
      const result = await action();
      const durationMs = Date.now() - callStart;

      geminiMetrics.recordSuccess({
        endpoint,
        model,
        attemptNumber: attempt,
        durationMs,
        meta,
      });

      return result;
    } catch (error: any) {
      const durationMs = Date.now() - callStart;
      const isLastAttempt = attempt > maxRetries;
      const errorMsg = error?.message || String(error);

      const isTransient =
        errorMsg.includes("503") ||
        errorMsg.includes("UNAVAILABLE") ||
        errorMsg.includes("429") ||
        errorMsg.includes("high demand") ||
        errorMsg.includes("RESOURCE_EXHAUSTED") ||
        errorMsg.includes("fetch failed") ||
        errorMsg.includes("network") ||
        errorMsg.includes("timeout");

      if (!isLastAttempt && isTransient) {
        geminiMetrics.recordRetry({
          endpoint,
          model,
          attemptNumber: attempt,
          durationMs,
          error,
          meta,
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 1.8;
      } else {
        // Fallback triggered
        geminiMetrics.recordFallback({
          endpoint,
          model,
          attemptNumber: attempt,
          durationMs,
          error,
          meta,
        });

        return fallback(error);
      }
    }
  }

  return fallback(new Error("Max retries exceeded"));
}
