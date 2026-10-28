/**
 * Pure Offline Queue State Transition Tests.
 * 
 * Verifies:
 * 1. Queue initialization & deterministic enqueueing with injected ID generator and clock.
 * 2. Per-entity FIFO concurrency (unrelated entities can be processed without blocking).
 * 3. Dead-Letter Queue (DLQ) state transition after 5 failed retries or unrecoverable error.
 * 4. Conflict strategy determination (verifying NO Last-Write-Wins for prescriptions).
 */

import { describe, it, expect } from 'vitest';
import {
  QueueState,
  CURRENT_QUEUE_SCHEMA_VERSION,
  enqueueAction,
  getNextPendingPerEntity,
  markInFlight,
  markSynced,
  markFailed,
  purgeSynced,
  getConflictStrategyForAction,
} from '../../src/domain/offline/queue';

describe('Pure Offline Queue Domain Transitions', () => {
  const mockNow = () => new Date('2026-10-28T12:00:00.000Z');
  let idCounter = 1;
  const mockGenerateId = () => `act-${idCounter++}`;

  const createEmptyQueue = (): QueueState => ({
    version: CURRENT_QUEUE_SCHEMA_VERSION,
    items: [],
  });

  it('enqueues actions with deterministic ID, idempotencyKey, and injected timestamp', () => {
    const queue = createEmptyQueue();
    const { nextQueue, enqueuedItem } = enqueueAction(
      queue,
      {
        actionType: 'DIAGNOSIS_SUBMIT',
        entityType: 'diagnosis',
        entityId: 'diag-99',
        data: { leafColor: 'yellow', crop: 'wheat' },
      },
      mockGenerateId,
      mockNow
    );

    expect(nextQueue.items.length).toBe(1);
    expect(enqueuedItem.status).toBe('PENDING');
    expect(enqueuedItem.retryCount).toBe(0);
    expect(enqueuedItem.payload.idempotencyKey).toBe(`agrinet-idem-${enqueuedItem.id}`);
    expect(enqueuedItem.createdAtIso).toBe('2026-10-28T12:00:00.000Z');
    expect(enqueuedItem.conflictStrategy).toBe('MANUAL_REVIEW');
  });

  it('provides per-entity concurrency without cross-blocking unrelated plots', () => {
    let queue = createEmptyQueue();

    // Plot 1 Action 1 (e.g. soil update)
    queue = enqueueAction(
      queue,
      { actionType: 'PLOT_TELEMETRY_UPDATE', entityType: 'plot', entityId: 'plot-1', data: { moisture: 0.3 } },
      () => 'p1-a1',
      mockNow
    ).nextQueue;

    // Plot 1 Action 2 (subsequent update for same plot)
    queue = enqueueAction(
      queue,
      { actionType: 'PLOT_TELEMETRY_UPDATE', entityType: 'plot', entityId: 'plot-1', data: { moisture: 0.35 } },
      () => 'p1-a2',
      mockNow
    ).nextQueue;

    // Plot 2 Action 1 (unrelated plot)
    queue = enqueueAction(
      queue,
      { actionType: 'PLOT_TELEMETRY_UPDATE', entityType: 'plot', entityId: 'plot-2', data: { moisture: 0.45 } },
      () => 'p2-a1',
      mockNow
    ).nextQueue;

    // Should return head of Plot 1 and head of Plot 2, but NOT Plot 1 Action 2 yet
    const pendingPerEntity = getNextPendingPerEntity(queue);
    expect(pendingPerEntity.length).toBe(2);
    expect(pendingPerEntity.map((i) => i.id)).toEqual(['p1-a1', 'p2-a1']);
  });

  it('transitions to DEAD_LETTER when retries reach maxRetries limit', () => {
    let queue = createEmptyQueue();
    const { nextQueue, enqueuedItem } = enqueueAction(
      queue,
      { actionType: 'OUTBREAK_REPORT_SUBMIT', entityType: 'outbreak', entityId: 'out-01', data: {} },
      () => 'out-act',
      mockNow
    );
    queue = nextQueue;

    // 4 transient failures
    for (let i = 1; i <= 4; i++) {
      queue = markInFlight(queue, enqueuedItem.id, mockNow);
      queue = markFailed(queue, enqueuedItem.id, `503 Service Unavailable (${i})`, mockNow, false);
      const item = queue.items[0];
      expect(item.status).toBe('FAILED');
      expect(item.retryCount).toBe(i);
    }

    // 5th failure: exceeds maxRetries (5) -> DEAD_LETTER
    queue = markInFlight(queue, enqueuedItem.id, mockNow);
    queue = markFailed(queue, enqueuedItem.id, '503 Service Unavailable (5)', mockNow, false);
    expect(queue.items[0].status).toBe('DEAD_LETTER');
    expect(queue.items[0].retryCount).toBe(5);
  });

  it('transitions to DEAD_LETTER immediately upon permanent unrecoverable rejection (e.g. 422)', () => {
    let queue = createEmptyQueue();
    const { nextQueue, enqueuedItem } = enqueueAction(
      queue,
      { actionType: 'PRESCRIPTION_APPROVE', entityType: 'prescription', entityId: 'rx-01', data: {} },
      () => 'rx-act',
      mockNow
    );
    queue = nextQueue;

    queue = markFailed(queue, enqueuedItem.id, '422 Unprocessable Entity: Invalid Dosage', mockNow, true);
    expect(queue.items[0].status).toBe('DEAD_LETTER');
    expect(queue.items[0].retryCount).toBe(1);
  });

  it('purges only SYNCED items while preserving PENDING and DEAD_LETTER', () => {
    let queue = createEmptyQueue();
    queue = enqueueAction(queue, { actionType: 'ADVISORY_REQUEST', entityType: 'plot', entityId: 'p-1', data: {} }, () => 'i1', mockNow).nextQueue;
    queue = enqueueAction(queue, { actionType: 'ADVISORY_REQUEST', entityType: 'plot', entityId: 'p-2', data: {} }, () => 'i2', mockNow).nextQueue;

    // Mark i1 synced
    queue = markSynced(queue, 'i1', mockNow);
    // Mark i2 failed permanent
    queue = markFailed(queue, 'i2', 'error', mockNow, true);

    const purged = purgeSynced(queue);
    expect(purged.items.length).toBe(1);
    expect(purged.items[0].id).toBe('i2');
    expect(purged.items[0].status).toBe('DEAD_LETTER');
  });

  it('enforces safety-critical conflict policies: prescriptions and diagnosis must use MANUAL_REVIEW', () => {
    expect(getConflictStrategyForAction('PRESCRIPTION_APPROVE')).toBe('MANUAL_REVIEW');
    expect(getConflictStrategyForAction('DIAGNOSIS_SUBMIT')).toBe('MANUAL_REVIEW');
    expect(getConflictStrategyForAction('PLOT_TELEMETRY_UPDATE')).toBe('TIMESTAMP_MONOTONIC');
  });
});
