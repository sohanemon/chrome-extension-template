import tailwindcss from '@tailwindcss/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
	plugins: [
		viteReact({
			// @ts-expect-error https://react.dev/learn/react-compiler/installation#vite
			babel: {
				plugins: ['babel-plugin-react-compiler'],
			},
		}),
		tailwindcss(),
		viteStaticCopy({
			targets: [{ src: 'public/manifest.json', dest: '.' }],
		}),
	],
	build: {
		outDir: 'build',
		rollupOptions: {
			input: {
				main: './index.html',
				background: './src/background.ts',
				content: './src/content.ts',
			},
			output: {
				entryFileNames: (chunkInfo) => {
					if (chunkInfo.name === 'background') return 'background.js';
					if (chunkInfo.name === 'content') return 'content.js';
					return 'assets/[name]-[hash].js';
				},
			},
		},
	},
});
