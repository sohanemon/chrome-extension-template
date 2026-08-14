import type { Message, MessageType, ResponseOf } from '../types/messages';

/**
 * Send a message to the extension runtime and await its response.
 *
 * `chrome.runtime.sendMessage` routes to the background service worker (and any
 * listener in an extension page). Casts through `unknown` because Chrome's
 * typings return `Promise<any>`.
 */
export function sendMessage<T extends MessageType>(
	message: Message<T>,
): Promise<ResponseOf<T>> {
	return chrome.runtime.sendMessage(message) as Promise<ResponseOf<T>>;
}

/**
 * Send a message to the content script of a specific tab.
 */
export function sendTabMessage<T extends MessageType>(
	tabId: number,
	message: Message<T>,
): Promise<ResponseOf<T>> {
	return chrome.tabs.sendMessage(tabId, message) as Promise<ResponseOf<T>>;
}

/**
 * Register a background listener that handles a typed request/response cycle.
 * Return `undefined` when the message is not yours.
 */
export function onMessage<T extends MessageType>(
	listener: (
		message: Message<T>,
		sender: chrome.runtime.MessageSender,
	) => ResponseOf<T> | undefined | Promise<ResponseOf<T> | undefined>,
): () => void {
	const handler = (
		message: Message<T>,
		sender: chrome.runtime.MessageSender,
		sendResponse: (response?: unknown) => void,
	): boolean | undefined => {
		const result = listener(message, sender);
		if (result instanceof Promise) {
			void result.then(sendResponse);
			return true; // keep the channel open for the async response
		}
		sendResponse(result);
		return undefined;
	};
	chrome.runtime.onMessage.addListener(handler as never);
	return () => chrome.runtime.onMessage.removeListener(handler as never);
}
