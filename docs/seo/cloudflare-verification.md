# Cloudflare再レビュー指摘への対応

PR #89のNode/Vercel検証だけではCloudflareでの公開可否を判断できなかったため、専用のLinux検証を追加する。本番へのデプロイを実行するワークフローではない。

## 本文とJavaScript

RootLayoutはリクエストヘッダーから言語を決める動的ルートである。本文全体・作品一覧・各作品の本文をSuspenseで囲まず、音・遷移などのクライアント実行部分に境界を限定する。JS無効時も本文を初期HTML内に表示し、ColdKeepのGitHubリンクにも既存のnoscript表示補正を適用する。

Playwrightでは14ページ（日英）について、本文を囲む要素の表示・親要素のhidden/display/visibility/opacity/content-visibility・描画されたbodyの文字数を確認する。ColdKeepのアニメーション対象とGitHubリンク、JSなしの作品リンク遷移も検証する。文字数だけの旧判定は使用しない。

## 天候の保存先と取得上限

OpenNextのincrementalCacheを公式のKVアダプターに接続し、`NEXT_INC_CACHE_KV`をWranglerに宣言する。ローカル検証はローカルKVのみを使う。将来デプロイするときにWranglerが自動でリソースを作成・紐付けできる形式であり、この修正やCIだけではクラウド上のリソースを作成しない。

現在の対象は動的SSR内のfetch Data Cacheで、30分の時間ベース再検証を使う。`revalidateTag`等のオンデマンド無効化や静的ページのISRはこの設定では提供しない。KVは結果整合性のため、拠点間の伝播中の重複取得や更新の遅れがあり得る。無料枠にも読み書き上限がある。R2・D1・Durable Objects・有料Imagesは追加しない。

Open-Meteo取得とレスポンス本文の読み取りには2秒のAbortSignalを付け、HTTP失敗・不正なデータ・タイムアウト時は従来どおり日本時間に応じた表示を選ぶ。夜間はAPI取得を行わない。

## Workerビルド

Next 16.4のimage-optimizer/transformが未使用のsharpを取り込む問題（OpenNext #1394）に対し、OpenNext専用buildCommandで生成済みstandalone内の当該requireだけを無効化する。元のnode_modulesは変更しない。`images.unoptimized=true`、対象ファイル1つ、対象require1つを必須条件とし、依存側の構成が変わったらビルドを失敗させる。native .nodeをexternal化して本番へ持ち込まない。画像の動的最適化を有効にする際にはこの対策を外してImages等の対応方式を選び直す。

## Linuxでの再現

```sh
npm ci
npx playwright install chromium --with-deps
npm run build:cloudflare
npm run test:weather
npm run test:cloudflare
```

`Cloudflare validation` ActionsがUbuntu 24.04 / Node 22で同じ手順を実行する。実際に生成したWorkerをWrangler経由のworkerdで起動し、ローカルKVへの保存、2回目の取得でAPIを再呼び出ししないこと、30分経過した保存値の更新、2秒のタイムアウト後のHTML応答を検証する。時刻・上流応答・制御URLはテスト専用の生成エントリーポイントに限定し、本番用worker.jsへ追加しない。そのworkerdに対して既存のPlaywright一式を実行する。

検証結果はCIログと`cloudflare-validation` artifactのJSONで確認する。ローカルエミュレーターの結果は本番のレイテンシや実ユーザーのCore Web Vitalsを示さない。本番DNS・登録期限・公開済み旧Workerの差し替えは別の操作である。

参考: [OpenNext caching](https://opennext.js.org/cloudflare/caching)、[Wrangler resource provisioning](https://developers.cloudflare.com/workers/wrangler/configuration/#automatic-provisioning)、[OpenNext #1394](https://github.com/opennextjs/opennextjs-cloudflare/issues/1394)
