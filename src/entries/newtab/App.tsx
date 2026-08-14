import { useStorage } from '../../hooks/use-storage';
import type { StorageSchema } from '../../types/storage.types';

export default function App() {
	const [count] = useStorage<StorageSchema, 'count'>('sync', 'count', 0);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
			<h1 className="text-2xl font-semibold">New Tab</h1>
			<p className="text-sm">
				Shared count: <span className="tabular-nums font-medium">{count}</span>
			</p>
		</main>
	);
}
