import { spawn } from 'node:child_process';
import { appendFile, mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { resolve } from 'node:path';
import { parseWeatherPreviewState, isSameWeatherPreviewState, serializeWeatherPreviewState } from './weather_preview_state.mjs';

const root = process.cwd();
const previewUrl = process.env.WEATHER_RECORD_URL ?? 'http://127.0.0.1:3000/card';
const outputDir = resolve(root, '.weather-gif-work');
const videoDir = resolve(outputDir, 'videos');
const generatedGif = resolve(outputDir, 'preview.gif');
const generatedState = resolve(outputDir, 'preview-state.json');
const server = spawn('npm', ['run', 'dev', '--', '--hostname', '127.0.0.1', '--port', '3000'], {
    cwd: root,
    stdio: 'inherit',
    detached: process.platform !== 'win32',
    windowsHide: true,
});
let serverError;
server.once('error', (error) => { serverError = error; });

function run(command, args, options = {}) {
    return new Promise((resolvePromise, rejectPromise) => {
        const child = spawn(command, args, {
            cwd: root,
            env: process.env,
            stdio: 'inherit',
            windowsHide: true,
            ...options,
        });

        child.once('error', rejectPromise);
        child.once('exit', (code, signal) => {
            if (code === 0) resolvePromise();
            else rejectPromise(new Error(`${command} ${args.join(' ')} exited with ${signal ?? `code ${code}`}.`));
        });
    });
}

async function stopServer() {
    if (server.exitCode !== null || server.pid === undefined) return;

    try {
        if (process.platform === 'win32') server.kill('SIGTERM');
        else process.kill(-server.pid, 'SIGTERM');
    } catch {
        server.kill('SIGTERM');
    }

    await Promise.race([
        new Promise((resolvePromise) => server.once('exit', resolvePromise)),
        delay(5000),
    ]);

    if (server.exitCode === null) {
        try {
            if (process.platform !== 'win32') process.kill(-server.pid, 'SIGKILL');
            else server.kill('SIGKILL');
        } catch {
            server.kill('SIGKILL');
        }
    }
}

async function getPreviewHtml() {
    const deadline = Date.now() + 120_000;
    let lastError;

    while (Date.now() < deadline) {
        if (serverError) throw new Error(`Could not start the local Next.js dev server: ${serverError.message}`);
        if (server.exitCode !== null) {
            throw new Error(`Next.js dev server exited before /card was ready (code ${server.exitCode}).`);
        }

        try {
            const response = await fetch(previewUrl, { signal: AbortSignal.timeout(10_000) });
            if (response.ok) return await response.text();
            lastError = new Error(`/card returned HTTP ${response.status}.`);
        } catch (error) {
            lastError = error;
        }

        await delay(1000);
    }

    throw new Error(`Local /card did not become ready within 120 seconds: ${lastError?.message ?? 'no response'}`);
}

async function writeOutput(key, value) {
    if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

async function readPreviousState() {
    const statePath = process.env.WEATHER_PREVIOUS_STATE_FILE;
    if (!statePath) return null;

    try {
        return JSON.parse(await readFile(statePath, 'utf8'));
    } catch (error) {
        if (error.code === 'ENOENT' || error instanceof SyntaxError) {
            console.warn(`Previous weather preview state is missing or invalid; recording a fresh GIF. (${error.message})`);
            return null;
        }
        throw new Error(`Could not read previous weather preview state: ${error.message}`);
    }
}

function runCapture(command, args) {
    return new Promise((resolvePromise, rejectPromise) => {
        const child = spawn(command, args, { cwd: root, env: process.env, stdio: ['ignore', 'pipe', 'inherit'] });
        let stdout = '';
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (chunk) => { stdout += chunk; });
        child.once('error', rejectPromise);
        child.once('exit', (code, signal) => {
            if (code === 0) resolvePromise(stdout);
            else rejectPromise(new Error(`${command} exited with ${signal ?? `code ${code}`}.`));
        });
    });
}

try {
    await mkdir(outputDir, { recursive: true });
    console.log(`Starting the local Next.js app for ${previewUrl}...`);
    const html = await getPreviewHtml();
    const sourceRevision = process.env.WEATHER_SOURCE_REVISION || 'local';
    const currentState = parseWeatherPreviewState(html, sourceRevision);
    const previousState = await readPreviousState();
    const forced = process.env.WEATHER_GIF_FORCE === 'true';

    if (!forced && isSameWeatherPreviewState(currentState, previousState)) {
        console.log('Weather, season, event, and source revision are unchanged; skipping browser recording and asset publishing.');
        await writeOutput('skip', 'true');
    } else {
        console.log(`State changed; recording local preview: ${JSON.stringify(currentState)}`);
        await run('npx', ['playwright', 'install', 'chromium', '--with-deps']);
        await run('sudo', ['apt-get', 'install', '-y', 'ffmpeg']);
        await rm(videoDir, { recursive: true, force: true });

        await run('npx', ['--yes', 'tsx', 'scripts/record_weather.ts'], {
            env: {
                ...process.env,
                WEATHER_RECORD_URL: previewUrl,
                WEATHER_RECORD_VIDEO_DIR: videoDir,
            },
        });

        const webmFiles = (await readdir(videoDir)).filter((file) => file.endsWith('.webm'));
        if (webmFiles.length !== 1) {
            throw new Error(`Expected exactly one recorded WebM file, found ${webmFiles.length}.`);
        }

        const filter = 'setpts=1.25*PTS,fps=16,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=diff[p];[s1][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle';
        await run('ffmpeg', [
            '-y', '-i', resolve(videoDir, webmFiles[0]), '-ss', '15', '-t', '5',
            '-vf', filter, '-loop', '0', generatedGif,
        ]);

        const gifStat = await stat(generatedGif);
        if (gifStat.size === 0) throw new Error('FFmpeg produced an empty preview.gif.');

        const probeText = await runCapture('ffprobe', [
            '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height', '-of', 'json', generatedGif,
        ]);
        const stream = JSON.parse(probeText).streams?.[0];
        if (stream?.codec_name !== 'gif' || stream.width !== 800 || !Number.isInteger(stream.height) || stream.height <= 0) {
            throw new Error(`Generated GIF failed validation: ${probeText.trim()}`);
        }

        await writeFile(generatedState, serializeWeatherPreviewState(currentState));
        await rename(generatedGif, resolve(root, 'preview.gif'));
        await rename(generatedState, resolve(root, 'preview-state.json'));
        await writeOutput('skip', 'false');
        console.log(`Validated preview.gif (${gifStat.size} bytes, ${stream.width}x${stream.height}).`);
    }
} finally {
    await stopServer();
    await rm(outputDir, { recursive: true, force: true });
}
