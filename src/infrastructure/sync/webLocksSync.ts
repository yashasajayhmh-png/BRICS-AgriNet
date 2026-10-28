/**
 * Multi-Tab Synchronization & Leader Election using the Web Locks API.
 * Ensures exactly one active tab processes the offline queue to prevent race conditions.
 */

const SYNC_LOCK_NAME = 'brics_agrinet_offline_sync_lock';

/**
 * Execute a synchronization job with an exclusive browser lock.
 * If another tab already holds the lock, this call awaits or returns false depending on mode.
 */
export async function executeWithExclusiveSyncLock<T>(
  syncWorkerFn: () => Promise<T>,
  options: { ifAvailable?: boolean } = { ifAvailable: true }
): Promise<T | null> {
  if (typeof navigator === 'undefined' || !navigator.locks) {
    // If Web Locks API is not supported (e.g. older browser or Node.js test environment), execute directly
    return syncWorkerFn();
  }

  return new Promise((resolve, reject) => {
    navigator.locks.request(
      SYNC_LOCK_NAME,
      { ifAvailable: options.ifAvailable },
      async (lock) => {
        if (!lock) {
          // Lock held by another tab; skip replay in this tab
          resolve(null);
          return;
        }

        try {
          const result = await syncWorkerFn();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}
