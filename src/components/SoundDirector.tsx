"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store";
import { usePathname } from "next/navigation";
import { getLofiBgmProfile } from "@/lib/lofiAudio";

type TransitionType =
  | "none"
  | "warp"
  | "cloud"
  | "freeze"
  | "rain"
  | "snow"
  | "sunburst"
  | "flash"
  | "heavy-cloud"
  | "wave"
  | "moonrise"
  | "captcha-lock";

const MUTE_KEY = "lp-audio-muted";
const OUTPUT_BOOST = 2.2;
const OTENKI_BGM_FLAG = -1;
const DENSHOUO_BGM_FLAG = -2;
const EXCLUSIVE_BGM_WORK_IDS = new Set(["02", "05"]);

type AudioStateSnapshot = {
  pathname: string;
  resolvedWorkId: string | null;
  weather: ReturnType<typeof useStore.getState>["weather"];
  githubActivityLevel: number;
};

export default function SoundDirector() {
  const pathname = usePathname();
  const transitionType = useStore((state) => state.transitionType);
  const weather = useStore((state) => state.weather);
  const githubActivityLevel = useStore((state) => state.githubActivityLevel);
  const activeWorkId = useStore((state) => state.activeWorkId);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const outputLowpassRef = useRef<BiquadFilterNode | null>(null);
  const outputConvolverRef = useRef<ConvolverNode | null>(null);
  const outputDryGainRef = useRef<GainNode | null>(null);
  const outputWetGainRef = useRef<GainNode | null>(null);
  const outputCompressorRef = useRef<DynamicsCompressorNode | null>(null);
  const bgmTimerRef = useRef<number | null>(null);
  const bgmSessionRef = useRef(0);
  const activeAudioSourcesRef = useRef<Set<AudioScheduledSourceNode>>(
    new Set(),
  );
  const latestAudioStateRef = useRef<AudioStateSnapshot>({
    pathname: "/",
    resolvedWorkId: null,
    weather: "Clear",
    githubActivityLevel: 0.5,
  });
  const previousTransitionRef = useRef<TransitionType>("none");
  const isMutedRef = useRef(true);
  const hasUnlockedAudioRef = useRef(false);
  const bgmStepRef = useRef(0);
  const [isMuted, setIsMuted] = useState(true);
  const [hasUnlockedAudio, setHasUnlockedAudio] = useState(false);
  const isCardPage = pathname === "/card";

  const resolvedWorkId = (() => {
    if (pathname === "/github-planet") return "01";
    if (pathname === "/otenkigurashi") return "02";
    if (pathname === "/coldkeep") return "03";
    if (pathname === "/recaptcha-game") return "04";
    if (pathname === "/denshouo") return "05";
    return activeWorkId;
  })();

  latestAudioStateRef.current = {
    pathname,
    resolvedWorkId,
    weather,
    githubActivityLevel,
  };

  const ensureAudioGraph = async () => {
    if (typeof window === "undefined") return false;

    let pendingContext: AudioContext | null = null;

    const createImpulseResponse = (
      ctx: AudioContext,
      seconds = 2.8,
      decay = 2.6,
    ) => {
      const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
      const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

      for (let channel = 0; channel < 2; channel += 1) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < length; i += 1) {
          const t = i / length;
          const env = Math.pow(1 - t, decay);
          data[i] = (Math.random() * 2 - 1) * env;
        }
      }

      return impulse;
    };

    try {
      if (!audioContextRef.current) {
        const Ctx =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctx) return false;

        const ctx = new Ctx();
        pendingContext = ctx;
        const master = ctx.createGain();
        const outputLowpass = ctx.createBiquadFilter();
        const outputConvolver = ctx.createConvolver();
        const outputDryGain = ctx.createGain();
        const outputWetGain = ctx.createGain();
        const outputCompressor = ctx.createDynamicsCompressor();

      // Lo-fi shaping: allow overtones up to ~2.2 kHz so desktop speakers reproduce the tone.
      // (1050 Hz was too aggressive: it killed perceived loudness on desktop devices.)
        outputLowpass.type = "lowpass";
        outputLowpass.frequency.value = 2200;
        outputLowpass.Q.value = 0.9;

        outputConvolver.buffer = createImpulseResponse(ctx);

      // Raised dry/wet gains so the signal chain reaches a hearable level on desktop speakers.
      // Previous values (0.32 / 0.24) + master (0.62) produced ~-45 dB effective output.
        outputDryGain.gain.value = 0.64;
        outputWetGain.gain.value = 0.42;

      // Compressor threshold lowered to -40 dB so it catches the quiet BGM signal.
      // Ratio reduced from 8 to 4 for a gentler lift rather than hard-limiting.
        outputCompressor.threshold.value = -40;
        outputCompressor.knee.value = 18;
        outputCompressor.ratio.value = 4;
        outputCompressor.attack.value = 0.003;
        outputCompressor.release.value = 0.2;

        master.gain.value = 0.82;
        master.connect(outputLowpass);

        outputLowpass.connect(outputDryGain);
        outputDryGain.connect(outputCompressor);

        outputLowpass.connect(outputConvolver);
        outputConvolver.connect(outputWetGain);
        outputWetGain.connect(outputCompressor);

        outputCompressor.connect(ctx.destination);

        audioContextRef.current = ctx;
        pendingContext = null;
        masterGainRef.current = master;
        outputLowpassRef.current = outputLowpass;
        outputConvolverRef.current = outputConvolver;
        outputDryGainRef.current = outputDryGain;
        outputWetGainRef.current = outputWetGain;
        outputCompressorRef.current = outputCompressor;

      // Expose key chain values for automated volume-level tests.
        (
          window as typeof window & {
            __lpAudioGraphConfig?: Record<string, number>;
          }
        ).__lpAudioGraphConfig = {
          masterGain: master.gain.value,
          outputLowpassHz: outputLowpass.frequency.value,
          outputDryGain: outputDryGain.gain.value,
          outputWetGain: outputWetGain.gain.value,
          compressorThreshold: outputCompressor.threshold.value,
          compressorRatio: outputCompressor.ratio.value,
        };
      }

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      return true;
    } catch {
      if (pendingContext && pendingContext.state !== "closed") {
        void pendingContext.close().catch(() => {});
      }
      return false;
    }
  };

  const createVoice = (
    type: OscillatorType,
    freq: number,
    at: number,
    duration: number,
    volume: number,
    filterType: BiquadFilterType = "lowpass",
    q = 0.9,
  ) => {
    const ctx = audioContextRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master || isMutedRef.current) return;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const boostedVolume = Math.min(
      Math.max(volume * OUTPUT_BOOST, 0.0001),
      0.24,
    );

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(freq, 24), ctx.currentTime + at);

    filter.type = filterType;
    filter.frequency.setValueAtTime(
      Math.min(Math.max(freq * 1.85, 70), 1900),
      ctx.currentTime + at,
    );
    filter.Q.value = q;

    gain.gain.setValueAtTime(0.0001, ctx.currentTime + at);
    gain.gain.exponentialRampToValueAtTime(
      boostedVolume,
      ctx.currentTime + at + 0.045,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + at + duration,
    );

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    activeAudioSourcesRef.current.add(osc);
    osc.onended = () => {
      activeAudioSourcesRef.current.delete(osc);
    };

    osc.start(ctx.currentTime + at);
    osc.stop(ctx.currentTime + at + duration + 0.03);
  };

  const playTone = (
    freq: number,
    duration: number,
    volume = 0.25,
    type: OscillatorType = "sine",
    at = 0,
  ) => {
    createVoice(type, freq, at, duration, volume, "lowpass", 0.8);
  };

  const playNoiseBurst = (
    duration: number,
    volume: number,
    at = 0,
    highpass = 500,
  ) => {
    const ctx = audioContextRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master || isMutedRef.current) return;

    const frameCount = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i += 1) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / frameCount);
    }

    const source = ctx.createBufferSource();
    const hp = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const boostedVolume = Math.min(
      Math.max(volume * OUTPUT_BOOST, 0.0001),
      0.2,
    );

    source.buffer = buffer;

    hp.type = "highpass";
    hp.frequency.setValueAtTime(highpass, ctx.currentTime + at);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime + at);
    gain.gain.exponentialRampToValueAtTime(
      boostedVolume,
      ctx.currentTime + at + 0.01,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + at + duration,
    );

    source.connect(hp);
    hp.connect(gain);
    gain.connect(master);

    activeAudioSourcesRef.current.add(source);
    source.onended = () => {
      activeAudioSourcesRef.current.delete(source);
    };

    source.start(ctx.currentTime + at);
    source.stop(ctx.currentTime + at + duration + 0.01);
  };

  const playSweep = (
    from: number,
    to: number,
    duration: number,
    type: OscillatorType = "sawtooth",
    volume = 0.22,
  ) => {
    const ctx = audioContextRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master || isMutedRef.current) return;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(from, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(to, 25),
      ctx.currentTime + duration,
    );

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(
      Math.min(Math.max(from * 2.3, 140), 4600),
      ctx.currentTime,
    );
    filter.frequency.exponentialRampToValueAtTime(
      Math.min(Math.max(to * 2.6, 140), 4600),
      ctx.currentTime + duration,
    );
    filter.Q.value = 1.1;

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    activeAudioSourcesRef.current.add(osc);
    osc.onended = () => {
      activeAudioSourcesRef.current.delete(osc);
    };

    osc.start();
    osc.stop(ctx.currentTime + duration + 0.05);
  };

  const playTransitionSfx = (type: TransitionType) => {
    switch (type) {
      case "warp":
        // Gentle bright jingle.
        playTone(261.63, 0.24, 0.024, "triangle", 0.0);
        playTone(329.63, 0.24, 0.022, "sine", 0.16);
        playTone(392.0, 0.26, 0.02, "sine", 0.32);
        break;
      case "flash":
        // Otenkigurashi (thunder route): soft weather chime, not harsh.
        playTone(329.63, 0.24, 0.022, "triangle", 0.0);
        playTone(392.0, 0.24, 0.02, "sine", 0.16);
        playTone(523.25, 0.26, 0.018, "sine", 0.32);
        break;
      case "rain":
        playTone(293.66, 0.24, 0.022, "triangle", 0.0);
        playTone(369.99, 0.24, 0.02, "sine", 0.16);
        playTone(440.0, 0.24, 0.018, "sine", 0.32);
        break;
      case "snow":
        playTone(329.63, 0.26, 0.022, "sine");
        playTone(392.0, 0.24, 0.02, "triangle", 0.16);
        playTone(493.88, 0.24, 0.018, "sine", 0.34);
        break;
      case "heavy-cloud":
        playTone(246.94, 0.26, 0.02, "triangle", 0.0);
        playTone(311.13, 0.24, 0.018, "sine", 0.16);
        playTone(392.0, 0.24, 0.017, "sine", 0.34);
        break;
      case "sunburst":
        playTone(349.23, 0.24, 0.022, "triangle");
        playTone(440.0, 0.24, 0.02, "sine", 0.16);
        playTone(523.25, 0.26, 0.018, "sine", 0.34);
        break;
      case "moonrise":
        playTone(261.63, 0.3, 0.02, "sine");
        playTone(329.63, 0.28, 0.018, "triangle", 0.18);
        playTone(392.0, 0.28, 0.016, "sine", 0.38);
        break;
      case "freeze":
        playTone(220.0, 0.3, 0.02, "triangle");
        playTone(293.66, 0.28, 0.018, "sine", 0.18);
        playTone(349.23, 0.28, 0.016, "triangle", 0.38);
        break;
      case "wave":
        // Denshouo: gentle traditional storytelling motif.
        playTone(146.83, 0.34, 0.02, "triangle");
        playTone(196.0, 0.3, 0.018, "sine", 0.2);
        playTone(246.94, 0.28, 0.016, "triangle", 0.42);
        break;
      case "cloud":
        playTone(220.0, 0.28, 0.018, "triangle", 0.0);
        playTone(293.66, 0.26, 0.017, "sine", 0.18);
        playTone(329.63, 0.26, 0.016, "sine", 0.38);
        break;
      case "captcha-lock":
        // Soft game-clear jingle.
        playTone(329.63, 0.18, 0.034, "triangle");
        playTone(392.0, 0.18, 0.03, "triangle", 0.14);
        playTone(493.88, 0.2, 0.026, "sine", 0.3);
        playTone(659.25, 0.24, 0.022, "sine", 0.48);
        break;
      case "none":
      default:
        break;
    }
  };

  const startBgm = () => {
    if (bgmTimerRef.current !== null) return;
    const session = bgmSessionRef.current;
    const audioState = latestAudioStateRef.current;
    const currentPathname = audioState.pathname;
    const currentWorkId = audioState.resolvedWorkId;
    const currentWeather = audioState.weather;
    const currentActivityLevel = audioState.githubActivityLevel;

    if (currentWorkId === "02") {
      bgmTimerRef.current = OTENKI_BGM_FLAG;
      import("@/lib/otenkiToneBgm")
        .then(({ startOtenkiBgm, stopOtenkiBgm }) => {
          if (
            session !== bgmSessionRef.current ||
            isMutedRef.current ||
            latestAudioStateRef.current.resolvedWorkId !== "02"
          ) {
            stopOtenkiBgm();
            return;
          }
          void startOtenkiBgm(latestAudioStateRef.current.weather);
        })
        .catch(() => {
          bgmTimerRef.current = null;
        });
      return;
    }

    if (currentWorkId === "05") {
      const ctx = audioContextRef.current;
      const master = masterGainRef.current;
      if (!ctx || !master) return;

      bgmTimerRef.current = DENSHOUO_BGM_FLAG;
      import("@/lib/denshouoSeaBgm")
        .then(({ startDenshouoSeaBgm, stopDenshouoSeaBgm }) => {
          if (
            session !== bgmSessionRef.current ||
            isMutedRef.current ||
            latestAudioStateRef.current.resolvedWorkId !== "05"
          ) {
            stopDenshouoSeaBgm();
            return;
          }
          startDenshouoSeaBgm({ ctx, destination: master });
        })
        .catch(() => {
          bgmTimerRef.current = null;
        });
      return;
    }

    if (currentWorkId && EXCLUSIVE_BGM_WORK_IDS.has(currentWorkId)) return;

    // Home screen Tone.js rain/thunder effect
    if (
      currentPathname === "/" &&
      (currentWeather === "Rain" || currentWeather === "Thunder")
    ) {
      import("@/lib/homeRainTone")
        .then(({ startHomeRain, stopHomeRain }) => {
          if (
            session !== bgmSessionRef.current ||
            isMutedRef.current ||
            latestAudioStateRef.current.pathname !== "/"
          ) {
            stopHomeRain();
            return;
          }
          const ambientWeather = latestAudioStateRef.current.weather === "Thunder" ? "Rain" : latestAudioStateRef.current.weather;
          void startHomeRain(ambientWeather).catch(() => {});
        })
        .catch(() => {});
    }

    const profile = getLofiBgmProfile(
      currentWeather,
      currentActivityLevel,
      currentWorkId,
    );
    bgmStepRef.current = 0;

    const tick = () => {
      if (isMutedRef.current) return;
      const latestState = latestAudioStateRef.current;
      if (
        latestState.resolvedWorkId &&
        EXCLUSIVE_BGM_WORK_IDS.has(latestState.resolvedWorkId)
      )
        return;

      const index = bgmStepRef.current % profile.notes.length;
      const base = profile.notes[index];
      const isHomeBgm = latestState.pathname === "/" && !latestState.resolvedWorkId;
      const swayAmount = isHomeBgm ? 0.015 : 0.08;
      const sway = 1 + Math.sin(bgmStepRef.current * 0.63) * swayAmount;
      const deepBed = base * 0.5;
      const top = base * profile.highRatio;
      const pulse = base * profile.pulseRatio;
      const homeGain = 1;

      playTone(base * sway, 2.9, 0.055 * homeGain, profile.waveform);
      playTone(deepBed, 2.4, 0.028 * homeGain, "sine", 0.08);
      playTone(top * sway, 1.6, 0.015 * homeGain, "sine", 0.34);
      playTone(pulse, 0.36, 0.022 * homeGain, "triangle", 0.62);
      playTone(
        base * profile.accentRatio,
        0.28,
        profile.accentVolume * homeGain,
        profile.accentWaveform,
        profile.accentAt,
      );

      if (latestState.weather === "Rain" || latestState.weather === "Clouds") {
        if (!(latestState.pathname === "/" && latestState.weather === "Rain")) {
          playNoiseBurst(0.1, 0.0026, 0.72, 1400);
        }
      }

      bgmStepRef.current += 1;
    };

    tick();
    bgmTimerRef.current = window.setInterval(tick, profile.tickMs);
  };

  const stopBgm = () => {
    bgmSessionRef.current += 1;

    activeAudioSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {}
    });
    activeAudioSourcesRef.current.clear();

    import("@/lib/homeRainTone")
      .then(({ stopHomeRain }) => {
        stopHomeRain();
      })
      .catch(() => {});

    if (bgmTimerRef.current !== null) {
      if (bgmTimerRef.current === OTENKI_BGM_FLAG) {
        import("@/lib/otenkiToneBgm").then(({ stopOtenkiBgm }) => {
          stopOtenkiBgm();
        });
      } else if (bgmTimerRef.current === DENSHOUO_BGM_FLAG) {
        import("@/lib/denshouoSeaBgm").then(({ stopDenshouoSeaBgm }) => {
          stopDenshouoSeaBgm();
        });
      } else {
        window.clearInterval(bgmTimerRef.current);
      }
      bgmTimerRef.current = null;
    }
  };

  const setMutedState = async (nextMuted: boolean) => {
    isMutedRef.current = nextMuted;
    setIsMuted(nextMuted);
    window.localStorage.setItem(MUTE_KEY, nextMuted ? "1" : "0");

    const ok = await ensureAudioGraph();
    if (!ok) return;

    if (nextMuted) {
      stopBgm();
      return;
    }

    startBgm();
    playTone(523.25, 0.12, 0.08, "triangle");
  };

  const handleToggleMute = async () => {
    if (!hasUnlockedAudioRef.current && !isMutedRef.current) {
      const ok = await ensureAudioGraph();
      if (!ok) return;
      hasUnlockedAudioRef.current = true;
      setHasUnlockedAudio(true);
      startBgm();
      playTone(523.25, 0.12, 0.08, "triangle");
      return;
    }

    await setMutedState(!isMutedRef.current);
  };

  useEffect(() => {
    if (isCardPage) return;
    if (typeof window === "undefined") return;

    const savedMuted = window.localStorage.getItem(MUTE_KEY);
    isMutedRef.current = savedMuted === null ? true : savedMuted === "1";
    setIsMuted(isMutedRef.current);

    const unlockAudio = async (event?: Event) => {
      if (hasUnlockedAudioRef.current) return;
      const target = event?.target as HTMLElement | null;
      if (target?.closest("[data-sound-toggle]")) return;

      const ok = await ensureAudioGraph();
      if (!ok) return;
      hasUnlockedAudioRef.current = true;
      setHasUnlockedAudio(true);
      if (!isMutedRef.current) {
        startBgm();
      }
    };

    const toggleMute = async (event: KeyboardEvent) => {
      // 入力フォームでのキー操作の場合は無視する
      const target = event.target as HTMLElement | null;
      const isInput =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (isInput) return;

      // 'm' キー以外は無視する
      if (event.key.toLowerCase() !== "m") return;

      event.preventDefault();
      await handleToggleMute();
    };

    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("keydown", toggleMute);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("keydown", toggleMute);
      stopBgm();
      hasUnlockedAudioRef.current = false;
      setHasUnlockedAudio(false);

      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }

      audioContextRef.current = null;
      masterGainRef.current = null;
      outputLowpassRef.current = null;
      outputConvolverRef.current = null;
      outputDryGainRef.current = null;
      outputWetGainRef.current = null;
      outputCompressorRef.current = null;
    };
  }, [isCardPage]);

  useEffect(() => {
    if (isCardPage) return;
    const previous = previousTransitionRef.current;
    previousTransitionRef.current = transitionType;

    if (resolvedWorkId && EXCLUSIVE_BGM_WORK_IDS.has(resolvedWorkId)) return;

    if (transitionType === "none" || transitionType === previous) {
      return;
    }

    void ensureAudioGraph().then((ok) => {
      if (!ok) return;
      playTransitionSfx(transitionType);
    });
  }, [isCardPage, transitionType]);

  useEffect(() => {
    if (isCardPage) return;
    if (isMutedRef.current) return;
    if (bgmTimerRef.current === null) return;

    stopBgm();
    startBgm();
  }, [activeWorkId, githubActivityLevel, isCardPage, pathname, weather]);

  if (isCardPage || pathname === "/otenkigurashi") return null;

  const soundButtonPositionClass =
    pathname === "/"
      ? "right-4 bottom-24 sm:right-6 sm:bottom-6"
      : "right-4 bottom-6 sm:right-6 sm:bottom-6";

  return (
    <div
      className={`fixed ${soundButtonPositionClass} z-70 pointer-events-auto`}
    >
      <button
        data-sound-toggle
        type="button"
        onClick={() => {
          void handleToggleMute();
        }}
        aria-pressed={!isMuted}
        aria-label={!hasUnlockedAudio ? "Start sound" : isMuted ? "Enable sound" : "Disable sound"}
        className="group inline-flex items-center gap-2 rounded-md border border-cyan-400/30 bg-[#05080d]/80 px-3 py-2 text-[10px] font-mono tracking-[0.22em] text-cyan-200/90 backdrop-blur transition-colors hover:border-cyan-300 hover:text-white"
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${isMuted ? "bg-gray-500" : "bg-cyan-300 animate-pulse"}`}
        />
        <span>{isMuted ? "SOUND OFF" : "SOUND ON"}</span>
      </button>
    </div>
  );
}
