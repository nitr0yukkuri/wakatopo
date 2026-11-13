# WAKATO | Living Planet SEO監査・改善

調査日: 2026-11-11〜12。公開サイトのHTMLは変更前のもの。本番未反映の実装と監査結果を、SEO改善PRでレビューする。本番デプロイは行っていない。

## 調査方法と制約

- 公開サイトへHTTPでアクセスし、JavaScript未実行のHTML・ステータス・meta・リンク・見出し・JSON-LDを取得。`tmp/seo-public/audit.json` に保存。
- リポジトリの全App Routerルート、Canvas、言語切り替え、動的import、フォント、画像、テスト、環境変数名を確認。
- 作品と受賞の根拠は [evidence-ledger.md](evidence-ledger.md) を参照。
- Web検索は検索ツールによるスナップショットであり、地域・端末・パーソナライズを固定したGoogle順位計測ではない。検索量・順位上昇は未測定。
- PageSpeed Insights APIはHTTP 429（共有APIのクォータ超過）で取得不可。CrUXの実ユーザーLCP/INP/CLS、Search Consoleのクリック・インプレッション・インデックス状態は未確認。
- 監査開始時のブランチは `codex/fix-weather-gif-npm-lock`、未コミット差分はなし。PR用ブランチ `codex/seo-bilingual-portfolio` は最新 `origin/main`（`afaf306`）を基準にし、既にマージ済みの修正をPRへ混ぜていない。mainの実績追加も維持し、英語欄の作品名だけi18nチェックに合わせてローマ字表記にそろえた。依存関係は変更していない。

## 現状の問題と優先度

| 優先度 | 変更前の問題 | 対応 |
| --- | --- | --- |
| P0 | 主要7ページ×日英が同じタイトル・説明を継承。canonicalとhreflangなし | ページと言語ごとに固有のメタデータを実装 |
| P0 | トップと作品詳細5ページにH1なし。作品一覧はクリック可能なdiv | 表示デザインを維持してH1、通常のhrefリンクを追加。既存遷移演出はクリック/Enterで継続 |
| P0 | 英語URLの初期HTMLが `lang=ja` | Edge middlewareで正規化した言語をrootへ渡し、初期HTMLも一致。クライアント遷移は既存LocaleSyncで同期 |
| P0 | `sitemap.xml`が404。公開robotsはCloudflareのコメントのみでサイトマップ宣言なし | 14正規URLと相互hreflangのXML、robotsのSitemapを実装 |
| P1 | 全ページが同じProfilePage JSON-LDを出し、Xの関連付けも誤っている | AboutだけProfilePage/Person、ホームWebSite、作品CreativeWork、パンくずを実装 |
| P1 | /cardがindex可。/ogpは既存noindex | 両キャプチャ補助ページをnoindex、サイトマップから除外。robotsではクロールを許可しnoindexを読めるようにした |
| P1 | PNGロゴとプロフィール画像の転送量が大きい | 既存画質と表示寸法に合わせたWebP、実寸のPWA/アイコンを追加。旧アセットURLは保持 |
| P2 | フォントのswap時のレイアウト変化 | 先読みと代替フォント変更を比較したが、LCP/CLS両面で安定した改善を確認できず取り下げた。最終版は元のフォント構成を維持 |
| P1 | WebGL初期化失敗がReactツリーへ伝播する可能性 | 8箇所のCanvasに共通の局所ErrorBoundary/fallback。HTMLの説明・ナビゲーションを維持 |
| P1 | ColdKeepの公開説明と現行作品仕様が矛盾 | 日英の本文・ホーム紹介・メタデータを実験的な残量推定の範囲に修正 |
| P1 / 運用待ち | 公開 `http://wakato.tech`、`https://www.wakato.tech`、HTTPS apexはいずれも200 | HTTPS apexをcanonicalに統一。CloudflareでHTTP→HTTPS、www→apexのパス・query保持リダイレクトを別途確認・設定する。今回インフラ設定は変更していない |
| P1 | ミュート中の初回操作でも音響グラフを初期化 | 明示的な音ONまで初期化を遅延。既存の音・天候遷移と、ミュート時のリソース生成をテスト |
| P2 | WebGL描画中の操作遅延、モバイルLCP | ラボ測定で残る課題。追加のコード分割は初期表示・描画品質・音の起動タイミングまで検証してから実施 |

