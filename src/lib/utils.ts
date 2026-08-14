/**
 * Merge class names with Tailwind conflict resolution.
 * Re-exports `cn` from `@sohanemon/utils` so entries and shared components have
 * a single import path.
 */
export { cn } from '@sohanemon/utils';

/** True when running in the extension's background service worker. */
export const isBackground = typeof window === 'undefined';

/** True when the current page is an extension page (popup/options). */
export const isExtensionPage = /^chrome-extension:/.test(location.protocol);
