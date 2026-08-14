// INFO: Re-export cn to give entries and shared components a single import path.
export { cn } from '@sohanemon/utils';

// INFO: Background service workers lack a window object, so this check identifies that context.
export const isBackground = typeof window === 'undefined';

// INFO: Detects chrome-extension: protocol so shared code can branch on UI vs. web context.
export const isExtensionPage = /^chrome-extension:/.test(location.protocol);
