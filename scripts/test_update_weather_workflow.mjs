import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isSameWeatherPreviewState, parseWeatherPreviewState, serializeWeatherPreviewState } from './weather_preview_state.mjs';

const updateWorkflow = readFileSync(resolve('.github/workflows/update-weather.yml'), 'utf8');
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
expectIncludes(updateWorkflow, "WEATHER_PREVIOUS_STATE_FILE", 'capture must receive the previous-state file path.');
expectIncludes(updateWorkflow, 'WEATHER_SOURCE_REVISION: ${{ github.sha }}', 'source changes must invalidate the previous render state.');
expectIncludes(updateWorkflow, "if: github.ref == 'refs/heads/main' && github.event_name != 'pull_request' && steps.capture.outputs.skip != 'true'", 'only changed main captures may publish assets.');
expectIncludes(updateWorkflow, "github.ref == 'refs/heads/main'", 'only main may publish to the assets branch.');
expectIncludes(updateWorkflow, 'force:', 'manual refresh override must remain available.');
expectIncludes(updateWorkflow, "cancel-in-progress: false", 'new captures must not cancel active captures.');
expectIncludes(captureScript, "http://127.0.0.1:3000/card", 'automation must render the local app instead of relying on the public domain.');
expectIncludes(captureScript, 'isSameWeatherPreviewState(currentState, previousState)', 'unchanged preview state must skip recording.');
expectIncludes(captureScript, "await rename(generatedGif, resolve(root, 'preview.gif'))", 'GIF must be published only after validation.');
expectBefore(captureScript, 'await runCapture', "await rename(generatedGif, resolve(root, 'preview.gif'))", 'GIF validation must happen before replacing output assets.');
expectIncludes(updateWorkflow, 'ASSET_BRANCH', 'preview-assets branch name must stay explicit.');
expectIncludes(updateWorkflow, "git add preview.gif preview-state.json index.html package.json vercel.json", 'asset branch must include the state and static hosting files.');
expectIncludes(updateWorkflow, '"installCommand": ""', 'preview-assets must skip dependency installation.');
expectIncludes(updateWorkflow, '"buildCommand": null', 'preview-assets must not run a Next.js build.');
expectIncludes(updateWorkflow, '"outputDirectory": "."', 'preview-assets must serve static files from the branch root.');
expectBefore(updateWorkflow, 'Record and validate weather GIF', 'Commit GIF to assets branch', 'asset branch must only be changed after recording and validation.');

if (process.exitCode) process.exit(process.exitCode);
console.log('weather preview state and workflow safety checks passed.');
