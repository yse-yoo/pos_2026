# Square 決済端末 連携仕様・アイデア

**作成日:** 2026-05-29  
**対象:** SmartPOS × Square Terminal 連携

---

## 1. 概要

Square は日本国内でも広く普及している決済プラットフォームであり、  
SmartPOS と連携することで **クレジットカード・電子マネー・タッチ決済** に対応できる。

Square が提供する API のうち、Web ベースの POS に最も適した  
**Terminal Checkouts API** を中心に設計する。

---

## 2. Square の主要 API

| API | 概要 | SmartPOS での用途 |
|-----|------|-------------------|
| Terminal Checkouts API | POS から Square 端末へ決済要求を送信する | カード・タッチ・電子マネー会計 |
| Payments API | 決済結果の取得・返金 | 売上履歴との紐付け、返金処理 |
| Orders API | 商品明細を持つ注文を作成する | 領収書・レシートの明細連携 |
| Webhooks | 決済完了・失敗のリアルタイム通知 | 会計完了のトリガー |
| OAuth 2.0 | マーチャント認証 | 店舗ごとのアカウント接続 |

---

## 3. 対応できる支払方法

| 支払方法 | Square での分類 | 備考 |
|----------|----------------|------|
| Visa / Mastercard | カード（チップ・タッチ） | Square Terminal 標準対応 |
| JCB / AMEX / Diners | カード | 同上 |
| Apple Pay / Google Pay | タッチ決済 | Square Terminal 標準対応 |
| 交通系 IC（Suica 等） | 電子マネー | Square Terminal（電子マネー対応モデル） |
| QR コード決済 | PayPay / d払い 等 | Square QR 対応（日本） |

---

## 4. 連携アーキテクチャ

```
┌──────────────────────────────────┐
│  SmartPOS Frontend (ブラウザ)     │
│  - 会計金額を確定                 │
│  - 「Square で支払う」ボタン      │
│  - 支払い待ち画面を表示           │
│  - 完了 or 失敗を受け取る         │
└────────────┬─────────────────────┘
             │ REST (HTTPS)
             ▼
┌──────────────────────────────────┐
│  SmartPOS Backend                │
│  POST /api/payments/square       │ ← フロントから呼び出し
│  - Square SDK で checkout 作成   │
│  - checkout_id を返す            │
│                                  │
│  POST /api/webhooks/square       │ ← Square から通知
│  - 署名検証                       │
│  - 売上レコードに square_id 紐付け│
└────────────┬─────────────────────┘
             │ Square API (HTTPS)
             ▼
┌──────────────────────────────────┐
│  Square Platform                 │
│  - Terminal Checkouts API        │
│  - Webhooks                      │
└────────────┬─────────────────────┘
             │ Bluetooth / LAN
             ▼
┌──────────────────────────────────┐
│  Square Terminal（店頭端末）      │
│  - カード・タッチ・QR を処理     │
└──────────────────────────────────┘
```

---

## 5. 決済フロー詳細

### 5.1 通常の決済フロー

```
1. スタッフが商品をカートに入れ、合計金額を確認する
2. 「Square で支払う」を押す
3. Backend が Square Terminal Checkouts API を呼び出す
   POST /v2/terminals/checkouts
   {
     "idempotency_key": "<UUID>",
     "checkout": {
       "amount_money": { "amount": 1850, "currency": "JPY" },
       "device_options": { "device_id": "<端末ID>" },
       "reference_id": "NO.0042"  // 伝票番号
     }
   }
4. Square Terminal の画面に金額が表示される
5. お客様がカードをタッチ or 挿入する
6. Square が Webhook で決済完了を通知する
   → Backend が売上レコードを保存（square_payment_id を記録）
7. Frontend が完了を受け取り、カートをリセットする
```

### 5.2 決済状態の取得（ポーリング or Webhook）

| 方法 | メリット | デメリット |
|------|----------|------------|
| Webhook（推奨） | リアルタイム、サーバー負荷低い | Webhook エンドポイントの公開が必要 |
| ポーリング | 実装がシンプル | 遅延あり、API 呼び出し回数が増える |

開発環境ではポーリング、本番では Webhook に切り替えることを推奨する。

---

## 6. フロントエンドの変更仕様

### 6.1 レジ画面（PosPage）の変更

#### 支払方法ボタンの追加

現状の `現金` / `カード` ボタンに加え、`Square` ボタンを追加する。

```
┌──────────────────┐
│  現金            │
├──────────────────┤
│  Square（カード）│  ← 追加
├──────────────────┤
│  QR決済          │
└──────────────────┘
```

