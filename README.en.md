# WAKATO | Living Planet

[日本語](README.md) | [English](README.en.md)

<div align="center">
  <a href="https://wakato.tech">
    <img src="https://raw.githubusercontent.com/nitr0yukkuri/wakatopo/preview-assets/preview.gif" alt="WAKATO | Living Planet preview" width="800" />
  </a>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/CSS_Winner-SOTD_WINNER-gold?style=for-the-badge&logo=trophy&logoColor=white" alt="CSS Winner SOTD Winner" />
  <img src="https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge" alt="Status Live" />
  <img src="https://img.shields.io/badge/Stack-Next.js_16_/_R3F-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js and R3F" />
</div>

<br />

**WAKATO | Living Planet** is an immersive 3D graphic experience that reconstructs the creator’s activities and works as a “living world.”

Weather, time, seasons, sound, and transitions between works interact. Visitors do not simply read information; they explore and engage with the works as if discovering a world.

[https://wakato.tech](https://wakato.tech)

> Last updated: 2026-08-24

---

## Awards

<a href="https://www.csswinner.com/details/wakato-3d-portfolio/19159">
  <img src="public/sotd-black.png" alt="CSS Winner - Site of the Day" width="136" />
</a>

[CSS Winner - Site of the Day](https://www.csswinner.com/details/wakato-3d-portfolio/19159)

---

## Concept

At the center of this project is the idea of turning an ordinary list of work from “information” into an “experience.”

Rather than a static profile, the atmosphere changes with the weather and season, and selecting a work takes visitors into another world. By treating code, projects, sound, graphics, and interaction as one environment, the site creates a personal world in the web browser.

---

## Current state

Living Planet currently treats `weather`, `season`, and `seasonEvent` together as a single **WorldState**, rather than simply listing work pages separately. The world state that changes on the home page is normalized into the URL and carried into transitions between works and each page’s effects.

### Seasonal events and experience presets

#### WorldState events

| Preset | State | Main effects |
| --- | --- | --- |
| `tsuyu` | Summer + Rain / Cloudy | Rainy-season atmosphere, rain, and clouds |
| `geshi` | Summer + Clear / Morning | Summer-solstice sun and light |
| `hatsuhinode` | Winter + Morning | Sunrise colors inspired by New Year’s Day |
| `birthday` | Morning + Birthday event | WebGL fireworks across the home page |

#### Seasonal visual presets

| Preset | State | Main effects |
| --- | --- | --- |
| `sakura` | Spring + Clear | Cherry-blossom petals and spring atmosphere |
| `hanagumori` | Spring + Cloudy | Cloudy spring skies and petals |
| `momiji` | Autumn + Clear | Autumn leaves and an autumn ground |
| `tsukimi` | Autumn + Night | Moon-viewing night light |
| `yukigeshiki` | Winter + Snow | Snowy scenery and atmosphere |

These are not one-off display flags. The URL, Zustand store, and seasonal visual profile refer to the same state. The rainy season and first sunrise are selected automatically based on the date, but the dedicated summer-solstice color is enabled only by running `sudo make geshi` from the CLI in the upper-left corner of the home page.

### Sharing state between works

Navigate from the home page to a work while keeping the selected weather or seasonal event:

```text
Home
  -> /otenkigurashi?weather=Rain&season=summer&seasonEvent=tsuyu
  -> /denshouo?weather=Rain&season=summer&seasonEvent=tsuyu
```

Invalid combinations are normalized in `src/lib/worldState.ts` so that pages do not retain inconsistent seasonal states.

### Support for environments without WebGL

`Denshouo` checks browser WebGL support and keeps a CSS / DOM-based underwater scene if Canvas initialization fails. It prioritizes retaining the work’s information and atmosphere even when 3D rendering is unavailable.

---

## Frontend architecture

This project is designed so that **changing the state makes the world respond**, rather than simply drawing a screen.

```text
View
  Controls and page structure
  src/app
  src/components/dom

State
  The current state of the world
  src/store

Rendering / Effects
  Render 3D, weather, transitions, and sound from the state
  src/components/canvas
  src/components/GlobalTransitionOverlay.tsx
  src/components/SoundDirector.tsx
```

### 1. View

`src/app` is the page layer for the Next.js App Router.

The home screen is composed of the work list, HUD, language switcher, tech stack, footer, and other elements. UI components are primarily organized under `src/components/dom` to keep them separate from Canvas rendering.

Main files:

- `src/app/page.tsx`
- `src/components/dom/WorksList.tsx`
- `src/components/dom/TopLeftMenu.tsx`
- `src/components/dom/WeatherDebugSelector.tsx`

### 2. State

`src/store/index.ts` uses Zustand to manage state shared across the works.

This state is not just UI state; it represents “the current state of this world.”

```ts
weather
season
seasonEvent
githubActivityLevel
activeWorkId
transitionType
```

For example, clicking a work changes `transitionType`, and the transition layer responds by showing the corresponding effect.

```text
WorksList
  -> transitionType = "freeze"
  -> GlobalTransitionOverlay
  -> FreezeTransitionCanvas
  -> /coldkeep
```

### 3. Rendering / Effects

`src/components/canvas` is the layer responsible for 3D space and visual effects.

The home background is split into `SceneClient` and `Scene`. `SceneClient` controls loading; `Scene` owns the React Three Fiber Canvas.

Main files:

- `src/components/canvas/SceneClient.tsx`
- `src/components/canvas/Scene.tsx`
- `src/components/canvas/AbstractCore.tsx`
- `src/components/canvas/Weather.tsx`
- `src/components/canvas/effects/SunraysCanvas.tsx`
- `src/components/canvas/effects/SnowCanvas.tsx`
- `src/components/canvas/effects/ThunderCanvas.tsx`

---

## Weather and season system

Weather and seasonal effects are centralized in `WeatherEffectsOverlay`.

```text
weather + season + seasonEvent
  -> SunraysCanvas
  -> CloudsOverlayCanvas
  -> SnowCanvas
  -> ThunderCanvas
  -> NightGlowOverlay
```

Examples:

```text
Clear + spring
  -> spring-clear

Clear + summer + geshi
  -> geshi-clear

Snow + winter
  -> winter-snow
```

This lets the same state model handle not only ordinary weather, but also seasonal events such as cherry blossoms, the rainy season, the summer solstice, autumn leaves, snow scenery, and the first sunrise of the year. The birthday event is independent of the season and connects to WebGL fireworks on the home page.

---

## Transition system

`GlobalTransitionOverlay` handles transitions for each work.

When a work is clicked, the app first changes Zustand’s `transitionType`, then navigates to the page. The experience is designed to feel like moving from the home world into the world of each work, rather than simply following a link.

```text
GitHub Planet
  -> warp

Otenkigurashi
  -> rain / snow / thunder / clouds / sunburst / moonrise

ColdKeep
  -> freeze

reCAPTCHA Game
  -> captcha-lock

Denshouo
  -> wave
```

---

## Features

- Interactive 3D world built with React Three Fiber / WebGL
- Shared WorldState that normalizes weather, seasons, and seasonal events
- Date-linked events such as the rainy season and first sunrise, plus summer-solstice and birthday presets available through the CLI
- Work-specific transitions connecting GitHub Planet, Otenkigurashi, ColdKeep, reCAPTCHA Game, and Denshouo
- Tone.js sound direction linked to world state
- WebGL detection and CSS fallback for Denshouo
- README preview GIFs generated with Playwright + FFmpeg, plus static OGP images for social platforms
- Live preview GIF for the README updated by GitHub Actions
- PWA support

---

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 |
| Language | TypeScript |
| 3D | Three.js, React Three Fiber |
| Shader / Graphics | WebGL, GLSL |
| Styling | Tailwind CSS |
| Animation | Framer Motion, Anime.js |
| State | Zustand |
| Audio | Tone.js |
| Test / Automation | Playwright, GitHub Actions |
| Deployment | Vercel |

---

## Directory guide

```text
src/
  app/
    page.tsx              Home page
    */page.tsx            Work detail pages

  components/
    canvas/               3D scenes, shaders, visual effects, transitions
    dom/                  HUD, menus, work list, debug controls
    GlobalTransitionOverlay.tsx
    HomeBackgroundLayers.tsx
    SoundDirector.tsx

  lib/
    actions.ts            Server-side weather/activity data
    *Bgm.ts               Sound generation helpers

  shaders/                GLSL shader modules
  store/                  Global world state with Zustand
```

---

## Getting started

```bash
git clone https://github.com/nitr0yukkuri/wakatopo.git
cd wakatopo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test:e2e
```

---

## Generated previews

### OGP / X preview

For social networks such as Discord and X, the WAKATO logo—used previously as well—is served as a static image at `src/app/opengraph-image.png`. This keeps the brand card consistent without depending on each platform’s support for GIF playback.

### README preview GIF

The preview at the top of the README is a live-weather GIF recorded from `/card` at `800x400`. The generated file is stored separately on the `preview-assets` branch and referenced from the README through `raw.githubusercontent.com`.

```text
main
  source code

preview-assets
  preview.gif
```

This keeps generated media out of the main source tree while providing a high-resolution card preview on GitHub.

---

<div align="center">
  <strong>Code breathes with the atmosphere.</strong>
</div>
