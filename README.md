# WAKATO | Living Planet

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

**WAKATO | Living Planet** は、自身の活動や作品群を「生きた世界」として再構築した、没入型の3Dグラフィック体験作品です。

天候、時間、季節、音、作品ごとの遷移演出が連動し、訪問者は情報を読むだけではなく、世界を探索するように作品へ触れていきます。

[https://wakato.tech](https://wakato.tech)

> 最終更新: 2026-08-24

---

## Awards

<a href="https://www.csswinner.com/details/wakato-3d-portfolio/19159">
  <img src="public/sotd-black.png" alt="CSS Winner - Site of the Day" width="136" />
</a>

[CSS Winner - Site of the Day](https://www.csswinner.com/details/wakato-3d-portfolio/19159)

---

## Concept

この作品の中心にあるのは、普通の作品一覧を「情報」ではなく「体験」に変えることです。

静的な自己紹介ではなく、天候や季節によって空気が変わり、作品を選ぶたびに別の世界へ移動する。コード、作品、音、グラフィック、インタラクションをひとつの環境として扱うことで、Webブラウザ上に自分自身の世界を作っています。

---

## Current State

現在のLiving Planetは、作品ページを個別に並べるだけではなく、`weather`・`season`・`seasonEvent` をひとつの **WorldState** として扱う構成です。ホームで変化した世界の状態をURLへ正規化して、作品間の移動や各ページの演出へ引き継ぎます。

### 季節イベントと体験プリセット

#### WorldStateイベント

| プリセット | 状態 | 主な演出 |
| --- | --- | --- |
| `tsuyu` | 夏 + 雨 / 曇り | 梅雨の空気、雨、雲の表現 |
| `geshi` | 夏 + 晴れ / 朝 | 夏至の太陽と光の表現 |
| `hatsuhinode` | 冬 + 朝 | 元日の初日の出をイメージした朝焼け |
| `birthday` | 朝 + 誕生日イベント | ホーム全体にWebGL花火を表示 |

#### 季節ビジュアルプリセット

| プリセット | 状態 | 主な演出 |
| --- | --- | --- |
| `sakura` | 春 + 晴れ | 桜の花びらと春の大気 |
| `hanagumori` | 春 + 曇り | 花曇りの雲と花びら |
| `momiji` | 秋 + 晴れ | 紅葉と秋の地面 |
| `tsukimi` | 秋 + 夜 | 月見の夜の光 |
| `yukigeshiki` | 冬 + 雪 | 雪景色と雪の大気 |
これらは単発の表示フラグではなく、URL・Zustandストア・季節ビジュアルプロファイルで同じ状態を参照します。ホーム左上のCLIから、たとえば `sudo make tsuyu` や `sudo make birthday` を実行して体験できます。

### 作品間の状態共有

天候や季節イベントを指定したまま、ホームから作品へ遷移できます。

```text
Home
  -> /otenkigurashi?weather=Rain&season=summer&seasonEvent=tsuyu
  -> /denshouo?weather=Rain&season=summer&seasonEvent=tsuyu
```

不正な組み合わせは `src/lib/worldState.ts` で正規化し、ページごとに異なる季節状態が残らないようにしています。

### WebGLが使えない環境への対応

`Denshouo` はブラウザのWebGL対応状況を確認し、Canvasの初期化に失敗した場合はCSS / DOMベースの海中表現を残す構成です。3D表現が使えない環境でも、作品の情報と大気演出を失わないことを優先しています。

---

## Frontend Architecture

このプロジェクトは、画面をただ描画する構成ではなく、**状態を変えると世界が反応する** 形で設計しています。

```text
View
  操作とページ構造
  src/app
  src/components/dom

State
  世界の現在の状態
  src/store

Rendering / Effects
  状態をもとに3D、天候、遷移、音を出す
  src/components/canvas
  src/components/GlobalTransitionOverlay.tsx
  src/components/SoundDirector.tsx
```

### 1. View

`src/app` は Next.js App Router のページ層です。

ホーム画面では、作品一覧、HUD、言語切り替え、技術スタック、フッターなどを構成しています。UIパーツは主に `src/components/dom` に分け、Canvas表現と混ざりすぎないようにしています。

主なファイル:

- `src/app/page.tsx`
- `src/components/dom/WorksList.tsx`
- `src/components/dom/TopLeftMenu.tsx`
- `src/components/dom/WeatherDebugSelector.tsx`

### 2. State

`src/store/index.ts` では Zustand を使って、作品全体で共有する状態を管理しています。

ここにあるのは、単なるUI状態ではなく「今この世界がどういう状態か」です。

```ts
weather
season
seasonEvent
githubActivityLevel
activeWorkId
transitionType
```

たとえば作品をクリックすると `transitionType` が変わり、それを見た遷移レイヤーが対応する演出を表示します。

```text
WorksList
  -> transitionType = "freeze"
  -> GlobalTransitionOverlay
  -> FreezeTransitionCanvas
  -> /coldkeep
```

### 3. Rendering / Effects

`src/components/canvas` は、3D空間や演出を担当する層です。

ホームの背景は `SceneClient` と `Scene` に分かれています。`SceneClient` はローディング制御、`Scene` は React Three Fiber の Canvas 本体を担当します。

主なファイル:

- `src/components/canvas/SceneClient.tsx`
- `src/components/canvas/Scene.tsx`
- `src/components/canvas/AbstractCore.tsx`
- `src/components/canvas/Weather.tsx`
- `src/components/canvas/effects/SunraysCanvas.tsx`
- `src/components/canvas/effects/SnowCanvas.tsx`
- `src/components/canvas/effects/ThunderCanvas.tsx`

---

## Weather And Season System

天候と季節の演出は `WeatherEffectsOverlay` に集約しています。

```text
weather + season + seasonEvent
  -> SunraysCanvas
  -> CloudsOverlayCanvas
  -> SnowCanvas
  -> ThunderCanvas
  -> NightGlowOverlay
```

例:

```text
Clear + spring
  -> spring-clear

Clear + summer + geshi
  -> geshi-clear

Snow + winter
  -> winter-snow
```

これにより、通常の天候だけでなく、桜、梅雨、夏至、紅葉、雪景色、初日の出のような季節イベントも同じ状態モデルから扱えます。誕生日イベントは季節とは独立したイベントとして、ホームのWebGL花火へ接続しています。

---

## Transition System

作品ごとの遷移は `GlobalTransitionOverlay` が担当します。

作品をクリックすると、まず Zustand の `transitionType` を変更し、そのあとページ遷移します。これにより、ただリンクで移動するのではなく、ホームの世界から各作品の世界へ移動するような体験にしています。

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

- React Three Fiber / WebGLで構成したインタラクティブな3Dワールド
- 天候・季節・季節イベントを正規化する共有WorldState
- 梅雨、夏至、初日の出、誕生日などの日付・状態連動イベント
- GitHub Planet、Otenkigurashi、ColdKeep、reCAPTCHA Game、Denshouoをつなぐ作品別遷移
- Tone.jsによる状態連動のサウンドディレクション
- DenshouoのWebGL検出とCSS fallback
- Playwright + FFmpegで生成するREADME用プレビューGIFと、各サービスに使う静止画OGP
- GitHub Actionsで更新するREADME用ライブプレビューGIF
- PWA support

---

## Tech Stack

| Area | Tech |
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
| Deploy | Vercel |

---

## Directory Guide

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

## Getting Started

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

## Generated Previews

### OGP / X Preview

DiscordやXなどのSNS用OGPは、過去にも使っていたWAKATOロゴを `src/app/opengraph-image.png` として静止画配信します。SNS側のGIF再生仕様に依存せず、常に同じブランドカードを表示できます。

### README Preview GIF

README上部のプレビューは `/card` を `1200x600` で録画したライブ天候GIFです。生成物は `preview-assets` ブランチへ分離して保存し、READMEから `raw.githubusercontent.com` 経由で参照しています。

```text
main
  source code

preview-assets
  preview.gif
```

この構成により、生成メディアをmainのソースツリーへ混ぜずに、GitHub上では常に高解像度のカードプレビューを表示できます。

---

<div align="center">
  <strong>Code breathes with the atmosphere.</strong>
</div>
