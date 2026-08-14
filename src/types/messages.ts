/**
 * Shared message/event contract for all extension surfaces (background,
 * content, popup, options).
 *
 * Extend `MessageMap` with new request/response pairs. `Message` and
 * `ResponseOf` are derived so every `sendMessage`/`onMessage` call stays typed
 * without a manual union to maintain.
 */
export interface MessageMap {
	COUNT: { type: 'COUNT'; count: number };
	GET_TABS: { type: 'GET_TABS' };
}

export type MessageType = keyof MessageMap;

/** The request payload for a message type. */
export type Message<T extends MessageType> = MessageMap[T];

/** The response payload for a message type. */
export type ResponseOf<T extends MessageType> = T extends keyof ResponseMap
	? ResponseMap[T]
	: undefined;

export interface ResponseMap {
	COUNT: undefined;
	GET_TABS: { tabs: chrome.tabs.Tab[] };
}
