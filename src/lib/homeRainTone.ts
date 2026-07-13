import * as Tone from "tone";
import type { WeatherType } from "@/store";

let initialized = false;
let isPlaying = false;
let rainNoise: Tone.Noise | null = null;
let rainFilter: Tone.Filter | null = null;
let rainVol: Tone.Volume | null = null;
let rainDropletNoise: Tone.Noise | null = null;
let rainDropletFilter: Tone.Filter | null = null;
let rainDropletVol: Tone.Volume | null = null;

let thunderNoise: Tone.NoiseSynth | null = null;
let thunderMembrane: Tone.MembraneSynth | null = null;
let thunderVol: Tone.Volume | null = null;
let thunderInterval: number | null = null;
let currentWeather: WeatherType | null = null;

type SuspendableAudioContext = {
  suspend?: () => Promise<void>;
  resume?: () => Promise<void>;
};

const getRawAudioContext = (): SuspendableAudioContext | null => {
  const context = Tone.getContext().rawContext as
    SuspendableAudioContext | undefined;
  return context ?? null;
};

const playThunder = () => {
  if (!isPlaying || currentWeather !== "Thunder") return;

  try {
    const now = Tone.now();
    // High frequency crackle
    thunderNoise?.triggerAttackRelease(2.0, now, 0.15);
    // Deep heavy rumble initial strike (G2 = 98 Hz, audible on laptop speakers)
    thunderMembrane?.triggerAttackRelease("G2", 2.5, now, 0.45);
    // Long lingering secondary rumble (C2 = 65 Hz — lowest reliably audible pitch)
    thunderMembrane?.triggerAttackRelease("C2", 4.0, now + 0.15, 0.36);
    // Final distant rumble (E2 = 82 Hz)
    thunderMembrane?.triggerAttackRelease("E2", 3.0, now + 0.4, 0.26);
  } catch {
    thunderInterval = null;
    return;
  }

  // Schedule next majestic random thunder between 6 and 14 seconds
  const nextMs = 6000 + Math.random() * 8000;
  thunderInterval = window.setTimeout(playThunder, nextMs);
};

export const startHomeRain = async (weather: WeatherType) => {
  currentWeather = weather;
  await Tone.start();

  if (!initialized) {
    // Rain: raised from -14 dB to -8 dB and widened lowpass from 400 Hz to 1400 Hz.
    // 400 Hz was too narrow — it turned the rain into a barely-audible low rumble.
    rainVol = new Tone.Volume(-9).toDestination();
    rainFilter = new Tone.Filter({ frequency: 950, type: "lowpass" }).connect(
      rainVol,
    );
    rainNoise = new Tone.Noise("brown").connect(rainFilter);
    rainNoise.volume.value = -12;

    rainDropletVol = new Tone.Volume(-19).toDestination();
    rainDropletFilter = new Tone.Filter({
      frequency: 3200,
      type: "bandpass",
      Q: 0.8,
    }).connect(rainDropletVol);
    rainDropletNoise = new Tone.Noise("white").connect(rainDropletFilter);
    rainDropletNoise.volume.value = -20;

    // Thunder: raised volume slightly for desktop speakers.
    thunderVol = new Tone.Volume(-8).toDestination();
    const thunderFilter = new Tone.Filter({
      frequency: 800,
      type: "lowpass",
    }).connect(thunderVol);

    thunderNoise = new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: { attack: 0.05, decay: 2.0, sustain: 0, release: 0.1 },
    }).connect(thunderFilter);

    // Raised pitches from C0/C1/E0 (16–33 Hz — below/at the limit of human hearing)
    // to G2/C2/E2 (65–98 Hz) so the thunder is actually audible on laptop speakers.
    thunderMembrane = new Tone.MembraneSynth({
      pitchDecay: 0.18,
      octaves: 4,
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 4.0, sustain: 0, release: 0.1 },
    }).connect(thunderFilter);

    document.addEventListener("visibilitychange", () => {
      const rawCtx = getRawAudioContext();

      if (document.hidden) {
        if (isPlaying && typeof rawCtx?.suspend === "function") {
          void rawCtx.suspend().catch(() => {});
        }
      } else {
        if (isPlaying && typeof rawCtx?.resume === "function") {
          void rawCtx.resume().catch(() => {});
        }
      }
    });

    initialized = true;
  }

  if (!isPlaying) {
    rainNoise?.start();
    rainDropletNoise?.start();
    isPlaying = true;

    if (weather === "Thunder") {
      playThunder();
    }
  } else {
    // If already playing but weather changed to Thunder dynamically
    if (weather === "Thunder" && thunderInterval === null) {
      playThunder();
    } else if (weather !== "Thunder" && thunderInterval !== null) {
      window.clearTimeout(thunderInterval);
      thunderInterval = null;
    }
  }
};

export const stopHomeRain = () => {
  if (isPlaying) {
    try {
      rainNoise?.stop();
    } catch {}
    try {
      rainDropletNoise?.stop();
    } catch {}
    if (thunderInterval !== null) {
      window.clearTimeout(thunderInterval);
      thunderInterval = null;
    }
    isPlaying = false;
  }
};
