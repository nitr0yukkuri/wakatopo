import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Work around OpenNext #1394 only in the generated standalone output. Never
// externalize sharp: a native module cannot be loaded by workerd at runtime.
const build = JSON.parse(await readFile('.next/required-server-files.json', 'utf8'));
if (build.config.images?.unoptimized !== true) {
    throw new Error('The Cloudflare sharp workaround requires images.unoptimized=true');
}

const standalone = path.resolve('.next/standalone');
const targets = [];
async function findNextPackages(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const child = path.join(directory, entry.name);
        if (entry.name === 'next' && path.basename(directory) === 'node_modules') {
            targets.push(path.join(child, 'dist/server/image-optimizer/transform.js'));
        } else {
            await findNextPackages(child);
        }
    }
}
await findNextPackages(standalone);
if (targets.length !== 1) throw new Error(`Expected one standalone Next package, found ${targets.length}`);

const file = targets[0];
const source = await readFile(file, 'utf8');
const requireSharp = /require\(['"]sharp['"]\)/g;
if ([...source.matchAll(requireSharp)].length !== 1) {
    throw new Error('Next image optimizer changed; review the Cloudflare sharp workaround');
}
await writeFile(file, source.replace(requireSharp, `(() => {
    throw new Error('Native image optimization is disabled in this Cloudflare build');
})()`));
console.log('Excluded unused native image optimization from the Cloudflare standalone build.');
