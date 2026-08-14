import { useChromeTabs } from '../../hooks/use-chrome-tabs';

export default function App() {
	const tabs = useChromeTabs();

	return (
		<main className="p-8">
			<h1 className="mb-4 text-lg font-semibold">Options</h1>
			<ul className="flex flex-col gap-2">
				{tabs.map((tab) => (
					<li key={tab.id} className="truncate text-sm">
						{tab.title ?? tab.url}
					</li>
				))}
			</ul>
		</main>
	);
}
