/**
 * IndexedDB Storage Adapter for BRICS AgriNet using `idb`.
 * Provides resilient offline persistence for action queues, telemetry caches, and native binary photo Blobs.
 * 
 * Features:
 * 1. Native Blob storage for high-resolution crop disease photos.
 * 2. Automatic persistent storage negotiation via navigator.storage.persist().
 * 3. Graceful QuotaExceededError recovery with LRU cache pruning.
 * 4. Schema versioning and migration path.
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { QueuedAction, QueueState, CURRENT_QUEUE_SCHEMA_VERSION } from '../../domain/offline/queue';

interface AgriNetDBSchema extends DBSchema {
  offline_actions: {
    key: string;
    value: QueuedAction;
    indexes: {
      'by-status': string;
      'by-entity': string;
      'by-created': string;
    };
  };
  field_photos: {
    key: string;
    value: {
      blobKey: string;
      mimeType: string;
      photoBlob: Blob;
      storedAtIso: string;
      sizeBytes: number;
    };
    indexes: {
      'by-stored': string;
    };
  };
  cached_telemetry: {
    key: string;
    value: {
      key: string;
      data: any;
      cachedAtIso: string;
      expiresAtIso: string;
    };
  };
}

const DB_NAME = 'brics_agrinet_offline_v1';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<AgriNetDBSchema>> | null = null;

export async function getOfflineDB(): Promise<IDBPDatabase<AgriNetDBSchema>> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB is not supported in this environment');
  }

  if (!dbPromise) {
    dbPromise = openDB<AgriNetDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          // Store 1: Offline mutations queue
          const actionStore = db.createObjectStore('offline_actions', { keyPath: 'id' });
          actionStore.createIndex('by-status', 'status');
          actionStore.createIndex('by-entity', 'entityId');
          actionStore.createIndex('by-created', 'createdAtIso');

          // Store 2: Native binary Blob storage for diagnostic crop images
          const photoStore = db.createObjectStore('field_photos', { keyPath: 'blobKey' });
          photoStore.createIndex('by-stored', 'storedAtIso');

          // Store 3: Cached offline telemetry and advisories
          db.createObjectStore('cached_telemetry', { keyPath: 'key' });
        }
      },
    });

    // Request persistent storage to reduce browser eviction risk
    requestStoragePersistence().catch(() => {});
  }

  return dbPromise;
}

/**
 * Request navigator.storage.persist() to prevent browser from silently purging offline queue under disk pressure.
 */
export async function requestStoragePersistence(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      return isPersisted;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Handle QuotaExceededError by pruning old telemetry caches and cached images.
 */
async function pruneCacheOnQuotaExceeded(db: IDBPDatabase<AgriNetDBSchema>): Promise<void> {
  try {
    // Clear expired telemetry caches first
    const tx = db.transaction('cached_telemetry', 'readwrite');
    await tx.objectStore('cached_telemetry').clear();
    await tx.done;

    // Prune oldest 20 field photos if still pressured
    const photoTx = db.transaction('field_photos', 'readwrite');
    const index = photoTx.objectStore('field_photos').index('by-stored');
    let cursor = await index.openCursor();
    let count = 0;
    while (cursor && count < 20) {
      await cursor.delete();
      count++;
      cursor = await cursor.continue();
    }
    await photoTx.done;
  } catch (err) {
    console.warn('Failed to prune cache on quota exceeded:', err);
  }
}

/**
 * Persist an action to the IndexedDB queue
 */
export async function persistQueuedAction(action: QueuedAction): Promise<void> {
  const db = await getOfflineDB();
  try {
    await db.put('offline_actions', action);
  } catch (error: any) {
    if (error?.name === 'QuotaExceededError') {
      await pruneCacheOnQuotaExceeded(db);
      await db.put('offline_actions', action);
    } else {
      throw error;
    }
  }
}

/**
 * Load all queued actions
 */
export async function loadQueueFromIndexedDb(): Promise<QueueState> {
  try {
    const db = await getOfflineDB();
    const items = await db.getAll('offline_actions');
    return {
      version: CURRENT_QUEUE_SCHEMA_VERSION,
      items: items || [],
    };
  } catch (err) {
    console.warn('Failed to load queue from IndexedDB, falling back to empty queue:', err);
    return {
      version: CURRENT_QUEUE_SCHEMA_VERSION,
      items: [],
    };
  }
}

/**
 * Remove an action from the queue by ID
 */
export async function removeQueuedAction(id: string): Promise<void> {
  const db = await getOfflineDB();
  await db.delete('offline_actions', id);
}

/**
 * Save native image Blob into IndexedDB
 */
export async function savePhotoBlob(blobKey: string, blob: Blob): Promise<void> {
  const db = await getOfflineDB();
  const entry = {
    blobKey,
    mimeType: blob.type || 'image/jpeg',
    photoBlob: blob,
    storedAtIso: new Date().toISOString(),
    sizeBytes: blob.size,
  };

  try {
    await db.put('field_photos', entry);
  } catch (error: any) {
    if (error?.name === 'QuotaExceededError') {
      await pruneCacheOnQuotaExceeded(db);
      await db.put('field_photos', entry);
    } else {
      throw error;
    }
  }
}

/**
 * Retrieve native image Blob by key
 */
export async function getPhotoBlob(blobKey: string): Promise<Blob | null> {
  try {
    const db = await getOfflineDB();
    const entry = await db.get('field_photos', blobKey);
    return entry ? entry.photoBlob : null;
  } catch {
    return null;
  }
}

/**
 * Wipe all offline queue stores on explicit user logout for security
 */
export async function wipeOfflineQueueOnLogout(): Promise<void> {
  try {
    const db = await getOfflineDB();
    const tx = db.transaction(['offline_actions', 'field_photos', 'cached_telemetry'], 'readwrite');
    await tx.objectStore('offline_actions').clear();
    await tx.objectStore('field_photos').clear();
    await tx.objectStore('cached_telemetry').clear();
    await tx.done;
  } catch (err) {
    console.warn('Error wiping offline storage on logout:', err);
  }
}
