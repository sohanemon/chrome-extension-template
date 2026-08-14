import { onMessage } from '../../lib/messaging';

console.info('background service worker running');

onMessage<'GET_TABS'>(async () => {
	const tabs = await chrome.tabs.query({});
	return { tabs };
});
