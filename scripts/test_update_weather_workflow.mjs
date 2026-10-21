import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const workflowPath = resolve('.github/workflows/update-weather.yml');
const workflow = readFileSync(workflowPath, 'utf8');

const fail = (message) => {
  console.error('workflow safety test failed: ' + message);
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

expectIncludes('pull_request:', 'workflow changes must be checked on pull requests.');
expectIncludes('verify-workflow:', 'pull requests must run the workflow safety check.');
expectIncludes("if: github.event_name == 'pull_request'", 'the verification job must run for pull requests.');
expectIncludes("if: github.event_name != 'pull_request'", 'GIF generation and publishing must be skipped for pull requests.');
expectIncludes('run: npm run test:workflow', 'the pull request job must run the workflow safety check.');
expectIncludes("node-version: '22.23.4'", 'the updater must use the patched Node.js runtime.');
expectIncludes('group: update-live-weather-gif', 'only one weather asset update should publish at a time.');
expectIncludes('cancel-in-progress: false', 'a newer trigger must not cancel an in-progress publisher.');

expectIncludes('asset_branch="preview-assets"', 'preview-assets branch name must stay explicit.');
expectIncludes('cp preview.gif "$TMP_DIR/preview.gif"', 'preview.gif must be copied before switching branches.');
expectIncludes('rm -f preview.gif', 'the generated GIF must be removed before switching branches.');
expectBefore('cp preview.gif "$TMP_DIR/preview.gif"', 'rm -f preview.gif', 'preview.gif must be saved before it is removed.');
expectBefore('rm -f preview.gif', 'git ls-remote', 'the generated GIF must be removed before inspecting or switching branches.');

expectIncludes('publish_attempts=3', 'branch publication must have a bounded retry count.');
expectIncludes('git ls-remote --exit-code --heads origin "$asset_branch"', 'branch absence must be distinguished from a network or fetch error.');
expectIncludes('git fetch --no-tags --depth=1 origin "+$asset_ref:refs/remotes/origin/$asset_branch"', 'the publisher must fetch only the current asset-branch tip.');
expectIncludes('for asset in preview.gif index.html package.json vercel.json; do', 'unchanged detection must cover every published file.');
expectIncludes('git show "$remote_sha:$asset"', 'unchanged detection must compare against the fetched remote tip.');
expectIncludes('cmp --silent "$TMP_DIR/$asset" "$CURRENT_FILE"', 'unchanged detection must compare actual file contents.');
expectIncludes('git switch --orphan "$publish_branch"', 'a missing asset branch must be initialized as an orphan branch.');
expectIncludes('git push origin "HEAD:$asset_ref"', 'publication must use a normal fast-forward push.');
expectBefore('git ls-remote', 'git fetch --no-tags --depth=1', 'the remote branch must be confirmed before fetching it.');
expectBefore('git fetch --no-tags --depth=1', 'git push origin "HEAD:$asset_ref"', 'the current remote tip must be fetched before pushing.');
expectIncludes('Asset branch changed during publish; refreshing it before retry.', 'push conflicts must refresh the remote branch and retry.');
if (workflow.includes('git fetch origin "$ASSET_BRANCH" || true')) {
  fail('fetch failures must never be ignored.');
}
if (workflow.includes('git push --force')) {
  fail('the publisher must not force-push the asset branch.');
}

expectIncludes("cat > \\\"$TMP_DIR/package.json\\\" <<'JSON'", 'preview-assets package.json must be generated intentionally.');
expectIncludes('"private": true', 'preview-assets package.json should remain minimal.');
if (workflow.includes('"vercel-build"')) {
  fail('preview-assets package.json must not define vercel-build.');
}

expectIncludes("cat > \\\"$TMP_DIR/vercel.json\\\" <<'JSON'", 'preview-assets vercel.json must be generated intentionally.');
expectIncludes('"framework": null', 'preview-assets must disable Vercel framework detection.');
expectIncludes('"installCommand": ""', 'preview-assets must skip dependency installation.');
expectIncludes('"buildCommand": null', 'preview-assets must not run a Next.js build.');
expectIncludes('"outputDirectory": "."', 'preview-assets must serve static files from the branch root.');

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('update-weather workflow safety checks passed.');
