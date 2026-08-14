// INFO: Cast Chrome's loosely-typed storage API once at the boundary so call sites stay type-safe.
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

export async function getItem<T, K extends keyof T>(
	areaName: StorageArea,
	key: K,
): Promise<T[K] | undefined> {
	const result = await area(areaName).get(key as string);
	return result[key as string] as T[K] | undefined;
}

export async function getItems<T, K extends keyof T>(
	areaName: StorageArea,
	keys: K[],
): Promise<Partial<T>> {
	return area(areaName).get(keys as string[]) as Promise<Partial<T>>;
}

export async function getAll<T>(areaName: StorageArea): Promise<T> {
	return area(areaName).get(null) as Promise<T>;
}

export async function setItems<T>(
	areaName: StorageArea,
	items: Partial<T>,
): Promise<void> {
	await area(areaName).set(items as Record<string, unknown>);
}

export async function removeItems<T>(
	areaName: StorageArea,
	keys: keyof T | Array<keyof T>,
): Promise<void> {
	await area(areaName).remove(keys as string | string[]);
}

export async function clearArea(areaName: StorageArea): Promise<void> {
	await area(areaName).clear();
}

// INFO: Returns an unsubscribe function; call it on unmount to prevent stale-listener leaks.
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

// INFO: Returns an unsubscribe function; call it on unmount to prevent stale-listener leaks.
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
