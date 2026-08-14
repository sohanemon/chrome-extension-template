import type { Message, MessageType, ResponseOf } from '../types/messages';

// INFO: Chrome's sendMessage returns Promise<any>; this cast restores type safety.
export function sendMessage<T extends MessageType>(
	message: Message<T>,
): Promise<ResponseOf<T>> {
	return chrome.runtime.sendMessage(message) as Promise<ResponseOf<T>>;
}

export function sendTabMessage<T extends MessageType>(
	tabId: number,
	message: Message<T>,
): Promise<ResponseOf<T>> {
	return chrome.tabs.sendMessage(tabId, message) as Promise<ResponseOf<T>>;
}

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
			return true; // INFO: Keep the channel open so Chrome waits for the async response.
		}
		sendResponse(result);
		return undefined;
	};
	chrome.runtime.onMessage.addListener(handler as never);
	return () => chrome.runtime.onMessage.removeListener(handler as never);
}
