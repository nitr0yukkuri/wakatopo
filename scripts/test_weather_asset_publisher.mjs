import assert from 'node:assert/strict';
import { chmodSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = resolve('.');
const publisherScript = resolve('scripts/publish_weather_assets.sh');
const tempRoot = mkdtempSync(join(tmpdir(), 'wakatopo-weather-publisher-'));

function run(command, args, cwd, env = process.env) {
  const result = spawnSync(command, args, { cwd, env, encoding: 'utf8' });
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, result.stderr || result.stdout || command + ' failed.');
  return result.stdout.trimEnd();
}

function runPublisher(repoPath, env = process.env) {
  const result = spawnSync('bash', [publisherScript, join(repoPath, 'preview.gif')], {
    cwd: repoPath,
    env,
    encoding: 'utf8'
  });
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, result.stderr || result.stdout || 'Weather asset publisher failed.');
  return result.stdout + result.stderr;
}

function remoteFiles(remotePath) {
  const files = run('git', ['--git-dir', remotePath, 'ls-tree', '-r', '--name-only', 'refs/heads/preview-assets'], repoRoot);
  return files.split('\n').filter(Boolean).sort();
}

function remoteFile(remotePath, filePath) {
  return run('git', ['--git-dir', remotePath, 'show', 'refs/heads/preview-assets:' + filePath], repoRoot);
}

try {
  const remotePath = join(tempRoot, 'remote.git');
  const publisherRepo = join(tempRoot, 'publisher');
  const raceRepo = join(tempRoot, 'concurrent-publisher');
  mkdirSync(publisherRepo);
  run('git', ['init', '--bare', '--initial-branch=main', remotePath], tempRoot);
  run('git', ['init', '--initial-branch=main', publisherRepo], tempRoot);
  run('git', ['-C', publisherRepo, 'config', 'user.name', 'Weather publisher test'], tempRoot);
  run('git', ['-C', publisherRepo, 'config', 'user.email', 'weather-publisher-test@example.invalid'], tempRoot);
  writeFileSync(join(publisherRepo, 'README.md'), 'source checkout\n');
  run('git', ['-C', publisherRepo, 'add', 'README.md'], tempRoot);
  run('git', ['-C', publisherRepo, 'commit', '-m', 'test source checkout'], tempRoot);
  run('git', ['-C', publisherRepo, 'remote', 'add', 'origin', remotePath], tempRoot);
  run('git', ['-C', publisherRepo, 'push', '-u', 'origin', 'main'], tempRoot);

  writeFileSync(join(publisherRepo, 'preview.gif'), 'gif-fixture-v1');
  const firstOutput = runPublisher(publisherRepo);
  assert.match(firstOutput, /does not exist yet; creating it\./);
  assert.deepEqual(remoteFiles(remotePath), ['index.html', 'package.json', 'preview.gif', 'vercel.json']);
  assert.equal(remoteFile(remotePath, 'preview.gif'), 'gif-fixture-v1');
  const initialAssetSha = run('git', ['--git-dir', remotePath, 'rev-parse', 'refs/heads/preview-assets'], repoRoot);

  writeFileSync(join(publisherRepo, 'preview.gif'), 'gif-fixture-v1');
  const unchangedOutput = runPublisher(publisherRepo);
  assert.match(unchangedOutput, /Published assets are unchanged\./);
  assert.equal(run('git', ['--git-dir', remotePath, 'rev-parse', 'refs/heads/preview-assets'], repoRoot), initialAssetSha);

  run('git', ['clone', '--branch', 'preview-assets', remotePath, raceRepo], tempRoot);
  run('git', ['-C', raceRepo, 'config', 'user.name', 'Concurrent publisher test'], tempRoot);
  run('git', ['-C', raceRepo, 'config', 'user.email', 'weather-race-test@example.invalid'], tempRoot);
  writeFileSync(join(raceRepo, 'race-marker.txt'), 'concurrent update\n');
  run('git', ['-C', raceRepo, 'add', 'race-marker.txt'], tempRoot);
  run('git', ['-C', raceRepo, 'commit', '-m', 'simulate a concurrent asset branch update'], tempRoot);

  const whichGit = spawnSync('which', ['git'], { encoding: 'utf8' });
  assert.equal(whichGit.status, 0, whichGit.stderr || 'Could not locate git.');
  const shimDirectory = join(tempRoot, 'git-shim');
  mkdirSync(shimDirectory);
  const raceMarker = join(tempRoot, 'race-injected');
  const gitShim = join(shimDirectory, 'git');
  writeFileSync(gitShim, `#!/usr/bin/env node
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const args = process.argv.slice(2);
const marker = process.env.WEATHER_ASSET_TEST_RACE_MARKER;
const realGit = process.env.WEATHER_ASSET_TEST_REAL_GIT;
if (args[0] === 'push' && !fs.existsSync(marker)) {
  fs.writeFileSync(marker, 'injected');
  const competingPush = spawnSync(realGit, ['-C', process.env.WEATHER_ASSET_TEST_RACE_REPO, 'push', 'origin', 'HEAD:refs/heads/preview-assets'], { stdio: 'inherit' });
  if (competingPush.status !== 0) process.exit(competingPush.status || 1);
}
const result = spawnSync(realGit, args, { cwd: process.cwd(), env: process.env, stdio: 'inherit' });
process.exit(result.status ?? 1);
`);
  chmodSync(gitShim, 0o755);

  writeFileSync(join(publisherRepo, 'preview.gif'), 'gif-fixture-v2');
  const raceEnv = {
    ...process.env,
    PATH: shimDirectory + delimiter + process.env.PATH,
    WEATHER_ASSET_TEST_RACE_MARKER: raceMarker,
    WEATHER_ASSET_TEST_RACE_REPO: raceRepo,
    WEATHER_ASSET_TEST_REAL_GIT: whichGit.stdout.trim()
  };
  const retryOutput = runPublisher(publisherRepo, raceEnv);
  assert.ok(existsSync(raceMarker), 'the test must inject a concurrent push before the publisher push.');
  assert.match(retryOutput, /Asset branch changed during publish; refreshing it before retry\./);
  assert.equal(remoteFile(remotePath, 'preview.gif'), 'gif-fixture-v2');
  assert.deepEqual(remoteFiles(remotePath), ['index.html', 'package.json', 'preview.gif', 'vercel.json']);
  console.log('weather asset publisher integration checks passed (new branch, no-op, push conflict retry).');
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
