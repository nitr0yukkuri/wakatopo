import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const workflow = readFileSync(resolve('.github/workflows/update-weather.yml'), 'utf8');
const publisher = readFileSync(resolve('scripts/publish_weather_assets.sh'), 'utf8');
const packageJson = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));

const fail = (message) => {
  console.error('workflow safety test failed: ' + message);
  process.exitCode = 1;
};

const expectIncludes = (source, needle, message) => {
  if (!source.includes(needle)) {
    fail(message);
  }
};

const expectBefore = (source, first, second, message) => {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);

  if (firstIndex === -1 || secondIndex === -1 || firstIndex >= secondIndex) {
    fail(message);
  }
};

expectIncludes(workflow, 'pull_request:', 'workflow changes must be checked on pull requests.');
expectIncludes(workflow, 'verify-workflow:', 'pull requests must run the workflow safety check.');
expectIncludes(workflow, "if: github.event_name == 'pull_request'", 'the verification job must run for pull requests.');
expectIncludes(workflow, "if: github.event_name != 'pull_request'", 'GIF generation and publishing must be skipped for pull requests.');
expectIncludes(workflow, 'run: npm run test:workflow', 'the pull request job must run the workflow safety check.');
expectIncludes(packageJson.scripts['test:workflow'], 'node scripts/test_weather_asset_publisher.mjs', 'the workflow test command must run the publisher integration test.');
expectIncludes(workflow, 'scripts/test_weather_asset_publisher.mjs', 'changes to the publisher integration test must trigger pull request verification.');
expectIncludes(workflow, 'scripts/publish_weather_assets.sh', 'changes to the publisher script must trigger pull request verification.');
expectIncludes(workflow, "node-version: '22.23.4'", 'the updater must use the patched Node.js runtime.');
expectIncludes(workflow, 'group: update-live-weather-gif', 'only one weather asset update should publish at a time.');
expectIncludes(workflow, 'cancel-in-progress: false', 'a newer trigger must not cancel an in-progress publisher.');
expectIncludes(workflow, 'run: bash scripts/publish_weather_assets.sh preview.gif', 'the workflow must run the tested publisher script.');

expectIncludes(publisher, 'asset_branch="preview-assets"', 'preview-assets branch name must stay explicit.');
expectIncludes(publisher, 'cp "$gif_path" "$tmp_dir/preview.gif"', 'preview.gif must be copied before switching branches.');
expectIncludes(publisher, 'rm -f "$gif_path"', 'the generated GIF must be removed before switching branches.');
expectBefore(publisher, 'cp "$gif_path" "$tmp_dir/preview.gif"', 'rm -f "$gif_path"', 'preview.gif must be saved before it is removed.');
expectBefore(publisher, 'rm -f "$gif_path"', 'git ls-remote', 'the generated GIF must be removed before inspecting or switching branches.');

expectIncludes(publisher, 'publish_attempts=3', 'branch publication must have a bounded retry count.');
expectIncludes(publisher, 'git ls-remote --exit-code --heads origin "$asset_branch"', 'branch absence must be distinguished from a network or fetch error.');
expectIncludes(publisher, 'git fetch --no-tags --depth=1 origin "+$asset_ref:refs/remotes/origin/$asset_branch"', 'the publisher must fetch only the current asset-branch tip.');
expectIncludes(publisher, 'for asset in preview.gif index.html package.json vercel.json; do', 'unchanged detection must cover every published file.');
expectIncludes(publisher, 'git show "$remote_sha:$asset"', 'unchanged detection must compare against the fetched remote tip.');
expectIncludes(publisher, 'cmp --silent "$tmp_dir/$asset" "$current_file"', 'unchanged detection must compare actual file contents.');
expectIncludes(publisher, 'git switch --orphan "$publish_branch"', 'a missing asset branch must be initialized as an orphan branch.');
expectIncludes(publisher, 'git push origin "HEAD:$asset_ref"', 'publication must use a normal fast-forward push.');
expectBefore(publisher, 'git ls-remote', 'git fetch --no-tags --depth=1', 'the remote branch must be confirmed before fetching it.');
expectBefore(publisher, 'git fetch --no-tags --depth=1', 'git push origin "HEAD:$asset_ref"', 'the current remote tip must be fetched before pushing.');
expectIncludes(publisher, 'Asset branch changed during publish; refreshing it before retry.', 'push conflicts must refresh the remote branch and retry.');
if (publisher.includes('git fetch origin "$ASSET_BRANCH" || true')) {
  fail('fetch failures must never be ignored.');
}
if (publisher.includes('git push --force')) {
  fail('the publisher must not force-push the asset branch.');
}

expectIncludes(publisher, '"private": true', 'preview-assets package.json should remain minimal.');
if (publisher.includes('"vercel-build"')) {
  fail('preview-assets package.json must not define vercel-build.');
}
expectIncludes(publisher, '"framework": null', 'preview-assets must disable Vercel framework detection.');
expectIncludes(publisher, '"installCommand": ""', 'preview-assets must skip dependency installation.');
expectIncludes(publisher, '"buildCommand": null', 'preview-assets must not run a Next.js build.');
expectIncludes(publisher, '"outputDirectory": "."', 'preview-assets must serve static files from the branch root.');

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('update-weather workflow safety checks passed.');
