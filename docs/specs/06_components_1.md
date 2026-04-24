# コンポーネント分割・モックデータ分離仕様書

**バージョン:** 1.0.0  
**作成日:** 2026-04-24  
**対象:** `frontend/src/App.tsx` の分割方針、再利用可能コンポーネント設計、モックデータ分離

---

## 1. 概要

現在の `App.tsx` は、以下の責務を単一ファイルで同時に持っている。

- 型定義
- 画面ルーティング
- モックデータ定義
- 表示用フォーマッタ
- 商品管理・履歴・POS の状態管理
- CRUD 相当のローカル更新処理
- バリデーション
- 画面ごとの JSX 描画

売上履歴画面、商品管理画面の追加により、`App.tsx` は SPA のエントリというより **アプリ全体の実装本体** になっている。  
今後、売上詳細や管理画面が増えると保守性が急激に低下するため、本仕様では **画面・UI部品・モックデータ・ロジックの責務分離** を定義する。

---

## 2. 現状の課題

| 観点 | 現状の課題 |
|------|------------|
| 画面責務 | POS / 履歴 / 商品管理 / 商品フォームが `App.tsx` に同居している |
| データ責務 | 商品カテゴリ、商品一覧、履歴データがコンポーネント本体に埋め込まれている |
| 再利用性 | ヘッダー、パネルヘッダー、状態表示、テーブル/モバイルカードの共通化ができていない |
| 型安全 | 型定義がローカル閉じしており、今後他ファイルから再利用しづらい |
| テスト性 | モックデータと画面ロジックが密結合で、差し替えやケース追加がしにくい |
| スタイル管理 | `App.css` が全画面のスタイルを抱え、機能ごとの影響範囲が読みにくい |

---

## 3. 分割の基本方針

1. **App.tsx はルート選択と最上位レイアウトだけを持つ**
2. **画面は feature 単位で分離する**
3. **汎用 UI は `components/` に切り出す**
4. **モックデータは `mocks/` に分離し、テストデータとして再利用可能にする**
5. **型・フォーマッタ・バリデーション・ルーティング変換は `lib/` または `features/*/model` に分離する**
6. **PC 表示とモバイル表示で重複する意味モデルは共通化し、見た目だけを分ける**

---

## 4. 目標ディレクトリ構成

```txt
src/
├── App.tsx
├── components/
│   ├── layout/
│   │   ├── AppHeader.tsx
│   │   ├── MainNavigation.tsx
│   │   └── PagePanel.tsx
│   ├── feedback/
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBanner.tsx
│   │   ├── LoadingState.tsx
│   │   └── StatusChip.tsx
│   ├── actions/
│   │   ├── PrimaryButton.tsx
│   │   ├── SecondaryButton.tsx
│   │   └── DangerButton.tsx
│   └── data-display/
│       ├── ResponsiveTable.tsx
│       └── SummaryCard.tsx
├── features/
│   ├── pos/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── model/
│   │   └── PosPage.tsx
│   ├── sales-history/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── model/
│   │   └── SalesHistoryPage.tsx
│   └── products/
│       ├── components/
│       ├── hooks/
│       ├── model/
│       ├── ProductsPage.tsx
│       ├── ProductFormPage.tsx
│       └── ProductListPage.tsx
├── lib/
│   ├── format/
│   ├── routing/
│   └── guards/
├── mocks/
│   ├── categories.ts
│   ├── products.ts
│   ├── salesHistory.ts
│   └── fixtures/
└── types/
    ├── product.ts
    ├── sales.ts
    └── app-route.ts
```

---

## 5. App.tsx の責務

`App.tsx` は以下だけを持つ。

- 現在ルートの解決
- 共通ヘッダー描画
- 画面コンポーネント切り替え

### 5.1 App.tsx が持ってよいもの

- `AppHeader`
- `resolveRouteFromPath`
- ルートに応じた `Page` の切り替え

### 5.2 App.tsx から排除するもの

- 商品・カテゴリ・履歴の初期データ
- フォームバリデーション
- 商品 CRUD ロジック
- 売上履歴取得ロジック
- 画面内テーブル/カード描画
- ボタンや状態表示の見た目実装

---

## 6. 再利用可能 Components 仕様

### 6.1 layout 系

| Component | 役割 |
|-----------|------|
| `AppHeader` | ロゴ、ナビ、時計、管理者導線を表示 |
| `MainNavigation` | `ViewName` に応じたメインタブ切替 |
| `PagePanel` | 白背景カード、角丸、影、パネル内余白を共通化 |
| `PageHeader` | キッカー、タイトル、説明、右側アクション領域を共通化 |

`history-panel-header` と `admin-panel-header` は構造が近いため、`PageHeader` に統合する。

### 6.2 feedback 系