## 全ルートとページ設計

| ルート | 内容と初期HTML | インデックス・言語 |
| --- | --- | --- |
| `/` | SSR。WAKATO（わかと）、Creative Developer、天候/季節/時間帯、Three.js/WebGL、作品一覧 | ja bare / en `?lang=en`、WebSite/Person |
| `/about` | SSR。経歴・技術・実績・活動 | ja/en、ProfilePage/Person/BreadcrumbList |
| `/github-planet` | SSR本文＋遅延Canvas、GitHub活動の惑星可視化。現行公式ドメインへのリンクを修正 | ja/en、CreativeWork/BreadcrumbList |
| `/otenkigurashi` | SSR本文＋天候別のクライアント演出。生活シミュレーション/PWA | ja/en、CreativeWork/BreadcrumbList |
| `/coldkeep` | SSR本文＋遅延Canvas。振り音・3段階残量推定の実験的プロトタイプ | ja/en、CreativeWork/BreadcrumbList。JS無効でも本文が見えるnoscript補助 |
| `/recaptcha-game` | SSR本文＋演出。画像認証モチーフのリアルタイム対戦 | ja/en、CreativeWork/BreadcrumbList |
| `/denshouo` | SSR本文＋水中演出。小さな幸せを共有するSNS | ja/en、CreativeWork/BreadcrumbList |
| `/card` | 動的GIFキャプチャ用 | noindex/nofollow |
| `/ogp` | 静的OGP撮影用 | noindex/nofollow |
| 存在しないURL | 404ページ、ホームへの復帰リンク | HTTP 404・noindexを検証 |
| `/robots.txt` | 静的メタデータルート | Google等を許可、Sitemap宣言 |
| `/sitemap.xml` | 静的XMLメタデータルート | 7ページ×2言語のみ。debug params・撮影ページ・架空のlastmodなし |
| `/manifest.webmanifest` | 静的PWAメタデータ | ブランド名と画像実寸を修正 |
| `/opengraph-image.png` | Next.jsの画像メタデータルート | 既存1200×630カードを利用 |

Client Componentは必ずしもCSR専用ではない。今回の作品本文は初期HTMLに存在し、WebGL部分だけを `ssr:false` 等で分離している。天候や言語のため動的なページを無理にSSGへ変えていない。モバイル用DPR、シェーダー、粒子数、音、季節・天候遷移は維持。

## 日本語・英語URL

- 日本語の正規URLは既存のbare path、英語は `?lang=en`。`?lang=ja` は同じ日本語本文を返しbare pathをcanonicalにする。
- `weather`、`season`、`seasonEvent`、任意の追跡パラメータはcanonicalから除去。表示と遷移で使うURL自体は維持する。
- canonicalは各言語に自己参照。相互のja/enとx-default（日本語）をHTMLとXMLに出す。英語を日本語へcanonical化しない。
- HTML lang、OG locale、タイトル/説明、言語切替、関連作品リンクを整合。/enへのURL移行や自動言語リダイレクトは実施しない。
- Next.js 16のproxyはNode.js runtimeになるため、既存OpenNext Cloudflareアダプターが対応するEdge middlewareを使用。Nextの非推奨警告は既知で、アダプター対応確認前に自動変換しない。

## 検索意図と作品の見せ方

調査した検索: `WAKATO`、`わかと エンジニア`、`WAKATO Living Planet`、`Three.js Portfolio`、`WebGL Portfolio`、`Creative Developer Portfolio`、`Interactive Developer Portfolio`。

