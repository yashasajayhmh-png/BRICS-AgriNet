/**
 * Offline Queue Orchestration Hook.
 * Manages optimistic local state, IndexedDB persistence, Web Locks concurrency, and network replay.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  QueueState,
  QueuedAction,
  CURRENT_QUEUE_SCHEMA_VERSION,
  enqueueAction,
  getNextPendingPerEntity,
  markInFlight,
  markSynced,
  markFailed,
  purgeSynced,
  OfflineActionType,
} from '../domain/offline/queue';
import {
  loadQueueFromIndexedDb,
  persistQueuedAction,
  savePhotoBlob,
  getPhotoBlob,
} from '../infrastructure/storage/indexedDbStorage';
import { executeWithExclusiveSyncLock } from '../infrastructure/sync/webLocksSync';

export interface UseOfflineQueueResult {
  queue: QueueState;
  pendingCount: number;
  deadLetterCount: number;
  isSyncing: boolean;
  enqueue: (params: {
    actionType: OfflineActionType;
    entityType: 'plot' | 'ticket' | 'diagnosis' | 'outbreak' | 'prescription';
    entityId: string;
    data: Record<string, unknown>;
    photoBlob?: Blob;
  }) => Promise<QueuedAction>;
  replayQueue: () => Promise<void>;
  clearSynced: () => Promise<void>;
  deadLetterItems: QueuedAction[];
}

export function useOfflineQueue(isOnline: boolean): UseOfflineQueueResult {
  const [queue, setQueue] = useState<QueueState>({
    version: CURRENT_QUEUE_SCHEMA_VERSION,
    items: [],
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const queueRef = useRef(queue);
  queueRef.current = queue;

  // Load from IndexedDB on initial mount
  useEffect(() => {
    let isMounted = true;
    loadQueueFromIndexedDb().then((loaded) => {
      if (isMounted) {
        setQueue(loaded);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const enqueue = useCallback(
    async (params: {
      actionType: OfflineActionType;
      entityType: 'plot' | 'ticket' | 'diagnosis' | 'outbreak' | 'prescription';
      entityId: string;
      data: Record<string, unknown>;
      photoBlob?: Blob;
    }): Promise<QueuedAction> => {
      let blobKey: string | undefined;

      // Persist binary Blob if present
      if (params.photoBlob) {
        blobKey = `blob-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        await savePhotoBlob(blobKey, params.photoBlob);
      }

      const generateId = () => `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const now = () => new Date();

      const { nextQueue, enqueuedItem } = enqueueAction(
        queueRef.current,
        {
          actionType: params.actionType,
          entityType: params.entityType,
          entityId: params.entityId,
          data: params.data,
          hasAttachmentBlob: Boolean(params.photoBlob),
          blobAttachmentKey: blobKey,
        },
        generateId,
        now
      );

      setQueue(nextQueue);
      await persistQueuedAction(enqueuedItem);
      return enqueuedItem;
    },
    []
  );

  const replayQueue = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    await executeWithExclusiveSyncLock(async () => {
      setIsSyncing(true);
      try {
        const actionableItems = getNextPendingPerEntity(queueRef.current);
        const now = () => new Date();

        for (const item of actionableItems) {
          // Transition to IN_FLIGHT
          let currentQueue = markInFlight(queueRef.current, item.id, now);
          setQueue(currentQueue);
          await persistQueuedAction(currentQueue.items.find((i) => i.id === item.id)!);

          try {
            // Prepare payload
            let postBody: Record<string, unknown> = { ...item.payload.data };

            // Attach photo blob as base64 or form if previously saved
            if (item.hasAttachmentBlob && item.blobAttachmentKey) {
              const blob = await getPhotoBlob(item.blobAttachmentKey);
              if (blob) {
                const buffer = await blob.arrayBuffer();
                const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
                postBody.imageBase64 = `data:${blob.type || 'image/jpeg'};base64,${base64}`;
              }
            }

            // Route to appropriate API endpoint based on actionType
            let endpoint = '/api/diagnose-crop';
            if (item.actionType === 'PLOT_TELEMETRY_UPDATE') endpoint = '/api/satellite-telemetry';
            else if (item.actionType === 'OUTBREAK_REPORT_SUBMIT') endpoint = '/api/outbreak-reports';

            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Idempotency-Key': item.payload.idempotencyKey,
              },
              body: JSON.stringify(postBody),
            });

            if (response.ok) {
              currentQueue = markSynced(queueRef.current, item.id, now);
              setQueue(currentQueue);
              await persistQueuedAction(currentQueue.items.find((i) => i.id === item.id)!);
            } else if (response.status === 422 || response.status === 400) {
              // Unrecoverable validation failure -> Dead Letter
              const errorText = await response.text();
              currentQueue = markFailed(queueRef.current, item.id, errorText, now, true);
              setQueue(currentQueue);
              await persistQueuedAction(currentQueue.items.find((i) => i.id === item.id)!);
            } else {
              // Transient server error
              currentQueue = markFailed(queueRef.current, item.id, `HTTP ${response.status}`, now, false);
              setQueue(currentQueue);
              await persistQueuedAction(currentQueue.items.find((i) => i.id === item.id)!);
            }
          } catch (networkErr: any) {
            currentQueue = markFailed(queueRef.current, item.id, networkErr?.message || 'Network error', now, false);
            setQueue(currentQueue);
            await persistQueuedAction(currentQueue.items.find((i) => i.id === item.id)!);
          }
        }
      } finally {
        setIsSyncing(false);
      }
    });
  }, [isOnline, isSyncing]);

  // Automatically trigger sync when transitioning to online
  useEffect(() => {
    if (isOnline) {
      const pending = queue.items.filter((i) => i.status === 'PENDING');
      if (pending.length > 0) {
        replayQueue();
      }
    }
  }, [isOnline, replayQueue, queue.items]);

  const clearSynced = useCallback(async () => {
    const next = purgeSynced(queueRef.current);
    setQueue(next);
  }, []);

  const pendingCount = queue.items.filter((i) => i.status === 'PENDING' || i.status === 'IN_FLIGHT').length;
  const deadLetterItems = queue.items.filter((i) => i.status === 'DEAD_LETTER');

  return {
    queue,
    pendingCount,
    deadLetterCount: deadLetterItems.length,
    isSyncing,
    enqueue,
    replayQueue,
    clearSynced,
    deadLetterItems,
  };
}