| Component | 役割 |
|-----------|------|
| `LoadingState` | スピナー + タイトル + 補足文 |
| `EmptyState` | アイコン + 見出し + メッセージ + 任意アクション |
| `ErrorBanner` | エラー色のバナー表示 |
| `StatusChip` | 支払方法、表示状態、伝票番号、並び順などのバッジ表示 |

以下は共通化対象:

- 履歴の読み込み中
- 履歴空状態
- 商品一覧空状態
- 商品編集対象なし状態
- 商品表示状態チップ
- 支払方法チップ

### 6.3 actions 系

| Component | 役割 |
|-----------|------|
| `Button` | variant (`primary`, `secondary`, `ghost`, `danger`) を統一管理 |
| `IconButton` | 将来の一覧操作や再読み込みに利用 |
| `ActionGroup` | 行末操作・フォーム末尾操作の横並び/縦並び切替 |

現状 `action-button` / `row-action-button` / `table-detail-button` / `mobile-detail-button` が分散しているため、variant ベースに集約する。

### 6.4 data-display 系

| Component | 役割 |
|-----------|------|
| `SummaryCard` | 件数や統計のカード表示 |
| `ResponsiveTable` | PC は table、SP は card list を切替 |
| `InfoPairList` | モバイルカード内の `dt/dd` 表示共通化 |

`売上履歴` と `商品一覧` の両方で、**テーブル + モバイルカードの二重実装** があるため、表示モデルを渡す形で共通化余地が大きい。

---

## 7. feature ごとの分離仕様

### 7.1 POS

#### 切り出し対象

- `PosPage`
- `ProductCategoryTabs`
- `ProductGrid`
- `ProductCard`
- `ReceiptPanel`
- `ReceiptItemRow`
- `ReceiptSummary`
- `ReceiptActions`

#### hooks / model

- `useCart`
- `useReceiptNumber`
- `mapAdminProductsToPosProducts`

### 7.2 売上履歴

#### 切り出し対象

- `SalesHistoryPage`
- `SalesHistoryHeader`
- `SalesHistoryTable`
- `SalesHistoryMobileList`
- `SalesHistoryRow`

#### hooks / model

- `useSalesHistory`
- `parseSalesHistoryResponse`
- `getPaymentMethodVariant`

### 7.3 商品管理

#### 切り出し対象

- `ProductsPage`
- `ProductListPage`
- `ProductFormPage`
- `ProductFilterBar`
- `ProductSummaryCards`
- `ProductTable`
- `ProductMobileList`
- `ProductForm`

#### hooks / model

- `useProductCatalog`
- `validateProductForm`
- `createEmptyProductForm`
- `createProductFormFromItem`
- `filterProducts`
- `sortProducts`

---

## 8. モックデータ分離仕様

### 8.1 方針

現在の以下データは、コンポーネント本体から分離する。

- `productCategories`
- `initialAdminProducts`
- `sales-history.json`

### 8.2 配置

```txt
src/mocks/categories.ts
src/mocks/products.ts
src/mocks/salesHistory.ts
```

### 8.3 役割

| ファイル | 内容 |
|----------|------|
| `categories.ts` | 初期カテゴリマスタ |
| `products.ts` | 初期商品マスタ、フィルタ用 fixture |
| `salesHistory.ts` | 売上履歴 fixture |

### 8.4 要件

1. **画面はモックデータの定義を直接持たない**
2. **fixture は複数ケースを持てる構造にする**
3. **将来テストコードから同じデータを import できること**
4. **JSON が必要なケースと TS オブジェクトが必要なケースを分ける**

### 8.5 推奨構成

```ts
export const productCategoriesFixture = [...]
export const productCatalogFixture = [...]
export const emptyProductCatalogFixture = []
export const salesHistoryFixture = [...]
export const emptySalesHistoryFixture = []
```

---

## 9. 型定義分離仕様

`App.tsx` 内の型は `types/` または `features/*/model/types.ts` に移す。

### 9.1 共通型

- `ViewName`
- `AppRoute`

### 9.2 商品系

- `ProductCategory`
- `AdminProduct`
- `ProductFormState`
- `ProductFormPayload`
- `ProductStatusFilter`

### 9.3 売上系

- `SalesHistoryItem`

### 9.4 POS系

- `Product`
- `CartItem`

---

## 10. util / lib 分離仕様

以下は画面外へ移す。

| 現在の関数 | 移動先候補 |
|------------|------------|
| `formatCurrency` | `lib/format/currency.ts` |
| `formatReceiptNumber` | `lib/format/receipt.ts` |
| `formatSoldAt` | `lib/format/dateTime.ts` |
| `createClockLabel` | `lib/format/dateTime.ts` or `hooks/useClock.ts` |
| `resolveRouteFromPath` | `lib/routing/appRoute.ts` |
| `getPathForRoute` | `lib/routing/appRoute.ts` |
| `getProductEditPath` | `lib/routing/appRoute.ts` |
| `isObjectRecord` | `lib/guards/object.ts` |

