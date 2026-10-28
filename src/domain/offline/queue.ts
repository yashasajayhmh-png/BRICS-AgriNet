/**
 * Pure Offline Domain Module: Sync Queue Ordering, Retry Policies, and Conflict Resolution.
 * 
 * Invariants:
 * 1. Pure state transitions: (CurrentQueue, Event) => NextQueue.
 * 2. Per-entity isolation: Items targeting different entity IDs can be replayed in parallel.
 * 3. Max retry limit (default: 5) transitions failed actions to DEAD_LETTER status.
 * 4. Injected Clock & ID Generator: No direct Date.now() or crypto.randomUUID().
 * 5. Strict Conflict Resolution: NO last-write-wins for prescriptions or escalated tickets.
 */

export type OfflineActionType =
  | 'DIAGNOSIS_SUBMIT'
  | 'ADVISORY_REQUEST'
  | 'PLOT_TELEMETRY_UPDATE'
  | 'OUTBREAK_REPORT_SUBMIT'
  | 'PRESCRIPTION_APPROVE';

export type QueueItemStatus = 'PENDING' | 'IN_FLIGHT' | 'FAILED' | 'DEAD_LETTER' | 'SYNCED';

export type ConflictStrategy = 'MANUAL_REVIEW' | 'CLIENT_WINS' | 'SERVER_WINS' | 'TIMESTAMP_MONOTONIC';

export interface OfflineActionPayload {
  entityType: 'plot' | 'ticket' | 'diagnosis' | 'outbreak' | 'prescription';
  entityId: string;
  data: Record<string, unknown>;
  idempotencyKey: string;
  clientTimestampIso: string;
}

export interface QueuedAction {
  id: string;
  actionType: OfflineActionType;
  entityType: 'plot' | 'ticket' | 'diagnosis' | 'outbreak' | 'prescription';
  entityId: string;
  payload: OfflineActionPayload;
  status: QueueItemStatus;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  createdAtIso: string;
  updatedAtIso: string;
  conflictStrategy: ConflictStrategy;
  hasAttachmentBlob?: boolean;
  blobAttachmentKey?: string;
}

export interface QueueState {
  version: number;
  items: QueuedAction[];
}

export const CURRENT_QUEUE_SCHEMA_VERSION = 1;
export const DEFAULT_MAX_RETRIES = 5;

/**
 * Determine conflict resolution policy per action type.
 * Prescriptions and tickets must NEVER use last-write-wins!
 */
export function getConflictStrategyForAction(type: OfflineActionType): ConflictStrategy {
  switch (type) {
    case 'PRESCRIPTION_APPROVE':
    case 'DIAGNOSIS_SUBMIT':
      return 'MANUAL_REVIEW'; // Safety-critical agronomy decisions
    case 'PLOT_TELEMETRY_UPDATE':
      return 'TIMESTAMP_MONOTONIC'; // Reject if timestamp is older
    case 'OUTBREAK_REPORT_SUBMIT':
      return 'CLIENT_WINS'; // Field observations append without overwriting
    case 'ADVISORY_REQUEST':
    default:
      return 'CLIENT_WINS';
  }
}

/**
 * Pure enqueue function
 */
export function enqueueAction(
  queue: QueueState,
  action: {
    actionType: OfflineActionType;
    entityType: 'plot' | 'ticket' | 'diagnosis' | 'outbreak' | 'prescription';
    entityId: string;
    data: Record<string, unknown>;
    hasAttachmentBlob?: boolean;
    blobAttachmentKey?: string;
  },
  generateId: () => string,
  now: () => Date
): { nextQueue: QueueState; enqueuedItem: QueuedAction } {
  const timestamp = now().toISOString();
  const id = generateId();
  const idempotencyKey = `agrinet-idem-${id}`;

  const newItem: QueuedAction = {
    id,
    actionType: action.actionType,
    entityType: action.entityType,
    entityId: action.entityId,
    payload: {
      entityType: action.entityType,
      entityId: action.entityId,
      data: action.data,
      idempotencyKey,
      clientTimestampIso: timestamp,
    },
    status: 'PENDING',
    retryCount: 0,
    maxRetries: DEFAULT_MAX_RETRIES,
    createdAtIso: timestamp,
    updatedAtIso: timestamp,
    conflictStrategy: getConflictStrategyForAction(action.actionType),
    hasAttachmentBlob: action.hasAttachmentBlob ?? false,
    blobAttachmentKey: action.blobAttachmentKey,
  };

  return {
    nextQueue: {
      ...queue,
      items: [...queue.items, newItem],
    },
    enqueuedItem: newItem,
  };
}

/**
 * Returns actionable items grouped by entityId to ensure per-entity FIFO
 * without blocking across unrelated entities.
 */
export function getNextPendingPerEntity(queue: QueueState): QueuedAction[] {
  const pending = queue.items.filter((i) => i.status === 'PENDING');
  const seenEntities = new Set<string>();
  const ready: QueuedAction[] = [];

  for (const item of pending) {
    const key = `${item.entityType}:${item.entityId}`;
    if (!seenEntities.has(key)) {
      seenEntities.add(key);
      ready.push(item);
    }
  }

  return ready;
}

/**
 * Transitions item to IN_FLIGHT
 */
export function markInFlight(
  queue: QueueState,
  itemId: string,
  now: () => Date
): QueueState {
  const timestamp = now().toISOString();
  return {
    ...queue,
    items: queue.items.map((i) =>
      i.id === itemId
        ? { ...i, status: 'IN_FLIGHT', updatedAtIso: timestamp }
        : i
    ),
  };
}

/**
 * Marks item as successfully synced
 */
export function markSynced(
  queue: QueueState,
  itemId: string,
  now: () => Date
): QueueState {
  const timestamp = now().toISOString();
  return {
    ...queue,
    items: queue.items.map((i) =>
      i.id === itemId
        ? { ...i, status: 'SYNCED', updatedAtIso: timestamp }
        : i
    ),
  };
}

/**
 * Marks item as failed with retry counter increment.
 * Transitions to DEAD_LETTER if maxRetries reached or unrecoverable error.
 */
export function markFailed(
  queue: QueueState,
  itemId: string,
  errorMessage: string,
  now: () => Date,
  isPermanentRejection = false
): QueueState {
  const timestamp = now().toISOString();
  return {
    ...queue,
    items: queue.items.map((i) => {
      if (i.id !== itemId) return i;
      const nextRetries = i.retryCount + 1;
      const shouldDeadLetter = isPermanentRejection || nextRetries >= i.maxRetries;

      return {
        ...i,
        status: shouldDeadLetter ? 'DEAD_LETTER' : 'FAILED',
        retryCount: nextRetries,
        lastError: errorMessage,
        updatedAtIso: timestamp,
      };
    }),
  };
}

/**
 * Reset failed items back to PENDING for a retry pass
 */
export function resetFailedToPending(queue: QueueState, now: () => Date): QueueState {
  const timestamp = now().toISOString();
  return {
    ...queue,
    items: queue.items.map((i) =>
      i.status === 'FAILED'
        ? { ...i, status: 'PENDING', updatedAtIso: timestamp }
        : i
    ),
  };
}

/**
 * Purges synced items
 */
export function purgeSynced(queue: QueueState): QueueState {
  return {
    ...queue,
    items: queue.items.filter((i) => i.status !== 'SYNCED'),
  };
}
