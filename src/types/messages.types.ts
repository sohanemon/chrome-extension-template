// INFO: Derived from MessageMap so sendMessage/onMessage stay type-safe without a manual union.
export interface MessageMap {
	COUNT: { payload: { count: number }; response: undefined };
	GET_TABS: { payload: undefined; response: { tabs: chrome.tabs.Tab[] } };
}

export type MessageType = keyof MessageMap;

export type Message<T extends MessageType = MessageType> = {
	[K in T]: { type: K; payload: MessageMap[K]['payload'] };
}[T];

export type ResponseOf<T extends MessageType> = MessageMap[T]['response'];
