import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const PROJECT_ROOT = process.cwd();
const GENERATED_DIR = path.join(PROJECT_ROOT, 'src', 'lib', 'generated');
const METADATA_FILE = path.join(GENERATED_DIR, 'icons-spec.gen.ts');
const EXCLUDED_DIRS = new Set(['node_modules', 'dist', 'generated', '.git']);
const EXCLUDED_FILES = new Set([
	path.join(PROJECT_ROOT, 'lib', 'scripts', 'extract-icons.ts'),
	GENERATED_DIR,
]);

// INFO: matches provider:name icon strings e.g. "lucide:arrow-right"
const ICON_STRING_RE = /['"`]([\w-]+):([\w-]+)['"`]/g;

// False-positive providers (Tailwind breakpoints, states, etc.)
const BLOCKLISTED_PROVIDERS = new Set([
	'sm',
	'md',
	'lg',
	'xl',
	'2xl',
	'3xl',
	'4xl',
	'max-sm',
	'max-md',
	'max-lg',
	'max-xl',
	'max-2xl',
	'max-3xl',
	'max-4xl',
	'hover',
	'focus',
	'focus-visible',
	'focus-within',
	'active',
	'disabled',
	'group-hover',
	'group-focus',
	'group-focus-within',
	'peer-checked',
	'peer-focus',
	'dark',
	'light',
	'motion-safe',
	'motion-reduce',
	'print',
	'portrait',
	'landscape',
	'rtl',
	'ltr',
	'screen',
	'placeholder',
	'selection',
	'marker',
	'backdrop',
	'before',
	'after',
	'first',
	'last',
	'odd',
	'even',
	'visited',
	'checked',
	'indeterminate',
	'required',
	'valid',
	'invalid',
	'not',
	'has',
	'where',
	'is',
]);

// False-positive icon names (CSS pseudo-classes caught as names)
const BLOCKLISTED_NAMES = new Set([
	'hover',
	'focus',
	'focus-visible',
	'focus-within',
	'active',
	'visited',
	'disabled',
	'checked',
	'before',
	'after',
	'first-child',
	'last-child',
	'nth-child',
	'nth-of-type',
	'first-of-type',
	'last-of-type',
	'only-child',
	'only-of-type',
	'placeholder-shown',
	'autofill',
]);

// NOTE: strategy triggers
const ICON_PROP_REG = /icon[=:]/g;
const ICON_COMMENT_REG = /\/\/ @icon/g;

interface Icon {
	provider: string;
	name: string;
}

function* walk(dir: string): Generator<string> {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.resolve(dir, entry.name);
		if (entry.isDirectory()) {
			if (!EXCLUDED_DIRS.has(entry.name)) yield* walk(fullPath);
		} else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
			yield fullPath;
		}
	}
}

function extractIconsFromSlice(
	slice: string,
	iconMap: Map<string, Icon>,
): void {
	for (const [, provider, name] of slice.matchAll(
		new RegExp(ICON_STRING_RE.source, 'g'),
	)) {
		if (
			provider &&
			name &&
			!BLOCKLISTED_PROVIDERS.has(provider) &&
			!BLOCKLISTED_NAMES.has(name)
		) {
			const key = `${provider}:${name}`;
			iconMap.set(key, { provider, name });
		}
	}
}

const OPENER_TO_CLOSER: Record<string, string> = {
	'{': '}',
	'(': ')',
	'[': ']',
};
const CLOSER_TO_OPENER: Record<string, string> = {
	'}': '{',
	')': '(',
	']': '[',
};

function extractOuterBlock(content: string, startIndex: number): string {
	// walk backward from startIndex to find the enclosing opener
	let openIdx = -1;
	let openCh = '';
	// track depth by closer character (}, ), ])
	const depth: Record<string, number> = { '}': 0, ')': 0, ']': 0 };
	for (let i = startIndex; i >= 0; i--) {
		const ch = content[i];
		if (ch in CLOSER_TO_OPENER) depth[ch]++; // encountered closer going backward → nested block
		if (ch in OPENER_TO_CLOSER) depth[OPENER_TO_CLOSER[ch]]--; // encountered opener → exiting nested block

		for (const [closeCh, d] of Object.entries(depth)) {
			if (d < 0) {
				openIdx = i;
				openCh = CLOSER_TO_OPENER[closeCh];
				break;
			}
		}
		if (openIdx !== -1) break;
	}
	if (openIdx === -1) return '';

	// walk forward to match the corresponding closer
	let bal = 0;
	for (let i = openIdx; i < content.length; i++) {
		if (content[i] === openCh) bal++;
		if (content[i] === OPENER_TO_CLOSER[openCh]) bal--;
		if (bal === 0) return content.slice(openIdx, i + 1);
	}
	return '';
}

