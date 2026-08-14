import { crx } from '@crxjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import zip from 'vite-plugin-zip-pack';
import manifest from './manifest.config';

export default defineConfig({
	plugins: [
		viteReact({
			// @ts-expect-error https://react.dev/learn/react-compiler/installation#vite
			babel: {
				plugins: ['babel-plugin-react-compiler'],
			},
		}),
		tailwindcss(),
		crx({ manifest }),
		zip({ outDir: 'release', outFileName: 'release.zip' }),
	],
	server: {
		cors: {
			origin: [/chrome-extension:\/\//],
		},
	},
});
