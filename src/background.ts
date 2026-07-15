chrome.runtime.onInstalled.addListener(() => {
	console.log('Chrome extension template installed');
});

chrome.action.onClicked.addListener((tab) => {
	console.log('Chrome extension template icon clicked', tab);
});
