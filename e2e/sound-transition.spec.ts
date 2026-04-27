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

const unlockAudioByKeyboard = async (page: Page) => {
    await page.keyboard.press('A');
    await page.waitForTimeout(120);
};

const applyWeather = async (page: Page, weather: WeatherType) => {
    await page.getByRole('button', { name: weather.toUpperCase() }).click();
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
    await unlockAudioByKeyboard(page);

    await expectAudioIncreaseAfterAction(
        page,
        () => clickWork(page, 'GitHub Planet'),
        'GitHub Planet warp transition',
    );
});

test('天候依存遷移で効果音の発火を検知できる (rain, snow, flash, heavy-cloud, sunburst, moonrise)', async ({ page }) => {
    await page.goto('/');
    await unlockAudioByKeyboard(page);

    const scenarios: Array<{ weather: WeatherType; label: string }> = [
        { weather: 'Rain', label: 'rain' },
        { weather: 'Snow', label: 'snow' },
        { weather: 'Thunder', label: 'flash' },
        { weather: 'Clouds', label: 'heavy-cloud' },
        { weather: 'Morning', label: 'sunburst' },
        { weather: 'Night', label: 'moonrise' },
    ];

    for (const s of scenarios) {
        await page.goto('/');
        await unlockAudioByKeyboard(page);
        await applyWeather(page, s.weather);

        await expectAudioIncreaseAfterAction(
            page,
            () => clickWork(page, 'おてんきぐらし'),
            `otenkigurashi transition(${s.label})`,
        );
    }
});

test('freeze と wave 遷移で効果音の発火を検知できる', async ({ page }) => {
    await page.goto('/');
    await unlockAudioByKeyboard(page);

    await expectAudioIncreaseAfterAction(
        page,
        () => clickWork(page, 'ColdKeep'),
        'coldkeep freeze transition',
    );

    await page.goto('/');
    await unlockAudioByKeyboard(page);

    await expectAudioIncreaseAfterAction(
        page,
        () => clickWork(page, 'でんしょうお'),
        'denshouo wave transition',
    );
});

test('mute 時は遷移を起こしても新規の効果音トリガーが増えない', async ({ page }) => {
    await page.goto('/');

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

test('音割れ対策: 過大ゲイン要求がなく、出力コンプレッサーが使われる', async ({ page }) => {
    await page.goto('/');
    await unlockAudioByKeyboard(page);

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

test('denshouo 常駐BGM: 連続ノイズが起動し、多重ループしない', async ({ page }) => {
    await page.goto('/denshouo?lang=ja');
    const beforeUnlock = await readCounter(page);
    await unlockAudioByKeyboard(page);

    await expect
        .poll(async () => {
            const after = await readCounter(page);
            return after.noiseStarts - beforeUnlock.noiseStarts;
        }, { message: 'denshouo の 3レイヤー連続ノイズが起動すること' })
        .toBeGreaterThanOrEqual(3);

    const started = await readCounter(page);
    await page.waitForTimeout(2600);
    const stable = await readCounter(page);
    expect(stable.noiseStarts - started.noiseStarts).toBe(0);

    await page.keyboard.press('m');
    await page.waitForTimeout(180);
    await page.keyboard.press('m');

    await expect
        .poll(async () => {
            const resumed = await readCounter(page);
            return resumed.noiseStarts - stable.noiseStarts;
        }, { message: '再開時もノイズループは1セット(3 start)のみ増えること' })
        .toBeGreaterThanOrEqual(3);

    const resumed = await readCounter(page);
    expect(resumed.noiseStarts - stable.noiseStarts).toBeLessThanOrEqual(3);
});
