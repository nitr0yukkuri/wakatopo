import { expect, test, type Page } from '@playwright/test';

type WeatherType = 'Morning' | 'Clouds' | 'Rain' | 'Thunder' | 'Snow' | 'Night';

type Counter = {
    oscillatorStarts: number;
    noiseStarts: number;
    audioContexts: number;
    compressorNodes: number;
    gainOverOneRequests: number;
    maxGainRequested: number;
};

const readCounter = async (page: Page) => {
    return page.evaluate<Counter>(() => {
        const c = (window as typeof window & {
            __lpAudioCounter?: Counter;
        }).__lpAudioCounter;

        return c ?? {
            oscillatorStarts: 0,
            noiseStarts: 0,
            audioContexts: 0,
            compressorNodes: 0,
            gainOverOneRequests: 0,
            maxGainRequested: 0,
        };
    });
};

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        const originalAudioContext = window.AudioContext;

        if (!originalAudioContext) {
            return;
        }

        const counter = {
            oscillatorStarts: 0,
            noiseStarts: 0,
            audioContexts: 0,
            compressorNodes: 0,
            gainOverOneRequests: 0,
            maxGainRequested: 0,
        };

        const WrappedAudioContext = class extends originalAudioContext {
            constructor(...args: ConstructorParameters<typeof AudioContext>) {
                super(...args);
                counter.audioContexts += 1;
            }

            createOscillator(...args: Parameters<AudioContext['createOscillator']>) {
                const osc = super.createOscillator(...args);
                const originalStart = osc.start.bind(osc);
                osc.start = ((...startArgs: Parameters<OscillatorNode['start']>) => {
                    counter.oscillatorStarts += 1;
                    return originalStart(...startArgs);
                }) as OscillatorNode['start'];
                return osc;
            }

            createBufferSource(...args: Parameters<AudioContext['createBufferSource']>) {
                const source = super.createBufferSource(...args);
                const originalStart = source.start.bind(source);
                source.start = ((...startArgs: Parameters<AudioBufferSourceNode['start']>) => {
                    counter.noiseStarts += 1;
                    return originalStart(...startArgs);
                }) as AudioBufferSourceNode['start'];
                return source;
            }

            createGain(...args: Parameters<AudioContext['createGain']>) {
                const gainNode = super.createGain(...args);
                const gainParam = gainNode.gain;

                const capture = (value: number) => {
                    if (!Number.isFinite(value)) return;
                    if (value > counter.maxGainRequested) {
                        counter.maxGainRequested = value;
                    }
                    if (value > 1) {
                        counter.gainOverOneRequests += 1;
                    }
                };

                const originalSetValueAtTime = gainParam.setValueAtTime.bind(gainParam);
                gainParam.setValueAtTime = ((value: number, startTime: number) => {
                    capture(value);
                    return originalSetValueAtTime(value, startTime);
                }) as AudioParam['setValueAtTime'];

                const originalLinearRampToValueAtTime = gainParam.linearRampToValueAtTime.bind(gainParam);
                gainParam.linearRampToValueAtTime = ((value: number, endTime: number) => {
                    capture(value);
                    return originalLinearRampToValueAtTime(value, endTime);
                }) as AudioParam['linearRampToValueAtTime'];

                const originalExponentialRampToValueAtTime = gainParam.exponentialRampToValueAtTime.bind(gainParam);
                gainParam.exponentialRampToValueAtTime = ((value: number, endTime: number) => {
                    capture(value);
                    return originalExponentialRampToValueAtTime(value, endTime);
                }) as AudioParam['exponentialRampToValueAtTime'];

                return gainNode;
            }

            createDynamicsCompressor(...args: Parameters<AudioContext['createDynamicsCompressor']>) {
                const node = super.createDynamicsCompressor(...args);
                counter.compressorNodes += 1;
                return node;
            }
        };

        Object.defineProperty(window, 'AudioContext', {
            configurable: true,
            writable: true,
            value: WrappedAudioContext,
        });

        (window as typeof window & { __lpAudioCounter?: typeof counter }).__lpAudioCounter = counter;
    });
});

const enableAudio = async (page: Page) => {
    // Sound is opt-in by default; a generic key must not override a muted preference.
    await expect(page.getByRole('button', { name: /^(Start sound|Enable sound|Disable sound)$/ })).toBeVisible();
    const control = page.getByRole('button', { name: /^(Start sound|Enable sound)$/ });
    if (await control.count()) await control.click();
    await expect(page.getByRole('button', { name: 'Disable sound' })).toBeVisible();
};

const clickWork = async (page: Page, workTitle: string) => {
    await page.getByRole('heading', { name: workTitle }).click({ force: true });
};

const expectAudioIncreaseAfterAction = async (
    page: Page,
    action: () => Promise<void>,
    label: string,
) => {
    const before = await readCounter(page);
    await action();

    await expect
        .poll(async () => {
            const after = await readCounter(page);
            const osc = after.oscillatorStarts - before.oscillatorStarts;
            const noise = after.noiseStarts - before.noiseStarts;
            return osc + noise;
        }, { message: `${label}: 音源 start の増加を検知できること` })
        .toBeGreaterThan(0);
};