---

## 11. hooks 分離仕様

### 11.1 `useClock`

- 現在時刻の文字列を返す
- ヘッダー専用ではなく、他画面でも利用可能にする

### 11.2 `useAppRoute`

- URL と SPA 内 route state の同期を管理
- `push`, `replace`, `currentRoute` を提供
- `window.history` 直接操作を `App.tsx` から排除

### 11.3 `useSalesHistory`

- `salesHistory`
- `isLoading`
- `isRefreshing`
- `errorMessage`
- `load`
- `refresh`

### 11.4 `useProductCatalog`

- `products`
- `filters`
- `filteredProducts`
- `createProduct`
- `updateProduct`
- `deleteProduct`
- `setFilters`

### 11.5 `useCart`

- `cartItems`
- `subtotal`
- `tax`
- `total`
- `addItem`
- `changeQuantity`
- `clearOrder`
- `completePayment`

---

## 12. スタイル分離仕様

`App.css` は全画面のスタイルを抱えているため、feature 単位へ分割する。

### 推奨ファイル

```txt
src/styles/tokens.css
src/components/layout/AppHeader.css
src/components/feedback/feedback.css
src/features/pos/pos.css
src/features/sales-history/sales-history.css
src/features/products/products.css
```

### 分離ルール

1. 共通トークンは `tokens.css`
2. 共通部品の見た目は component 隣接配置
3. feature 専用スタイルは feature 配下
4. `history-*` と `admin-*` のような接頭辞命名は維持してよいが、適用範囲をファイルで分ける

---

## 13. 画面構成の具体的な分割案

### 13.1 App.tsx

```tsx
<AppHeader />
<main>
  {route.view === 'pos' && <PosPage />}
  {route.view === 'history' && <SalesHistoryPage />}
  {route.view === 'products' && <ProductsPage route={route} />}
</main>
```

### 13.2 ProductsPage

```tsx
{screen === 'list' ? (
  <ProductListPage />
) : (
  <ProductFormPage mode={screen} productId={route.productId} />
)}
```

### 13.3 SalesHistoryPage

```tsx
<PagePanel>
  <PageHeader />
  <ErrorBanner />
  <LoadingState />
  <EmptyState />
  <SalesHistoryTable />
  <SalesHistoryMobileList />
</PagePanel>
```

---

## 14. コンポーネント化で追加したい仕様

### 14.1 表示モデルの導入

`ResponsiveTable` のような共通部品を作る場合、画面側は JSX ではなく **表示モデル** を渡す。

例:

```ts
type TableColumn<T> = {
  key: string
  header: string
  render: (row: T) => ReactNode
}
```

これにより、履歴一覧と商品一覧で同じテーブル基盤を再利用しやすくする。

### 14.2 State と View の分離

- `PageContainer`: データ取得・状態保持
- `PageView`: props で受けて描画のみ

この構成にすると、将来 API 接続へ切り替えるときも View をほぼ変更せずに済む。

### 14.3 モック切替の容易化

モック専用のデータソース関数を設ける。

例:

```txt
features/products/api/productRepository.mock.ts
features/sales-history/api/salesHistoryRepository.mock.ts
```

将来 API 実装時は `*.api.ts` を追加し、呼び出し側を差し替え可能にする。

### 14.4 ダイアログ抽象化

現在は `window.confirm` / `window.alert` を直接利用しているが、将来的には以下を追加する。

- `useConfirmDialog`
- `useToast`

これにより UI 一貫性とテスト性を上げる。

### 14.5 フォームスキーマ化

商品フォームは現状 hand-written validation だが、将来的には以下のように整理する。

- `productFormSchema`
- `validateProductForm`
- `mapFormToPayload`

仕様追加時にバリデーション変更点を 1 箇所に閉じ込める。

---

## 15. 段階的な分割手順

### Phase 1

- `types/`
- `mocks/`
- `lib/format`
- `lib/routing`

### Phase 2

- `AppHeader`
- `PagePanel`
- `PageHeader`
- `EmptyState`
- `ErrorBanner`
- `Button`

### Phase 3

- `SalesHistoryPage`
- `ProductListPage`
- `ProductFormPage`
- `PosPage`

### Phase 4

- `useAppRoute`
- `useSalesHistory`
- `useProductCatalog`
- `useCart`

---

## 16. スコープ外

- React Router 導入そのもの
- API クライアントの本実装
- テストコード追加
- デザイン全面刷新

本仕様は、**現行の見た目とモック挙動を維持したまま、責務を安全に分離するための設計指針** に限定する。

---

## 17. 期待効果

- `App.tsx` の責務縮小
- 画面単位での修正容易化
- モックデータ差し替えの簡略化
- 将来 API 実装時の差分縮小
- UI 部品の重複削減
- テストデータ・Story 的確認用データの再利用性向上

