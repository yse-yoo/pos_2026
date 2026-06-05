# リアルタイム同期・状態管理仕様書

**バージョン:** 1.0.0  
**作成日:** 2026-06-05  
**対象:** 注文ドラフトのリアルタイム同期、APCu・SSE・Polling の使い分け

---

## 1. 概要

POS 画面（レジ担当）と客側画面のリアルタイム同期を実現するため、データの性質に応じて APCu・SSE・Polling を使い分ける。注文中の一時データは DB に書かず、確定した注文のみ DB へ保存する。

---

## 2. 同期手段まとめ

| 用途 | 手段 | 方向 | 保存先 |
|--|--|--|--|
| 注文ドラフト保存 | APCu | POS → サーバー | メモリ（一時） |
| 注文ドラフト表示 | SSE | サーバー → 客側 | — |
| チェックアウト監視 | Polling（2秒） | 客側 / POS → サーバー | MySQL |
| 確定注文保存 | REST API | POS → サーバー | MySQL（永続） |

---

## 3. 各手段の詳細

### 3.1 APCu（PHP インメモリキャッシュ）

- **対象:** 注文ドラフト（`OrderDraftRepository`）
- **用途:** POS がカートを更新するたびにサーバーのメモリへ保存
- **特性:**
  - DB に書き込まない → DB 肥大化を防ぐ
  - サーバー再起動で自動クリア（揮発性）
  - PHP-FPM の同一プロセスプール内で全リクエストから共有アクセス可能
- **クリアタイミング:** チェックアウト確定時・キャンセル時

### 3.2 SSE（Server-Sent Events）

- **エンドポイント:** `GET /api/order-draft/stream`
- **対象:** 客側画面への注文ドラフトのリアルタイム配信
- **フロー:**
  1. 客側ブラウザが `EventSource` で接続
  2. PHP が 500ms ごとに APCu を監視
  3. 変化があった場合のみクライアントへ push
  4. 55 秒で切断 → `EventSource` が自動再接続
- **セッション:** `session_write_close()` を早期呼び出しし、セッションロックによる他リクエストのブロックを防ぐ
- **nginx:** `fastcgi_buffering off` / `fastcgi_read_timeout 70s` を設定

### 3.3 Polling（setInterval）

- **対象:** チェックアウト状態の監視（`CheckoutProvider`）
- **間隔:** 2 秒
- **用途:**
  - 現在の pending チェックアウトを取得（POS・客側共通）
  - 特定チェックアウトのステータス追跡（`pending` → `completed` / `canceled`）
- **SSE にしない理由:** 決済操作は稀なイベントであり、2 秒のラグは実用上問題ない。DB クエリを SSE のループ内で発行するとサーバー負荷が高くなるため Polling を維持する。

---

## 4. データフロー

```
POS 操作
  └─ PUT /api/order-draft/current
       └─ APCu に保存
            └─ SSE stream が検知
                 └─ 客側画面に push

決済ボタン押下
  └─ POST /api/checkout-requests
       └─ MySQL に保存（checkout_requests）
            └─ Polling で客側・POS が検知

決済確定
  └─ POST /api/checkout-requests/{id}/complete
       └─ MySQL に保存（sales）
       └─ APCu クリア
```

---

## 5. PHP-FPM ワーカー設定

SSE は接続中ずっとワーカーを 1 本占有するため、デフォルト値（`max_children=5`）では枯渇する。

| パラメータ | 変更前 | 変更後 |
|--|--|--|
| `pm.max_children` | 5 | 20 |
| `pm.start_servers` | 2 | 4 |
| `pm.min_spare_servers` | 1 | 2 |
| `pm.max_spare_servers` | 3 | 6 |

設定ファイル: `lemp-docker/php/zzz-pos.conf`
