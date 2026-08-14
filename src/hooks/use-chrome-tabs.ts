import { useEffect, useState } from 'react';

// INFO: Subscribes to chrome.tabs lifecycle events so the tab list stays reactive across window changes.
export function useChromeTabs() {
	const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);

	useEffect(() => {
		let mounted = true;

		const refresh = () => {
			chrome.tabs.query({ currentWindow: true }).then((found) => {
				if (mounted) setTabs(found);
			});
		};

		refresh();

		const handleCreated = () => refresh();
		const handleRemoved = () => refresh();
		const handleUpdated = () => refresh();

		chrome.tabs.onCreated.addListener(handleCreated);
		chrome.tabs.onRemoved.addListener(handleRemoved);
		chrome.tabs.onUpdated.addListener(handleUpdated);

		return () => {
			mounted = false;
			chrome.tabs.onCreated.removeListener(handleCreated);
			chrome.tabs.onRemoved.removeListener(handleRemoved);
			chrome.tabs.onUpdated.removeListener(handleUpdated);
		};
	}, []);

	return tabs;
}
