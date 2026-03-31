# 🌍 WAKATOPO | Living Planet Portfolio

<div align="center">
  <img src="https://img.shields.io/badge/Status-In_Development-orange?style=for-the-badge&logo=git&logoColor=white" />
  <img src="https://img.shields.io/badge/Stack-Next.js_16_×_R3F-000000?style=for-the-badge&logo=next.js&logoColor=white" />
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

# 🌐 Live Demo

**Experience the living planet directly in your browser**

👉 **[wakato.tech](https://wakato.tech)**

GitHubの活動履歴とリアルタイム天気が融合した
**インタラクティブな3Dポートフォリオ**を実際に体験できます。

---

# 🧬 Concept: Fusion of Two Origins

このプロジェクトは、過去に開発された2つの代表作のコンセプトを融合し、
最新のWeb技術で再構築した **「技術と表現の集大成」** です。

## 01. Structural DNA from GitHub Planet

> **"Code as Terrain"**

開発者のGitHub活動履歴（Contributions）を解析し、
3D空間上の惑星として可視化するプロジェクト「GitHub Planet」のアルゴリズムを継承。

日々のコミット数、使用言語、継続力が
惑星の **地形（Displacement）** や **鼓動（Pulse）** を形成します。

エンジニアとしてのアイデンティティそのものを、
惑星の質量として表現します。

## 02. Atmospheric DNA from Otenki Gurashi

> **"Life synced with Weather"**

現実の気象とリンクして生活する育成ゲーム
「おてんきぐらし」の環境連動エンジンを統合。

ユーザー（または開発者拠点）のリアルタイム天気情報が、
3D空間内の **天候（雨・雲・光）** と直結します。

デジタル空間に
**湿度や温度のような情緒的レイヤー** を追加します。

<div align="center">
  <h3>GitHub Planet × Otenki Gurashi = <b>Wakato Portfolio</b></h3>
</div>

---

# ✨ Features

## 🪐 Living Planet Core

GLSLカスタムシェーダーにより
単なる3Dモデルではなく **「呼吸する有機体」** として惑星を描画。

GitHub活動量が高い時期は激しく脈打ち、
活動が停滞すると静寂に包まれます。

---

## 🌦️ Immersive Weather System

OpenWeatherMap API と連動し
Webキャンバス上に気象現象を再現。

* **Rain**
  パーティクルによる降雨 + スクリーン水滴エフェクト

* **Clear**
  ブルーム処理による強い日差し

* **Night**
  ノスタルジックな夜のライティング

---

## ⚡ Next-Gen Performance

「見て楽しい」だけでなく
**エンジニアリング品質** も重視。

* **React Server Components (RSC)**
  初期ロード高速化 + SEO最適化

* **Instanced Mesh & Shader Optimization**
  GPUのみで数千パーティクル処理

* **Fluid Animations**
  Framer Motion + Anime.js による滑らかなUI

---

# 🛠 Tech Stack

| Domain    | Technology               | Role                        |
| --------- | ------------------------ | --------------------------- |
| Framework | Next.js 16               | App Router / Server Actions |
| Language  | TypeScript               | Strict Mode                 |
| 3D Engine | React Three Fiber        | 3D Scene                    |
| Shaders   | GLSL                     | Vertex Displacement         |
| Styling   | Tailwind CSS v4          | UI                          |
| Animation | Framer Motion / Anime.js | Motion                      |
| State     | Zustand                  | Global State                |

---

# 📂 Architecture

```bash
src/
├── app/                  # Next.js App Router
├── components/
│   ├── canvas/           # 3D World (R3F)
│   │   ├── Planet.tsx
│   │   ├── Weather.tsx
│   │   └── Scene.tsx
│   └── dom/              # UI Overlay
├── lib/
│   └── actions.ts        # API Fetch
├── shaders/              # GLSL
└── store/                # Zustand
```

---

# 🚀 Getting Started

```bash
# Clone
git clone https://github.com/nitr0yukkuri/wakatopo.git

# Install
npm install

# Run
npm run dev
```

Open
http://localhost:3000

---

# 🔮 Roadmap




* [ ] Mobile Gyro
  スマホ傾きによるパララックス

---

<div align="center">

Built with 💻 ☕ 🌧️
by **nitr0yukkuri**

*"This portfolio is a living organism."*

</div>
