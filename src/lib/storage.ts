/**
 * Typed wrapper around `chrome.storage` with Promise-based get/set/remove.
 *
 * The generic `T` describes the full shape of a storage area. Keys are
 * constrained to `keyof T` so reads and writes stay consistent with the
 * shared types in `src/types`. Chrome's own typings are cast once, at the
 * boundary, to keep call sites clean.
 */
export type StorageArea = chrome.storage.AreaName;

export interface StorageChange<T> {
	oldValue?: T;
	newValue?: T;
}

interface ChromeStore {
	get(
		keys?: string | string[] | Record<string, unknown> | null,
	): Promise<Record<string, unknown>>;
	set(items: Record<string, unknown>): Promise<void>;
	remove(keys: string | string[]): Promise<void>;
	clear(): Promise<void>;
}

const area = (name: StorageArea): ChromeStore =>
	chrome.storage[name] as unknown as ChromeStore;

/** Read a single key. */
export async function getItem<T, K extends keyof T>(
	areaName: StorageArea,
	key: K,
): Promise<T[K] | undefined> {
	const result = await area(areaName).get(key as string);
	return result[key as string] as T[K] | undefined;
}

/** Read several keys. Returns only the keys that were found. */
export async function getItems<T, K extends keyof T>(
	areaName: StorageArea,
	keys: K[],
): Promise<Partial<T>> {
	return area(areaName).get(keys as string[]) as Promise<Partial<T>>;
}

/** Read the entire storage area. */
export async function getAll<T>(areaName: StorageArea): Promise<T> {
	return area(areaName).get(null) as Promise<T>;
}

/** Write a partial object. */
export async function setItems<T>(
	areaName: StorageArea,
	items: Partial<T>,
): Promise<void> {
	await area(areaName).set(items as Record<string, unknown>);
}

/** Remove one or more keys. */
export async function removeItems<T>(
	areaName: StorageArea,
	keys: keyof T | Array<keyof T>,
): Promise<void> {
	await area(areaName).remove(keys as string | string[]);
}

/** Clear the entire storage area. */
export async function clearArea(areaName: StorageArea): Promise<void> {
	await area(areaName).clear();
}

/** Subscribe to changes for a single key. Returns an unsubscribe function. */
export function watchItem<T, K extends keyof T>(
	areaName: StorageArea,
	key: K,
	listener: (change: StorageChange<T[K]>, area: StorageArea) => void,
): () => void {
	const handler = (
		changes: { [key: string]: chrome.storage.StorageChange },
		changedArea: chrome.storage.AreaName,
	) => {
		if (changedArea !== areaName) return;
		const change = changes[key as string];
		if (change) listener(change as StorageChange<T[K]>, changedArea);
	};
	chrome.storage.onChanged.addListener(handler);
	return () => chrome.storage.onChanged.removeListener(handler);
}

/** Subscribe to all changes in an area. Returns an unsubscribe function. */
export function watchArea<T>(
	areaName: StorageArea,
	listener: (
		changes: Partial<Record<keyof T, StorageChange<T[keyof T]>>>,
		area: StorageArea,
	) => void,
): () => void {
	const handler = (
		changes: { [key: string]: chrome.storage.StorageChange },
		changedArea: chrome.storage.AreaName,
	) => {
		if (changedArea !== areaName) return;
		listener(
			changes as Partial<Record<keyof T, StorageChange<T[keyof T]>>>,
			changedArea,
		);
	};
	chrome.storage.onChanged.addListener(handler);
	return () => chrome.storage.onChanged.removeListener(handler);
}
