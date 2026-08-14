// INFO: Centralised helpers for opening extension entry points from UI surfaces
// like the popup. Each function maps to a page declared in manifest.config.ts.

// INFO: Opens the options page declared via options_ui in the manifest.
export async function openOptionsPage(): Promise<void> {
	await chrome.runtime.openOptionsPage();
}

// INFO: Opens the side panel for the active tab (requires the "sidePanel" permission).
export async function openSidePanel(): Promise<void> {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (!tab?.id) {
		throw new Error('No active tab to attach the side panel to.');
	}
	await chrome.sidePanel.open({ tabId: tab.id });
}

// INFO: Opens the New Tab override page in a new tab.
export async function openNewTab(): Promise<void> {
	await chrome.tabs.create({
		url: chrome.runtime.getURL('src/entries/newtab/index.html'),
	});
}
// INFO: Closes the extension's side panel for the current window (requires "sidePanel" permission).
export async function closeSidePanel(): Promise<void> {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (!tab?.windowId) {
		throw new Error(
			'No active tab to determine the window for closing the side panel.',
		);
	}
	await chrome.sidePanel.close({ windowId: tab.windowId });
}
