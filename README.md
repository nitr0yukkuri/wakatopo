# 🌍 WAKATOPO | Living Planet Portfolio

<div align="center">
  <img src="https://img.shields.io/badge/Status-In_Development-orange?style=for-the-badge&logo=git&logoColor=white" />
  <img src="https://img.shields.io/badge/Stack-Next.js_15_×_R3F-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</div>

<br />

<div align="center">
  <h2>"Where Code Breathes with the Atmosphere."</h2>
  <p>
    開発者の<b>「活動の軌跡」</b>が大地となり、現実世界の<b>「空気」</b>が空を染める。<br/>
    静的なポートフォリオを、有機的な「惑星」へと昇華させる実験的プロジェクト。
  </p>
</div>

---

## 🧬 Concept: Fusion of Two Origins

このプロジェクトは、過去に開発された2つの代表作のコンセプトを融合し、最新のWeb技術で再構築した**「技術と表現の集大成」**です。

### 01. Structural DNA from [GitHub Planet]
> **"Code as Terrain"**
>
> 開発者のGitHub活動履歴（Contributions）を解析し、3D空間上の惑星として可視化するプロジェクト「GitHub Planet」のアルゴリズムを継承。
> 日々のコミット数、使用言語、継続力が、惑星の「地形（Displacement）」や「鼓動（Pulse）」を形成します。エンジニアとしてのアイデンティティそのものを、惑星の質量として表現します。

### 02. Atmospheric DNA from [Otenki Gurashi]
> **"Life synced with Weather"**
>
> 現実の気象とリンクして生活する育成ゲーム「おてんきぐらし」の環境連動エンジンを統合。
> ユーザー（または開発者拠点）のリアルタイムな天気情報が、3D空間内の天候（雨、雲、光）と直結します。デジタル空間に「湿度」や「温度」といった情緒的なレイヤーをもたらします。

<div align="center">
  <h3>GitHub Planet × Otenki Gurashi = <b>WAKATOPO</b></h3>
</div>

---

## ✨ Features

### 🪐 Living Planet Core
GLSLカスタムシェーダーにより、単なる3Dモデルではなく「呼吸する有機体」としての惑星を描画。
GitHubの活動量が高い時期は激しく脈打ち、活動が停滞すると静寂に包まれます。

### 🌦️ Immersive Weather System
OpenWeatherMap APIと連動し、Web上のキャンバスに物理的な気象現象を再現。
- **Rain:** パーティクルシステムによる降雨と、スクリーン上の水滴エフェクト。
- **Clear:** ブルーム（発光）処理による、鮮烈な日差しの表現。
- **Night:** 活動時間外における、静謐でノスタルジックな夜のライティング。

### ⚡ Next-Gen Performance
「見て楽しい」だけでなく、エンジニアリングとしての品質も追求。
- **React Server Components (RSC):** 初期ロードの高速化とSEOへの配慮。
- **Instanced Mesh & Shader Optimization:** 数千のパーティクルや複雑な計算を、GPUのみで処理し60fpsを維持。

---

## 🛠 Tech Stack

過去のプロジェクト（Vanilla JS / Three.js）で培った知見をベースに、より堅牢でスケーラブルなモダンスタックへ移行しました。

| Domain | Technology | Role |
| :--- | :--- | :--- |
| **Framework** | ![Next.js](https://img.shields.io/badge/-Next.js_15-black) | App Router, Server Actions |
| **Language** | ![TypeScript](https://img.shields.io/badge/-TypeScript-blue) | Type Safety, Strict Mode |
| **3D Engine** | ![R3F](https://img.shields.io/badge/-React_Three_Fiber-red) | Declarative 3D Scene Management |
| **Shaders** | ![GLSL](https://img.shields.io/badge/-GLSL-purple) | Custom Material, Vertex Displacement |
| **Styling** | ![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-38bdf8) | UI Overlay, Responsive Design |
| **State** | ![Zustand](https://img.shields.io/badge/-Zustand-orange) | Global State Management |

---

## 📂 Architecture

```bash
src/
├── app/                  # Next.js App Router
├── components/
│   ├── canvas/           # 3D World (R3F)
│   │   ├── Planet.tsx    # "GitHub Planet" Logic
│   │   ├── Weather.tsx   # "Otenki Gurashi" Logic
│   │   └── Scene.tsx     # Composition
│   └── dom/              # UI Overlay
├── lib/
│   └── actions.ts        # Data Fetching (GitHub/Weather API)
├── shaders/              # GLSL Source Code
└── store/                # Global State
🚀 Getting Started
Experience the planet locally.

Bash
# Clone the repository
git clone [https://github.com/nitr0yukkuri/wakatopo.git](https://github.com/nitr0yukkuri/wakatopo.git)

# Install dependencies
npm install

# Run development server
npm run dev
Open http://localhost:3000 with your browser.

🔮 Roadmap
[ ] Repository Galaxy: 単一の惑星だけでなく、リポジトリ群を「衛星」として周回させる。

[ ] Interactive Wind: マイク入力（息）で雲を吹き飛ばすインタラクションの実装。

[ ] Mobile Gyro: スマホの傾きによる視差効果（Parallax）の追加。

<div align="center">
<p>
Built with 💻, ☕, and 🌧️ by <a href="https://www.google.com/search?q=https://github.com/nitr0yukkuri"><b>nitr0yukkuri</b></a>
</p>
<p>
<i>"This portfolio is a living organism."</i>
</p>
</div>
