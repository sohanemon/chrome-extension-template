import { useStorage } from '../../hooks/use-storage';
import type { StorageSchema } from '../../types/storage';

export default function App() {
	const [count] = useStorage<StorageSchema, 'count'>('sync', 'count', 0);

	return (
		<main className="flex flex-col items-center gap-4 p-6">
			<h1 className="text-lg font-semibold">DevTools</h1>
			<p className="text-sm">
				Shared count from popup:{' '}
				<span className="tabular-nums font-medium">{count}</span>
			</p>
		</main>
	);
}