ブランドの長い検索では [既存ポートフォリオ](https://www.wakato.tech/) が取得できた。短いWAKATOには若戸大橋等の別の意味もあり、本人名・日本語表記・サイト名・公式プロフィールの一貫性を優先する。一般技術語ではチュートリアル、作品ギャラリー、個人作品が混在し、作品の独自性と詳しいケーススタディが必要。

| 検索意図 | 対応するページと改善 |
| --- | --- |
| WAKATO | トップとAbout。個人名・サイト名・公式プロフィールの関連付けを統一 |
| わかと エンジニア | 日本語トップ/About。日本語表記、経歴、実在する技術・実績を明示 |
| WAKATO Living Planet | トップ。サイト名・canonical・公式受賞歴を整合 |
| Three.js Portfolio | 英語トップとGitHub Planet。実際の3D作品へクロール可能なリンクを提供 |
| WebGL Portfolio | 英語トップと作品詳細。Canvas外の説明とWebGL非対応時のHTMLを維持 |
| Creative Developer Portfolio | 英語トップ/About。職種表現と作品のコンセプトを自然な文章で伝える |
| Interactive Developer Portfolio | 英語トップと作品詳細。天候・季節・遷移・操作の具体的な価値を説明 |

検索量・Googleでの固定順位・競合との流入差は未確認。この表は検索意図への設計であり、上位表示の実績ではない。

[Stefan Vitasović本人によるケーススタディ](https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/) と [IAMNK自身の作品紹介](https://www.iamnk.com/iamnk-portfolio) を参考に、映像やCanvasに加えてコンセプト・操作・技術的な判断をHTMLでも伝える方針にした。模倣やキーワードの羅列は行わない。

今後は各作品に本人の担当範囲、解決した課題、設計の理由、検証できる結果とデモを追加する。技術ブログ化ではなく、採用担当者が作品の価値を判断できるケーススタディを充実させる。

## パフォーマンスと検証

実ユーザーのINPと、ラボの単一操作時間は区別する。サンプルと条件は [measurements.json](measurements.json)、全ルートのmeta/HTTP監査は [audit-results.json](audit-results.json) に保存した。

同一のローカル本番ビルド環境で順番に測定。ホームはデスクトップ/モバイル各3回。モバイルは390×844、CPU 4倍減速、下り1.6Mbps、上り750kbps、遅延150ms。新規ブラウザーコンテキスト、キャッシュ無効、サービスワーカー停止。Clear/autumn/noneを固定。DOMContentLoaded後12秒を観測し、スクリーンショット後に通常のポートフォリオメニューを1回操作した。測定中にビルドや別のブラウザーテストは並走させていない。

| 指標（ホーム、3回中央値） | 変更前 | 採用版 |
| --- | ---: | ---: |
| Desktop LCP | 536ms（204–944） | 508ms（504–744） |
| Mobile LCP | 2,788ms（2,756–3,784） | 3,312ms（2,716–3,640） |
| Desktop CLS | 0.001493 | 0.000150 |
| Mobile CLS | 0.003541 | 0.002546 |
| Desktop メニュー操作のEvent Timing | 672ms（624–696） | 80ms（80–88） |
| Mobile メニュー操作のEvent Timing | 784ms（736–800） | 104ms（64–128） |

通常操作の待ち時間はこの条件では短くなった。一方、ホームのモバイルLCPは中央値が悪化しており、改善したとは報告しない。範囲が重なり、サンプルも少ないため、原因や本番での差を断定できない。フォントを元に戻した最終構成でも残る課題で、重い3D処理と初期HTML/フォント/JSの競合をステージングと実ユーザー計測で継続調査する。

作品ページのモバイル単回観測はGitHub Planetが3,352→4,328ms、ColdKeepが9,088→7,008ms、Aboutが2,596→2,672msだった。これは単回のラボ値で、統計的な改善や回帰の確定には使わない。全観測でJavaScript例外は0。GitHub Planetは操作前15秒まで3Dを遅延する既存仕様のため、この読み込み測定ではCanvas未起動。別の操作テストでWebGLを検証する。

ロゴ4点のファイルサイズは2,668,173→1,123,684 bytes（約58%削減）。表示サイズに十分な解像度のWebPを使用し、縦横比も予約寸法に反映した。旧PNGのURLは保持している。通常操作をミュート状態で測る一方、音ON操作・音源・多重起動抑止は別テストで確認する。

これらはCrUX/Search ConsoleのCore Web Vitals判定ではない。実ユーザーのINPは未確認。Googleの目標値は通常LCP 2.5秒以下、INP 200ms以下、CLS 0.1以下をユーザー訪問のp75で評価するため、ローカル3回中央値で合格を宣言しない。

検証状況:

- TypeScript `tsc --noEmit --incremental false`: 成功。
- `npm run test:i18n`: PR準備時に英語実績欄の日本語作品名を検出し、英語欄のみ `Ore wo Sabake!` に修正して成功。
- ESLint: エラー0、既存警告9（未使用変数、既存hooks依存、既存img等）。変更前にも同じ9件を確認。
- Next.js 16.4.5 Webpack本番ビルド: 成功。既知のEdge middleware非推奨警告あり。
- 全14言語URL: HTTP 200、初期HTMLのH1各1個、固有メタデータ、言語・canonical・相互hreflang・JSON-LDを検証。撮影ページnoindex、存在しないURLの404、robots/sitemapの200を検証。
- Playwright: 全49件成功、skip/flakyとも0。うちSEO検証20件。JavaScript無効の日英全ページ、言語のクライアント切替、キーボードでの作品遷移、WebGLの正常描画と明示的な非対応環境、モバイル、天候、季節、音響を確認。最終結果は `tmp/seo-playwright-final.json`、集計は [test-results.json](test-results.json)。
- PR準備で変更した英語の実績表記については、修正後の本番ビルドを作り直し、SEO 20件を再実行して全件成功。画像・3D・音響処理には追加変更なし。
- 既存テストの期待を、現在の明示的な音ON操作、URLから指定するMorning、ピアノBGMへ合わせた。短時間の雨滴はDOM出現を記録して検証。R3Fのcanvas内部に常時存在する非表示fallbackと、実際に表示される障害時fallbackを区別した。
- ブラウザー検証は分離したheadless Chrome。テスト時だけSwiftShaderを許可する起動オプションを使用。個人用ブラウザーの設定は変更していない。GitHub Planetの外部iframeは配信元のCSPが本番ドメインを許可しており、localhostでの埋め込み表示は拒否されることを確認した。外部アプリの設定は変更していない。
- Google Rich Results Test / Schema Markup Validatorのオンライン画面と、OpenNext Worker実行環境でのプレビューは未確認。JSON-LDの構文・種別・URL・表示内容との対応はローカルで検証した。

フォントの先読みとサイズ補正fallbackを試したが、モバイルLCP/CLSの安定した改善を確認できず最終版から除外した。フォントの種類・読み込み方法は元のまま。操作比較は特定のメニューボタンに固定し、音ONボタンの初期化時間とは混同しない。

### 変更ファイルのまとまり

- メタデータ・言語: `src/lib/seo.ts`、`src/middleware.ts`、`src/app/layout.tsx`、トップ/About/作品5ページの `page.tsx`、`src/app/robots.ts`、`src/app/sitemap.ts`。
- 構造化データ・内部リンク: `src/components/SeoJsonLd.tsx`、`ProjectLinks.tsx`、`dom/WorksList.tsx`、`dom/TopLeftMenu.tsx`。作品Client5ファイルにロゴ相当のH1と画像寸法を追加。
- 非公開補助ページ・PWA: `src/app/card/page.tsx`、`ogp/page.tsx`、`not-found.tsx`、`manifest.ts`。
- WebGL対応: `src/components/canvas/SafeCanvas.tsx` と `Scene`、`RealisticPlanetScene`、`CloudAscentCanvas`、`FreezeTransitionCanvas`、`WaveTransitionCanvas`、`src/app/card/CardScene.tsx`、`coldkeep/ColdKeepClient.tsx`、`denshouo/DenshouoAtmosphere.tsx` のCanvas参照。
- 初回操作: `src/components/SoundDirector.tsx` のミュート時初期化ガードと、明示的な音ON成功後の操作ラベル同期。音の合成パラメータや音源は変更していない。
- 画像: `public/*-logo.webp`（4点）、`avatar.webp`、`icon.png`、`apple-icon.png`、`pwa-192.png`、`pwa-512.png`。
- 検証: `e2e/seo.spec.ts`、`e2e/sound-transition.spec.ts`、`e2e/otenkigurashi-weather.spec.ts`、`scripts/audit-seo.mjs`、`scripts/measure-seo-performance.mjs`、`playwright.config.ts`、`tsconfig.json`。`next.config.ts` は全UAに初期headのメタデータを返す設定。

Windowsの既存`.next`権限と一時的なディスク容量不足を回避するため、同じソース・同じ依存の一時コピー `tmp/seo-baseline` / `tmp/seo-after` で本番ビルドした。一時コピーだけwebpackのディスクキャッシュを無効化したが、生成するアプリの機能・圧縮設定は同じ。作業後にソース一致を確認した。

再現手順:

```powershell
npx tsc --noEmit --incremental false
npm run lint
npm run build
node scripts/audit-seo.mjs http://127.0.0.1:3000 tmp/seo-audit
node scripts/measure-seo-performance.mjs http://127.0.0.1:3000 tmp/seo-performance
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:3000'
$env:PLAYWRIGHT_CHANNEL='chrome' # bundled Chromiumを使う場合は設定不要
npm run test:e2e
```

## Google Search Consoleと今後の運用

1. ドメインプロパティ `wakato.tech` の所有権とユーザー権限を確認。公開DNSのTXT問合せは今回ENODATAだったが、それだけでGSCの未登録とは断定できない。既存の別認証方法も確認する。
2. URLプレフィックス方式で実際のHTML検証トークンを使う場合のみ、追加した `GOOGLE_SITE_VERIFICATION` 環境変数へ値を設定。トークンを創作・公開コミットしない。
3. レビュー・ステージング確認・本番反映後に `https://wakato.tech/sitemap.xml` を送信。今回のローカル変更はまだ公開サイトへ反映されていない。
4. 日英トップ、About、作品詳細でURL検査を行い、公開URLテスト・Google選択canonical・クロール済みHTML・hreflang対象の到達性を確認。
5. /card、/ogp、削除済みルートの状況と「重複ページ」「クロール済み未登録」を確認。noindexページをrobotsで先に拒否しない。
6. Cloudflareのrobots合成、HTTP→HTTPS、www→apex、キャッシュキーがlangを無視していないことをステージング/公開後に確認。
7. 2〜4週ごとにブランド日英クエリと作品名の表示回数・クリックを比較。CWVは実ユーザーのp75（通常28日集計）で追う。順位向上・リッチリザルト表示は保証しない。

次の開発優先度は、ステージングでCloudflare固有の言語/robots/cache動作を検証し、作品ごとの担当範囲と設計判断を根拠付きで補うこと。画像には実機デモのスクリーンショットを用い、各作品のOGPを個別化できる。CWVの追加改善は実ユーザーの計測結果を見て、描画・入力処理・遅延ロードを個別に測定する。表現を減らす変更を一括で入れない。

## 公式資料

再レビューで判明したCloudflareビルド・JS無効時の表示・Data Cacheの問題と、その検証手順は[Cloudflare再レビュー対応](./cloudflare-verification.md)を参照。上記の従来測定結果はNode版の測定であり、Cloudflare本番の性能や公開可否を保証するものではない。

- [Google: クロール可能なリンク](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Google: 多言語版とhreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [Next.js: generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Cloudflare: OpenNextの対応機能](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/)
- [web.dev: Core Web Vitalsとp75](https://web.dev/articles/vitals)