test('初回遷移で効果音の発火を検知できる (warp)', async ({ page }) => {
    await page.goto('/');
    await enableAudio(page);

    await expectAudioIncreaseAfterAction(
        page,
        () => clickWork(page, 'GitHub Planet'),
        'GitHub Planet warp transition',
    );
});

const weatherScenarios: Array<{ weather: WeatherType; label: string }> = [
        { weather: 'Rain', label: 'rain' },
        { weather: 'Snow', label: 'snow' },
        { weather: 'Thunder', label: 'flash' },
        { weather: 'Clouds', label: 'heavy-cloud' },
        { weather: 'Morning', label: 'sunburst' },
        { weather: 'Night', label: 'moonrise' },
];
for (const s of weatherScenarios) {
    test(`天候依存遷移で効果音の発火を検知できる (${s.label})`, async ({ page }) => {
        // Morning is a supported URL state, not a debug-selector button.
        await page.goto(`/?lang=ja&weather=${s.weather}&season=autumn&seasonEvent=none`);
        await enableAudio(page);

        await expectAudioIncreaseAfterAction(
            page,
            () => clickWork(page, 'おてんきぐらし'),
            `otenkigurashi transition(${s.label})`,
        );
    });
}

test('freeze と wave 遷移で効果音の発火を検知できる', async ({ page }) => {
    await page.goto('/');
    await enableAudio(page);

    await expectAudioIncreaseAfterAction(
        page,
        () => clickWork(page, 'ColdKeep'),
        'coldkeep freeze transition',
    );

    await page.goto('/');
    await enableAudio(page);

    await expectAudioIncreaseAfterAction(
        page,
        () => clickWork(page, 'でんしょうお'),
        'denshouo wave transition',
    );
});

test('mute 時は遷移を起こしても新規の効果音トリガーが増えない', async ({ page }) => {
    await page.goto('/');
    await enableAudio(page);

    // 先にミュートに切り替え
    await page.getByRole('button', { name: 'Disable sound' }).click();
    await expect(page.getByRole('button', { name: 'Enable sound' })).toBeVisible();
    await page.waitForTimeout(160);

    const before = await readCounter(page);

    await clickWork(page, 'GitHub Planet');
    await page.waitForTimeout(300);

    const after = await readCounter(page);
    expect(after.oscillatorStarts - before.oscillatorStarts).toBe(0);
    expect(after.noiseStarts - before.noiseStarts).toBe(0);
});

test('ミュート中の通常操作では音響初期化を遅延できる', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Start sound' })).toBeVisible();
    const before = await readCounter(page);
    await page.getByRole('button', { name: 'WAKATO // PORTFOLIO' }).click();
    await page.waitForTimeout(150);
    const muted = await readCounter(page);
    expect(muted.audioContexts).toBe(before.audioContexts);
    expect(muted.oscillatorStarts).toBe(before.oscillatorStarts);
    await enableAudio(page);
    await expect.poll(async () => (await readCounter(page)).audioContexts).toBeGreaterThan(before.audioContexts);
});

test('音割れ対策: 過大ゲイン要求がなく、出力コンプレッサーが使われる', async ({ page }) => {
    await page.goto('/');
    await enableAudio(page);

    await expectAudioIncreaseAfterAction(
        page,
        () => clickWork(page, 'GitHub Planet'),
        'anti-clipping sanity transition',
    );

    await expect
        .poll(async () => {
            const c = await readCounter(page);
            return c.compressorNodes;
        }, { message: '音量ピーク抑制のため DynamicsCompressorNode が生成されること' })
        .toBeGreaterThan(0);

    const after = await readCounter(page);
    expect(after.gainOverOneRequests).toBe(0);
    expect(after.maxGainRequested).toBeLessThanOrEqual(1);
});

test('denshouo 常駐BGM: ピアノ音源が起動し、多重ループしない', async ({ page }) => {
    await page.goto('/denshouo?lang=ja');
    const beforeUnlock = await readCounter(page);
    await enableAudio(page);

    await expect
        .poll(async () => {
            const after = await readCounter(page);
            return after.oscillatorStarts - beforeUnlock.oscillatorStarts;
        }, { message: '現在のdenshouo BGMのピアノ音源が起動すること' })
        .toBeGreaterThanOrEqual(12);

    const started = await readCounter(page);
    await page.waitForTimeout(2600);
    const stable = await readCounter(page);
    expect(stable.oscillatorStarts - started.oscillatorStarts).toBe(0);

    await page.keyboard.press('m');
    await page.waitForTimeout(180);
    await page.keyboard.press('m');

    await expect
        .poll(async () => {
            const resumed = await readCounter(page);
            return resumed.oscillatorStarts - stable.oscillatorStarts;
        }, { message: '再開時にピアノのフレーズが再開すること' })
        .toBeGreaterThanOrEqual(36);

    const resumed = await readCounter(page);
    // Nine notes with four oscillators, plus UI confirmation tones. A duplicated
    // phrase would schedule at least another 36 oscillators immediately.
    expect(resumed.oscillatorStarts - stable.oscillatorStarts).toBeLessThan(72);
    await page.waitForTimeout(2600);
    const afterResume = await readCounter(page);
    expect(afterResume.oscillatorStarts - resumed.oscillatorStarts).toBe(0);
});
