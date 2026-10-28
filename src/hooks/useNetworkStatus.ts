/**
 * Network Connectivity Hook with Hysteresis & Exponential Backoff + Jitter.
 * 
 * Invariants:
 * 1. Hysteresis: requires 3 consecutive failed heartbeat pings before declaring "OFFLINE",
 *    and 1 successful ping to declare "ONLINE" (eliminating edge-flakiness on rural cellular networks).
 * 2. Exponential backoff with random jitter on background pings to prevent battery drain.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  consecutiveFailures: number;
  lastCheckedAt: Date | null;
  latencyMs: number | null;
  manualCheck: () => Promise<boolean>;
}

const FAILURE_THRESHOLD = 3;
const BASE_PING_DELAY_MS = 8000;
const MAX_PING_DELAY_MS = 60000;

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const failureCountRef = useRef(0);
  const delayRef = useRef(BASE_PING_DELAY_MS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const pingServer = useCallback(async (): Promise<boolean> => {
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch('/api/health/live', {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const elapsed = Math.round(performance.now() - startTime);

      if (res.ok) {
        failureCountRef.current = 0;
        setConsecutiveFailures(0);
        setIsOnline(true);
        setLatencyMs(elapsed);
        setLastCheckedAt(new Date());
        delayRef.current = BASE_PING_DELAY_MS;
        return true;
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      failureCountRef.current += 1;
      const count = failureCountRef.current;
      setConsecutiveFailures(count);
      setLastCheckedAt(new Date());
      setLatencyMs(null);

      if (count >= FAILURE_THRESHOLD) {
        setIsOnline(false);
      }

      // Exponential backoff with random jitter (+/- 20%)
      const nextDelay = Math.min(MAX_PING_DELAY_MS, delayRef.current * 1.5);
      const jitter = (Math.random() * 0.4 - 0.2) * nextDelay;
      delayRef.current = Math.round(nextDelay + jitter);

      return false;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBrowserOnline = () => {
      // Browser reports network interface connected: verify immediately
      pingServer();
    };

    const handleBrowserOffline = () => {
      failureCountRef.current = FAILURE_THRESHOLD;
      setConsecutiveFailures(FAILURE_THRESHOLD);
      setIsOnline(false);
    };

    window.addEventListener('online', handleBrowserOnline);
    window.addEventListener('offline', handleBrowserOffline);

    // Recursive schedule with backoff
    let isMounted = true;
    const scheduleNextPing = () => {
      if (!isMounted) return;
      timerRef.current = setTimeout(async () => {
        if (!isMounted) return;
        await pingServer();
        scheduleNextPing();
      }, delayRef.current);
    };

    scheduleNextPing();

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleBrowserOnline);
      window.removeEventListener('offline', handleBrowserOffline);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pingServer]);

  return {
    isOnline,
    consecutiveFailures,
    lastCheckedAt,
    latencyMs,
    manualCheck: pingServer,
  };
}
