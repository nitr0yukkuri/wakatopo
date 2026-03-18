import { expect, test } from '@playwright/test';

type WeatherType = 'Morning' | 'Clouds' | 'Rain' | 'Thunder' | 'Snow' | 'Night';

type Counter = {
    oscillatorStarts: number;
    noiseStarts: number;
    audioContexts: number;
};

const readCounter = async (page: Parameters<typeof test>[0]['page']) => {
    return page.evaluate<[], Counter>(() => {
        const c = (window as typeof window & {
            __lpAudioCounter?: Counter;
        }).__lpAudioCounter;

        return c ?? { oscillatorStarts: 0, noiseStarts: 0, audioContexts: 0 };
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
        };

        Object.defineProperty(window, 'AudioContext', {
            configurable: true,
            writable: true,
            value: WrappedAudioContext,
        });

        (window as typeof window & { __lpAudioCounter?: typeof counter }).__lpAudioCounter = counter;
    });
});

const unlockAudioByKeyboard = async (page: Parameters<typeof test>[0]['page']) => {
    await page.keyboard.press('A');
    await page.waitForTimeout(120);
};

const applyWeather = async (page: Parameters<typeof test>[0]['page'], weather: WeatherType) => {
    await page.getByRole('button', { name: weather.toUpperCase() }).click();
};

const clickWork = async (page: Parameters<typeof test>[0]['page'], workTitle: string) => {
    await page.getByRole('heading', { name: workTitle }).click();
};

const expectAudioIncreaseAfterAction = async (
    page: Parameters<typeof test>[0]['page'],
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

    const before = await readCounter(page);

    await clickWork(page, 'GitHub Planet');
    await page.waitForTimeout(300);

    const after = await readCounter(page);
    expect(after.oscillatorStarts - before.oscillatorStarts).toBe(0);
    expect(after.noiseStarts - before.noiseStarts).toBe(0);
});
