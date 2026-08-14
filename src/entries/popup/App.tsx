import { useStorage } from '../../hooks/use-storage';
import type { StorageSchema } from '../../types/storage';

export default function App() {
	const [count, setCount] = useStorage<StorageSchema, 'count'>(
		'sync',
		'count',
		0,
	);

	return (
		<main className="flex flex-col items-center gap-4 p-6">
			<h1 className="text-lg font-semibold">Popup</h1>
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={() => setCount((prev) => Math.max(0, prev - 1))}
					disabled={count === 0}
					className="rounded border px-3 py-1 disabled:opacity-40"
				>
					-
				</button>
				<span className="tabular-nums text-xl">{count}</span>
				<button
					type="button"
					onClick={() => setCount((prev) => prev + 1)}
					className="rounded border px-3 py-1"
				>
					+
				</button>
			</div>
		</main>
	);
}
