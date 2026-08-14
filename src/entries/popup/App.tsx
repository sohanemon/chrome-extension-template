import { Iconify } from '@sohanemon/utils/components';
import { Button } from '@/components/ui/button';
import { useStorage } from '../../hooks/use-storage';
import {
	openNewTab,
	openOptionsPage,
	openSidePanel,
} from '../../lib/extension';
import type { StorageSchema } from '../../types/storage.types';

interface NavItem {
	label: string;
	description: string;
	icon: string;
	action: () => Promise<void> | void;
}

export default function App() {
	const [count, setCount] = useStorage<StorageSchema, 'count'>(
		'sync',
		'count',
		0,
	);

	const navItems: NavItem[] = [
		{
			label: 'Options',
			description: 'Manage extension settings',
			icon: 'lucide:settings',
			action: openOptionsPage,
		},
		{
			label: 'Side Panel',
			description: 'Browse tabs alongside your page',
			icon: 'lucide:panel-left',
			action: openSidePanel,
		},
		{
			label: 'New Tab',
			description: 'Open the custom new tab page',
			icon: 'gridicons:external',
			action: openNewTab,
		},
	];

	const handleNavClick = (action: () => Promise<void> | void) => {
		Promise.resolve(action()).catch((err) =>
			console.error('Failed to open page:', err),
		);
	};

	return (
		<main className="flex flex-col gap-6 p-5">
			<div className="flex flex-col gap-1">
				<h1 className="text-lg font-semibold">Chrome Extension Template</h1>
				<p className="text-xs text-muted-foreground">
					A minimal MV3 starter — Vite, React, TypeScript, Tailwind CSS.
				</p>
			</div>

			<section className="flex flex-col items-center gap-4">
				<h2 className="text-sm font-medium">Shared Count</h2>
				<div className="flex items-center gap-3">
					<Button
						onClick={() => setCount((prev) => Math.max(0, prev - 1))}
						disabled={count === 0}
						size="icon"
						className="rounded border px-3 py-1 text-sm disabled:opacity-40"
					>
						-
					</Button>
					<span className="tabular-nums text-xl">{count}</span>
					<Button
						size="icon"
						type="button"
						onClick={() => setCount((prev) => prev + 1)}
						className="rounded border px-3 py-1 text-sm"
					>
						+
					</Button>
				</div>
				<p className="text-xs text-muted-foreground">
					Synced via chrome.storage.sync
				</p>
			</section>

			<section className="flex flex-col gap-2">
				<h2 className="text-sm font-medium">Explore</h2>
				{navItems.map((item) => (
					<button
						key={item.label}
						type="button"
						onClick={() => handleNavClick(item.action)}
						className="flex items-center gap-3 rounded border p-3 text-left transition-colors hover:bg-muted"
					>
						<span className="text-muted-foreground">
							<Iconify icon={item.icon} className="size-5" />
						</span>
						<div className="flex flex-col">
							<span className="font-medium">{item.label}</span>
							<span className="text-xs text-muted-foreground/90">
								{item.description}
							</span>
						</div>
					</button>
				))}
			</section>
		</main>
	);
}
