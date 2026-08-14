// INFO: Derived from MessageMap so sendMessage/onMessage stay type-safe without a manual union.
export interface MessageMap {
	COUNT: { type: 'COUNT'; count: number };
	GET_TABS: { type: 'GET_TABS' };
}

export type MessageType = keyof MessageMap;

export type Message<T extends MessageType> = MessageMap[T];

export type ResponseOf<T extends MessageType> = T extends keyof ResponseMap
	? ResponseMap[T]
	: undefined;

export interface ResponseMap {
	COUNT: undefined;
	GET_TABS: { tabs: chrome.tabs.Tab[] };
}