#### 支払い待ち画面（新規モーダル or オーバーレイ）

Square 端末での処理中は、以下の画面を表示して操作をブロックする。

```
┌─────────────────────────────────┐
│                                 │
│   Square 端末をご確認ください   │
│                                 │
│   合計金額: ¥1,850              │
│   伝票番号: NO.0042             │
│                                 │
│   カードをタッチまたは挿入      │
│                                 │
│   ○ ○ ○  (スピナー)            │
│                                 │
│   [キャンセル]                  │
└─────────────────────────────────┘
```

#### 状態遷移

```
idle
  ↓ 「Square で支払う」押下
waiting_for_payment   ← 端末操作待ち（タイムアウト: 120秒）
  ↓ 決済成功
completed             → カートリセット・伝票番号更新
  ↓ 決済失敗 or キャンセル
failed                → エラーメッセージ表示・再試行可能
```

### 6.2 売上履歴画面の変更

| 追加項目 | 内容 |
|----------|------|
| 支払方法の表示 | `Square（Visa）` のように端末種別 + ブランドを表示 |
| Square 決済 ID | 詳細画面に `square_payment_id` を表示（返金対応のため） |

---

## 7. バックエンドの変更仕様

### 7.1 新規 API エンドポイント

| メソッド | パス | 処理 |
|----------|------|------|
| `POST` | `/api/payments/square/checkout` | Square Terminal にチェックアウト要求を送信 |
| `GET` | `/api/payments/square/checkout/:id` | チェックアウトの状態を取得（ポーリング用） |
| `POST` | `/api/payments/square/cancel/:id` | チェックアウトをキャンセル |
| `POST` | `/api/webhooks/square` | Square からの Webhook 受信・署名検証 |

### 7.2 売上テーブルの変更

既存の `sales` テーブルに以下を追加する。

| カラム | 型 | 説明 |
|--------|----|------|
| `square_payment_id` | string nullable | Square の payment ID |
| `square_checkout_id` | string nullable | Square の checkout ID |
| `card_brand` | string nullable | `VISA`, `MASTERCARD` 等 |
| `card_last4` | string nullable | カード末尾4桁 |

### 7.3 環境変数

```env
SQUARE_ACCESS_TOKEN=...         # Square API アクセストークン
SQUARE_ENVIRONMENT=sandbox      # sandbox or production
SQUARE_WEBHOOK_SIGNATURE_KEY=...# Webhook 署名検証用キー
SQUARE_TERMINAL_DEVICE_ID=...   # 接続する Square Terminal の端末 ID
```

---

## 8. セキュリティ考慮事項

| 項目 | 対応 |
|------|------|
| API キーの保護 | フロントエンドには一切渡さない。バックエンドの環境変数で管理 |
| Webhook 署名検証 | Square が付与する `Square-Signature` ヘッダーを必ず検証する |
| 冪等性キー | チェックアウト作成時に UUID を `idempotency_key` として送信し、二重課金を防ぐ |
| タイムアウト処理 | 120秒以内に決済が完了しない場合はフロントでキャンセル要求を送る |
| HTTPS 必須 | Webhook 受信・API 通信はすべて HTTPS |

---

## 9. 開発ロードマップ（フェーズ案）

### Phase 1: サンドボックス接続確認
- Square Developer アカウント作成
- サンドボックス環境で Terminal Checkouts API を手動テスト
- Backend に `/api/payments/square/checkout` を実装
- フロントに「Square で支払う」ボタンを追加（モックレスポンス）

### Phase 2: ポーリングで決済フロー完成
- 決済待ち画面の実装
- ポーリングによる状態取得
- 成功・失敗・タイムアウト処理
- 売上レコードへの `square_payment_id` 記録

### Phase 3: Webhook 対応
- Webhook エンドポイント実装
- 署名検証
- ポーリングから Webhook ベースへ切替

### Phase 4: 本番対応
- Square の本番審査・申請
- 実機（Square Terminal）での動作確認
- エラーハンドリングの強化

---

## 10. スコープ外（将来検討）

| 機能 | 理由 |
|------|------|
| 返金処理 | Square Refunds API で実装可能だが、業務フローの設計が必要 |
| 複数端末対応 | 端末 ID を設定から切り替えられる仕組みが必要 |
| Square レシート連携 | Square 側のレシートメール送信機能の活用 |
| Square 在庫同期 | Square の在庫 API と SmartPOS 商品マスタの同期 |
| Square Dashboard 代替 | 売上管理画面を Square Dashboard と連携させる |
