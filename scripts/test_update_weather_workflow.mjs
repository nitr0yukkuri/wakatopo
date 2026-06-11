import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const workflowPath = resolve('.github/workflows/update-weather.yml');
const workflow = readFileSync(workflowPath, 'utf8');

const fail = (message) => {
  console.error(`workflow safety test failed: ${message}`);
  process.exitCode = 1;
};

const expectIncludes = (needle, message) => {
  if (!workflow.includes(needle)) {
    fail(message);
  }
};

const expectBefore = (first, second, message) => {
  const firstIndex = workflow.indexOf(first);
  const secondIndex = workflow.indexOf(second);

  if (firstIndex === -1 || secondIndex === -1 || firstIndex >= secondIndex) {
    fail(message);
  }
};

expectIncludes('ASSET_BRANCH="preview-assets"', 'preview-assets branch name must stay explicit.');
expectIncludes('cp preview.gif "$TMP_DIR/preview.gif"', 'preview.gif must be copied to a temp directory before switching branches.');
expectIncludes('rm -f preview.gif', 'preview.gif must be removed before switching to preview-assets.');
expectBefore('cp preview.gif "$TMP_DIR/preview.gif"', 'rm -f preview.gif', 'preview.gif must be saved before it is removed.');
expectBefore('rm -f preview.gif', 'git fetch origin "$ASSET_BRANCH"', 'untracked preview.gif must be removed before fetching/switching the asset branch.');
expectBefore('rm -f preview.gif', 'git switch --force-create "$ASSET_BRANCH"', 'untracked preview.gif must be removed before switching to preview-assets.');

expectIncludes('cat > package.json <<\'JSON\'', 'preview-assets package.json must be generated intentionally.');
expectIncludes('"private": true', 'preview-assets package.json should remain minimal.');
if (workflow.includes('"vercel-build"')) {
  fail('preview-assets package.json must not define vercel-build.');
}

expectIncludes('cat > vercel.json <<\'JSON\'', 'preview-assets vercel.json must be generated intentionally.');
expectIncludes('"framework": null', 'preview-assets must disable Vercel framework detection.');
expectIncludes('"installCommand": ""', 'preview-assets must skip dependency installation.');
expectIncludes('"buildCommand": null', 'preview-assets must not run a Next.js build.');
expectIncludes('"outputDirectory": "."', 'preview-assets must serve static files from the branch root.');

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('update-weather workflow safety checks passed.');
