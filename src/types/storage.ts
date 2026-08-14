/**
 * Shared storage schema. Keys live in `chrome.storage.sync` (default) or
 * `chrome.storage.local`; the typed helpers in `src/lib/storage.ts` constrain
 * reads and writes to this shape.
 */
export interface StorageSchema {
	count: number;
}
