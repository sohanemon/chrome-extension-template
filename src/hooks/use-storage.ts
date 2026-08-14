import { useCallback, useEffect, useState } from 'react';
import type { StorageArea } from '../lib/storage';
import { getItem, setItems, watchItem } from '../lib/storage';

// INFO: Keeps React state in sync with chrome.storage, including external changes via storage.onChanged.
export function useStorage<T, K extends keyof T>(
	areaName: StorageArea,
	key: K,
	initialValue: T[K],
) {
	const [value, setValue] = useState<T[K]>(initialValue);

	useEffect(() => {
		let mounted = true;
		void getItem<T, K>(areaName, key).then((stored) => {
			if (mounted && stored !== undefined) setValue(stored);
		});
		const unsubscribe = watchItem<T, K>(areaName, key, (change) => {
			if (change.newValue !== undefined) setValue(change.newValue);
		});
		return () => {
			mounted = false;
			unsubscribe();
		};
	}, [areaName, key]);

	const update = useCallback(
		(next: T[K] | ((prev: T[K]) => T[K])) => {
			setValue((prev) => {
				const resolved =
					typeof next === 'function' ? (next as (p: T[K]) => T[K])(prev) : next;
				void setItems<T>(areaName, {
					[key]: resolved,
				} as unknown as Partial<T>);
				return resolved;
			});
		},
		[areaName, key],
	);

	return [value, update] as const;
}
