import { Iconify } from '@sohanemon/utils/components';

import { useChromeTabs } from '../../hooks/use-chrome-tabs';
import { closeSidePanel } from '../../lib/extension';

export default function App() {
	const tabs = useChromeTabs();

	const handleClose = () => {
		Promise.resolve(closeSidePanel()).catch((err) =>
			console.error('Failed to close side panel:', err),
		);
	};

	return (
		<main className="flex flex-col gap-4 p-4">
			<header className="flex items-center justify-between">
				<h1 className="text-base font-semibold">Side Panel</h1>
				<button
					type="button"
					onClick={handleClose}
					className="inline-flex items-center justify-center rounded border px-2 py-1 text-xs hover:bg-muted"
					aria-label="Close side panel"
				>
					<Iconify icon="lucide:x" className="size-4" />
				</button>
			</header>
			<ul className="flex flex-col gap-1.5">
				{tabs.map((tab) => (
					<li key={tab.id} className="truncate text-sm">
						{tab.title ?? tab.url}
					</li>
				))}
			</ul>
		</main>
	);
}
