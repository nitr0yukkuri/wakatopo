import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isSameWeatherPreviewState, parseWeatherPreviewState, serializeWeatherPreviewState } from './weather_preview_state.mjs';

const updateWorkflow = readFileSync(resolve('.github/workflows/update-weather.yml'), 'utf8');
const recoveryWorkflow = readFileSync(resolve('.github/workflows/recover-weather-gif.yml'), 'utf8');
const captureScript = readFileSync(resolve('scripts/update_weather_gif.mjs'), 'utf8');

const current = parseWeatherPreviewState(
  '<html><main data-preview-weather="Rain" data-world-weather="Rain" data-world-season="autumn" data-world-season-event="none">',
  'abc123',
);

assert.deepEqual(current, {
  version: 1,
  sourceRevision: 'abc123',
  weather: 'Rain',
  visualWeather: 'Rain',
  season: 'autumn',
  seasonEvent: 'none',
});
assert.equal(isSameWeatherPreviewState(current, { ...current }), true);
assert.equal(isSameWeatherPreviewState(current, { ...current, sourceRevision: 'def456' }), false);
assert.equal(isSameWeatherPreviewState(current, { ...current, seasonEvent: 'fireworks' }), false);
assert.equal(isSameWeatherPreviewState(current, { ...current, version: 0 }), false);
assert.equal(JSON.parse(serializeWeatherPreviewState(current)).weather, 'Rain');
assert.throws(() => parseWeatherPreviewState('<html><body>No card</body></html>', 'abc123'), /main element/);
assert.throws(() => parseWeatherPreviewState('<main data-preview-weather="Rain"></main>', 'abc123'), /data-world-weather/);

const fail = (message) => {
  console.error(`workflow safety test failed: ${message}`);
  process.exitCode = 1;
};

const expectIncludes = (text, needle, message) => {
  if (!text.includes(needle)) fail(message);
};

const expectBefore = (text, first, second, message) => {
  const firstIndex = text.indexOf(first);
  const secondIndex = text.indexOf(second);
  if (firstIndex === -1 || secondIndex === -1 || firstIndex >= secondIndex) fail(message);
};

expectIncludes(updateWorkflow, "refs/heads/preview-assets:refs/remotes/origin/preview-assets", 'previous state must come from preview-assets.');
expectIncludes(updateWorkflow, 'git fetch --depth=1', 'read only the latest preview state instead of the full asset branch history.');
expectIncludes(updateWorkflow, "WEATHER_PREVIOUS_STATE_FILE", 'capture must receive the previous-state file path.');
expectIncludes(updateWorkflow, 'WEATHER_SOURCE_REVISION: ${{ github.sha }}', 'source changes must invalidate the previous render state.');
expectIncludes(updateWorkflow, "if: github.ref == 'refs/heads/main' && github.event_name != 'pull_request' && steps.capture.outputs.skip != 'true'", 'only changed main captures may publish assets.');
expectIncludes(updateWorkflow, "github.ref == 'refs/heads/main'", 'only main may publish to the assets branch.');
expectIncludes(updateWorkflow, 'force:', 'manual refresh override must remain available.');
expectIncludes(updateWorkflow, "cancel-in-progress: true", 'newer captures must replace an outdated active capture.');
expectIncludes(captureScript, "http://127.0.0.1:3000/card", 'automation must render the local app instead of relying on the public domain.');
expectIncludes(captureScript, 'AbortSignal.timeout(60_000)', 'allow the local route to finish its server-rendered weather fetch before aborting.');
expectIncludes(captureScript, 'isSameWeatherPreviewState(currentState, previousState)', 'unchanged preview state must skip recording.');
expectIncludes(captureScript, "await rename(generatedGif, resolve(root, 'preview.gif'))", 'GIF must be published only after validation.');
expectBefore(captureScript, 'await runCapture', "await rename(generatedGif, resolve(root, 'preview.gif'))", 'GIF validation must happen before replacing output assets.');
expectIncludes(updateWorkflow, 'ASSET_BRANCH', 'preview-assets branch name must stay explicit.');
expectIncludes(updateWorkflow, "git add preview.gif preview-state.json index.html package.json vercel.json", 'asset branch must include the state and static hosting files.');
expectIncludes(updateWorkflow, '"installCommand": ""', 'preview-assets must skip dependency installation.');
expectIncludes(updateWorkflow, '"buildCommand": null', 'preview-assets must not run a Next.js build.');
expectIncludes(updateWorkflow, '"outputDirectory": "."', 'preview-assets must serve static files from the branch root.');
expectBefore(updateWorkflow, 'Record and validate weather GIF', 'Commit GIF to assets branch', 'asset branch must only be changed after recording and validation.');

expectIncludes(recoveryWorkflow, 'workflow_run:', 'recovery must watch the update workflow completion event.');
expectIncludes(recoveryWorkflow, '- Update Live Weather GIF', 'recovery must watch the weather GIF workflow.');
expectIncludes(recoveryWorkflow, "conclusion == 'failure'", 'recovery should respond to failed runs.');
expectIncludes(recoveryWorkflow, "conclusion == 'timed_out'", 'recovery should respond to timed-out runs.');
expectIncludes(recoveryWorkflow, "head_branch == 'main'", 'recovery must ignore non-main runs.');
expectIncludes(recoveryWorkflow, 'run_attempt == 1', 'automatic retry must run only for the first attempt.');
expectIncludes(recoveryWorkflow, 'reRunWorkflowFailedJobs', 'automatic recovery must rerun failed jobs.');
expectIncludes(recoveryWorkflow, 'run_attempt >= 2', 'persistent failure must be detected after the retry.');
expectIncludes(recoveryWorkflow, 'issues.create', 'persistent failure must create a GitHub issue.');
expectIncludes(recoveryWorkflow, 'weather-gif-failure:${run.id}', 'failure issue must deduplicate by workflow run.');
if (recoveryWorkflow.includes('actions/checkout')) fail('privileged recovery workflow must not check out or execute repository code.');

if (process.exitCode) process.exit(process.exitCode);
console.log('weather preview state and workflow safety checks passed.');
