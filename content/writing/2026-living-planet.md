---
title: Living Planetを「状態」として設計する
date: 2026-08-24
description: 天候・季節・作品遷移をひとつのWorldStateとして扱うまでの設計メモ。
tags: ["design", "nextjs", "world-state"]
draft: false
---

# Living Planetを「状態」として設計する

ポートフォリオを作品一覧として見せるだけではなく、天候や季節が変わるひとつの世界として扱うために、最初に必要だったのは演出ではなく状態の境界でした。

## ひとつの世界を複数の画面で共有する

weather、season、seasonEvent をURLとストアの両方で扱い、作品ページへ移動しても同じ世界のスナップショットを参照できるようにしています。

~~~ts
type WorldState = {
  weather: WeatherType;
  season: SeasonType;
  seasonEvent: SeasonEventType;
};
~~~

状態を先に正規化すると、画面ごとに別々の条件分岐が増えません。見た目の実装は後から差し替えられます。

![Living PlanetのOGP](/opengraph-image.png)

## 小さな違和感を拾う

天候エフェクトは目立たせることより、画面を開いた瞬間に「今日は少し違う」と感じてもらうことを優先しました。雨の日の水面波紋も、魚の動きとは別の責務として追加しています。

> 世界観は、派手な機能の数ではなく、状態の一貫性から生まれる。

[Portfolioへ戻る](/)
