import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
	manifest_version: 3,
	name: 'Chrome Extension Template',
	version: '1.0.0',
	description: '',
	icons: {
		16: 'generated/icon-16.png',
		48: 'generated/icon-48.png',
		128: 'generated/icon-128.png',
	},
	action: {
		default_popup: 'index.html',
	},
	background: {
		service_worker: 'src/background.ts',
		type: 'module',
	},
	content_scripts: [
		{
			matches: ['<all_urls>'],
			js: ['src/content.ts'],
			run_at: 'document_idle',
		},
	],
	permissions: ['activeTab', 'scripting', 'downloads'],
});
