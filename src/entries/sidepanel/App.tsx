import { useChromeTabs } from '../../hooks/use-chrome-tabs';

export default function App() {
	const tabs = useChromeTabs();

	return (
		<main className="flex flex-col gap-3 p-4">
			<h1 className="text-base font-semibold">Side Panel</h1>
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