function extractIconsFromFile(
	content: string,
	iconMap: Map<string, Icon>,
): void {
	// NOTE: strategy 1: scan 200 chars after `icon=` / `icon:` props
	for (const { index } of content.matchAll(
		new RegExp(ICON_PROP_REG.source, 'g'),
	)) {
		extractIconsFromSlice(content.slice(index, index + 200), iconMap);
	}

	// NOTE: strategy 2: scan enclosing `{...}` block around `// @icon` comments
	for (const { index } of content.matchAll(
		new RegExp(ICON_COMMENT_REG.source, 'g'),
	)) {
		const block = extractOuterBlock(content, index);
		if (block) extractIconsFromSlice(block, iconMap);
	}
}

async function fetchProviderMetadata(
	provider: string,
	names: string[],
): Promise<{
	provider: string;
	names: string[];
	success: boolean;
	data?: unknown;
	error?: string;
}> {
	try {
		const url = new URL(`https://api.iconify.design/${provider}.json`);
		url.searchParams.set('icons', names.join(','));

		const res = await fetch(url);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();

		if (data === 404 || data === '404') {
			throw new Error('Provider not found');
		}

		return { provider, names, success: true, data };
	} catch (error) {
		return { provider, names, success: false, error: String(error) };
	}
}

async function extractIcons(): Promise<void> {
	const iconMap = new Map<string, Icon>();
	let filesScanned = 0;

	for (const file of walk(PROJECT_ROOT)) {
		if (EXCLUDED_FILES.has(file) || file.startsWith(GENERATED_DIR + path.sep)) {
			continue;
		}
		filesScanned++;
		extractIconsFromFile(fs.readFileSync(file, 'utf-8'), iconMap);
	}

	const icons = [...iconMap.values()].sort((a, b) =>
		`${a.provider}:${a.name}`.localeCompare(`${b.provider}:${b.name}`),
	);

	if (icons.length === 0) {
		console.log('No icons found.');
		return;
	}

	fs.mkdirSync(GENERATED_DIR, { recursive: true });

	const byProvider = Map.groupBy(icons, ({ provider }) => provider);
	const providerCount = byProvider.size;
	const totalIcons = icons.length;

	console.log(
		`\n🔍 Found ${totalIcons} unique icons across ${providerCount} providers (scanned ${filesScanned} files)\n`,
	);

	const results = await Promise.all(
		[...byProvider.entries()].map(([provider, entries]) =>
			fetchProviderMetadata(
				provider,
				entries.map(({ name }) => name),
			),
		),
	);

	const successful = results.filter((r) => r.success);
	const failed = results.filter((r) => !r.success);

	console.log('📦 Provider Results:\n');
	for (const r of results) {
		const count = r.names.length;
		const status = r.success ? '✅' : '❌';
		console.log(
			`  ${status} ${r.provider}: ${count} icons${r.error ? ` (${r.error})` : ''}`,
		);
	}

	console.log(`\n📊 Summary:`);
	console.log(`  • Total: ${totalIcons} icons from ${providerCount} providers`);
	console.log(`  • Success: ${successful.length} providers`);
	if (failed.length > 0) {
		console.log(`  • Failed: ${failed.length} providers`);
		for (const f of failed) {
			console.log(`    - ${f.provider}: ${f.error}`);
		}
	}

	const metadata = successful.map((r) => r.data);

	const metadataContent = [
		'// This file is auto-generated by lib/scripts/extract-icons.ts',
		'',
		`export const iconsMetadata = ${JSON.stringify(metadata, null, 2)} as const;`,
		'',
	].join('\n');

	fs.writeFileSync(METADATA_FILE, metadataContent);
	console.log(`\n✓ Written to ${path.relative(PROJECT_ROOT, METADATA_FILE)}`);
}

extractIcons().catch((error) => {
	console.error('\n❌ Error:', error);
	process.exitCode = 1;
});
