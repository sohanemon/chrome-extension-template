import { defineManifest } from '@crxjs/vite-plugin';
import { description, displayName, name, version } from './package.json';

const isDev = process.env.NODE_ENV == 'development';

export default defineManifest({
	name: `${displayName ?? name}${isDev ? ' (dev)' : ''}`,
	manifest_version: 3,
	version,
	description,
	action: {
		default_popup: 'src/entries/popup/index.html',
		default_icon: 'generated/icon-48.png',
	},
	options_ui: {
		page: 'src/entries/options/index.html',
		open_in_tab: true,
	},
	background: {
		service_worker: 'src/entries/background/index.ts',
		type: 'module',
	},
	content_scripts: [
		{
			matches: ['<all_urls>'],
			js: ['src/entries/content/index.ts'],
			run_at: 'document_idle',
		},
	],
	permissions: ['activeTab', 'storage', 'scripting', 'tabs', 'downloads'],
	icons: {
		16: 'generated/icon-16.png',
		48: 'generated/icon-48.png',
		128: 'generated/icon-128.png',
	},
	web_accessible_resources: [
		{
			resources: [
				'generated/icon-16.png',
				'generated/icon-48.png',
				'generated/icon-128.png',
			],
			matches: [],
		},
	],
});
