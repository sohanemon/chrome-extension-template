import { Iconify } from '@sohanemon/utils/components';
import { Button } from '@/components/ui/button';
import { useChromeTabs } from '../../hooks/use-chrome-tabs';
import { closeSidePanel } from '../../lib/extension';

export default function App() {
	const tabs = useChromeTabs();

	return (
		<main className="flex flex-col gap-4 p-4">
			<header className="flex items-center justify-between">
				<h1 className="text-base font-semibold">Side Panel</h1>
				<Button
					onClick={closeSidePanel}
					size="icon"
					variant="outline"
					aria-label="Close side panel"
				>
					<Iconify icon="lucide:x" className="size-4" />
				</Button>
			</header>
			<ul className="flex flex-col gap-1.5">
				{tabs.map((tab) => (
					<li
						key={tab.id}
						className="truncate text-sm items-center flex gap-2 "
					>
						<Iconify icon="gridicons:external" className="size-4 shrink-0" />
						{tab.title ?? tab.url}
					</li>
				))}
			</ul>
		</main>
	);
}
