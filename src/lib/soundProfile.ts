import type { WeatherType } from './worldStateTypes';

export type TransitionType =
  | 'none'
  | 'warp'
  | 'cloud'
  | 'freeze'
  | 'rain'
  | 'snow'
  | 'sunburst'
  | 'flash'
  | 'heavy-cloud'
  | 'wave'
  | 'moonrise'
  | 'captcha-lock';

export type AudioStateSnapshot = {
  pathname: string;
  resolvedWorkId: string | null;
  weather: WeatherType;
  githubActivityLevel: number;
};

export const MUTE_KEY = 'lp-audio-muted';
export const OUTPUT_BOOST = 2.2;
export const OTENKI_BGM_FLAG = -1;
export const DENSHOUO_BGM_FLAG = -2;

const EXCLUSIVE_BGM_WORK_IDS = new Set(['02', '05']);

export function resolveAudioWorkId(pathname: string, activeWorkId: string | null) {
  if (pathname === '/github-planet') return '01';
  if (pathname === '/otenkigurashi') return '02';
  if (pathname === '/coldkeep') return '03';
  if (pathname === '/recaptcha-game') return '04';
  if (pathname === '/denshouo') return '05';
  return activeWorkId;
}

export function hasExclusiveBgm(workId: string | null) {
  return workId !== null && EXCLUSIVE_BGM_WORK_IDS.has(workId);
}
