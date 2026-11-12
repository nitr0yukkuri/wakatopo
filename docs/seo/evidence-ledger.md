# SEO表現の根拠

調査日: 2026-11-11。リポジトリ上の実装、公開HTML、公式受賞ページ、作品リポジトリを区別して確認した。

| 主張 | 対象 | 状態 | 根拠 | 表現の範囲 |
| --- | --- | --- | --- | --- |
| CSS Winner Site of the Day | Living Planet | verified | [公式受賞ページ](https://www.csswinner.com/details/wakato-3d-portfolio/19159): 06 Apr 2026 | サイトの受賞。GitHub PlanetのStarと混同しない |
| Next.js / R3F / Three.js / GLSL | このサイト | verified | package.json、src/components/canvas/、シェーダー実装 | 使用技術として掲載。性能や順位は保証しない |
| 天候・季節・時間帯の3D演出 | このサイト | verified | src/lib/actions.ts、seasonResolver.ts、WorldStateProvider.tsx、canvas配下 | 大阪の天候を利用。GitHub活動値は現在固定値であり、ホームを実データ同期と宣伝しない |
| GitHub活動を惑星化する作品 | GitHub Planet | verified / personal contribution self-reported | [公式リポジトリ](https://github.com/nitr0yukkuri/githubplanet)、作品詳細 | 使用者の活動データを可視化する作品。単独制作や担当範囲は追加しない |
| 音から残量を推定する研究 | ColdKeep | verified as documented experimental scope | [現在のREADME](https://github.com/nitr0yukkuri/coldkeep/blob/main/README.md) | 実験的プロトタイプ、空/半分/満杯、未学習/低信頼度は未判定 |
| 水温の高精度推定、TFLite/C++ JSI実装 | ColdKeep旧コピー | conflicting | 現在のREADMEは水温・保冷時間・正確な氷個数を推定しないと明記。TypeScript/Kotlin、任意Rust経路を記載 | ホーム・詳細・メタデータの該当説明を修正。小規模評価を製品精度として使わない |
| 天候と暮らすPWA、魚に幸せを乗せるSNS、画像認証対戦ゲーム | おてんきぐらし / でんしょうお / reCAPTCHA Game | self-reported product scope; local presentation verified | 各作品の実在ルート・詳細コピー・公式リポジトリリンク | 既存の作品紹介の範囲で記載。今回ゲーム内部や外部バックエンドの全機能は再検証していない |
| ECC在学・29卒、各個人受賞歴 | About | self-reported / existing content | About既存記載と本人申告 | 既存情報を維持。新しい年齢・資格・職歴を創作しない |
| サポーターズ賞「俺を捌け！」 | About | self-reported | 本人申告・[マージ済みPR #88](https://github.com/nitr0yukkuri/wakatopo/pull/88) | 既存mainの追加分を維持。英語欄の作品名はローマ字表記 `Ore wo Sabake!` |
| X公式プロフィール | WAKATO | verified as linked identity | Aboutとホームの既存リンク `https://x.com/0ts_st` | 誤って記載されていたtwitter.com/nitr0yukkuriをJSON-LDから除去 |

受賞・モデル精度・個人の担当範囲を推測で追加しない。Search Consoleの登録状態、Googleが選んだcanonical、実ユーザーのCWVは権限のある画面で別途確認が必要。
