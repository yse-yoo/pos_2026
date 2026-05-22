import { useState } from 'react'
import { Button } from '../../components/actions/Button'
import { SummaryCard } from '../../components/data-display/SummaryCard'
import { EmptyState } from '../../components/feedback/EmptyState'
import { ErrorBanner } from '../../components/feedback/ErrorBanner'
import { LoadingState } from '../../components/feedback/LoadingState'
import { PageHeader } from '../../components/layout/PageHeader'
import { PagePanel } from '../../components/layout/PagePanel'
import type { AppRoute } from '../../types/app-route'
import type { StatusFilter } from '../../types/product'
import { ProductListRow } from './components/ProductListRow'
import { ProductMobileCard } from './components/ProductMobileCard'
import { useProductCatalog } from './hooks/useProductCatalog'
import './products.css'

type ProductListPageProps = {
  onNavigate: (route: AppRoute) => void
}

export function ProductListPage({ onNavigate }: ProductListPageProps) {
  const {
    categories,
    filteredProducts,
    products,
    categoryNameById,
    searchKeyword,
    selectedCategoryId,
    selectedStatus,
    activeProductCount,
    inactiveProductCount,
    isLoading,
    errorMessage,
    setSearchKeyword,
    setSelectedCategoryId,
    setSelectedStatus,
    deleteProduct,
    reorderProducts,
  } = useProductCatalog()
  const [isSortMode, setIsSortMode] = useState(false)
  const [sortableProductIds, setSortableProductIds] = useState<number[]>([])
  const [draggingProductId, setDraggingProductId] = useState<number | null>(null)
  const [isSavingOrder, setIsSavingOrder] = useState(false)

  const productById = new Map(products.map((product) => [product.id, product]))
  const visibleProducts = isSortMode
    ? sortableProductIds
        .map((productId) => productById.get(productId))
        .filter((product) => product !== undefined)
    : filteredProducts

  const handleDeleteProduct = async (productId: number) => {
    const shouldDelete = window.confirm('この商品を削除しますか？')
    if (shouldDelete) {
      await deleteProduct(productId)
    }
  }

  const startSortMode = () => {
    setSortableProductIds(products.map((product) => product.id))
    setDraggingProductId(null)
    setIsSortMode(true)
  }

  const cancelSortMode = () => {
    setIsSortMode(false)
    setSortableProductIds([])
    setDraggingProductId(null)
  }

  const moveSortableProduct = (targetProductId: number) => {
    if (draggingProductId === null || draggingProductId === targetProductId) {
      return
    }

    setSortableProductIds((currentIds) => {
      const fromIndex = currentIds.indexOf(draggingProductId)
      const toIndex = currentIds.indexOf(targetProductId)
      if (fromIndex < 0 || toIndex < 0) {
        return currentIds
      }

      const nextIds = [...currentIds]
      const [movedProductId] = nextIds.splice(fromIndex, 1)
      nextIds.splice(toIndex, 0, movedProductId)
      return nextIds
    })
  }

  const saveSortOrder = async () => {
    setIsSavingOrder(true)

    try {
      await reorderProducts(sortableProductIds)
      cancelSortMode()
    } finally {
      setIsSavingOrder(false)
    }
  }

  return (
    <div className="product-admin-layout">
      <PagePanel className="admin-panel">
        <PageHeader
          kicker="Catalog manager"
          title="商品管理"
          description="レジで使用する商品を管理できます。"
          actions={
            <div className="admin-header-actions">
              {isSortMode ? (
                <>
                  <Button
                    variant="ghost"
                    className="p-2 admin-create-button"
                    onClick={cancelSortMode}
                    disabled={isSavingOrder}
                  >
                    キャンセル
                  </Button>
                  <Button
                    variant="primary"
                    className="p-2 admin-create-button"
                    onClick={() => void saveSortOrder()}
                    disabled={isSavingOrder}
                  >
                    {isSavingOrder ? '保存中...' : '並び順を保存'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    className="p-2 admin-create-button"
                    onClick={startSortMode}
                    disabled={products.length <= 1}
                  >
                    並び替え
                  </Button>
                  <Button
                    variant="primary"
                    className="p-2 admin-create-button"
                    onClick={() => onNavigate({ view: 'products', screen: 'create' })}
                  >
                    新規登録
                  </Button>
                </>
              )}
            </div>
          }
        />

        {errorMessage ? (
          <ErrorBanner title="商品マスタ取得に失敗しました" message={errorMessage} />
        ) : null}

        {isLoading ? (
          <LoadingState
            title="商品マスタを読み込み中です"
            description="カテゴリと商品一覧を取得しています。"
          />
        ) : null}

        {!isLoading ? <div className="admin-summary-grid">
          <SummaryCard label="登録商品" value={products.length} />
          <SummaryCard label="表示中" value={activeProductCount} />
          <SummaryCard label="非表示" value={inactiveProductCount} />
        </div> : null}

        {!isLoading && isSortMode ? (
          <div className="admin-sort-mode-panel">
            商品行をドラッグして並び順を変更し、保存してください。
          </div>
        ) : null}

        {!isLoading && !isSortMode ? <div className="admin-filter-panel">
          <div className="admin-filter-grid">
            <label className="admin-filter-field">
              <span>キーワード検索</span>
              <input
                type="search"
                className="admin-input"
                placeholder="商品名で検索"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </label>

            <label className="admin-filter-field">
              <span>カテゴリ絞り込み</span>
              <select
                className="admin-select"
                value={selectedCategoryId}
                onChange={(event) => setSelectedCategoryId(event.target.value)}
              >
                <option value="all">全カテゴリ</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-filter-field">
              <span>表示状態絞り込み</span>
              <select
                className="admin-select"
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(event.target.value as StatusFilter)
                }
              >
                <option value="all">すべて</option>
                <option value="active">表示中</option>
                <option value="inactive">非表示</option>
              </select>
            </label>
          </div>
        </div> : null}

        {!isLoading && visibleProducts.length === 0 ? (
          <EmptyState
            icon="📦"
            title={products.length === 0 ? '商品が登録されていません' : '条件に合う商品がありません'}
            description={
              products.length === 0
                ? '新規登録から商品マスタを作成できます。'
                : '検索条件または絞り込み条件を変更してください。'
            }
            className="admin-empty-state"
          />
        ) : !isLoading ? (
          <div className={`admin-product-list${isSortMode ? ' is-sort-mode' : ''}`}>
            <div className="admin-table-shell">
              <div className="admin-table-scroll">
                <div className="admin-product-table" role="table" aria-label="商品一覧">
                  <div className="admin-product-header" role="row">
                    <div className="admin-product-heading" role="columnheader">ID</div>
                    <div className="admin-product-heading admin-name-cell" role="columnheader">
                      商品名
                    </div>
                    <div className="admin-product-heading admin-price-cell" role="columnheader">
                      価格
                    </div>
                    <div className="admin-product-heading" role="columnheader">カテゴリ</div>
                    <div className="admin-product-heading" role="columnheader">アイコン</div>
                    <div className="admin-product-heading" role="columnheader">画像</div>
                    <div className="admin-product-heading" role="columnheader">表示状態</div>
                    <div className="admin-product-heading" role="columnheader">並び順</div>
                    <div className="admin-product-heading" role="columnheader">
                      {isSortMode ? '並び替え' : '操作'}
                    </div>
                  </div>

                  <div className="admin-product-rows" role="rowgroup">
                    {visibleProducts.map((product) => (
                      <ProductListRow
                        key={product.id}
                        product={product}
                        categoryName={categoryNameById.get(product.categoryId) ?? ''}
                        isSortMode={isSortMode}
                        isDragging={draggingProductId === product.id}
                        onNavigate={onNavigate}
                        onDeleteProduct={handleDeleteProduct}
                        onDragStart={setDraggingProductId}
                        onDragEnter={moveSortableProduct}
                        onDragEnd={() => setDraggingProductId(null)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-mobile-list">
              {visibleProducts.map((product) => (
                <ProductMobileCard
                  key={product.id}
                  product={product}
                  categoryName={categoryNameById.get(product.categoryId) ?? ''}
                  onNavigate={onNavigate}
                  onDeleteProduct={handleDeleteProduct}
                />
              ))}
            </div>
          </div>
        ) : null}
      </PagePanel>
    </div>
  )
}
