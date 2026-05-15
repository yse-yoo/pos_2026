import { Button } from '../../components/actions/Button'
import { InfoPairList } from '../../components/data-display/InfoPairList'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../components/data-display/ResponsiveTable'
import { SummaryCard } from '../../components/data-display/SummaryCard'
import { EmptyState } from '../../components/feedback/EmptyState'
import { ErrorBanner } from '../../components/feedback/ErrorBanner'
import { LoadingState } from '../../components/feedback/LoadingState'
import { StatusChip } from '../../components/feedback/StatusChip'
import { PageHeader } from '../../components/layout/PageHeader'
import { PagePanel } from '../../components/layout/PagePanel'
import { buildAssetUrl } from '../../lib/api/client'
import { formatCurrency } from '../../lib/format/currency'
import type { AppRoute } from '../../types/app-route'
import type { AdminProduct, ProductStatusFilter } from '../../types/product'
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
  } = useProductCatalog()

  const handleDeleteProduct = async (productId: number) => {
    const shouldDelete = window.confirm('この商品を削除しますか？')
    if (shouldDelete) {
      await deleteProduct(productId)
    }
  }

  const columns: ResponsiveTableColumn<AdminProduct>[] = [
    { key: 'id', header: 'ID', render: (product) => product.id },
    {
      key: 'name',
      header: '商品名',
      className: 'admin-name-cell',
      render: (product) => product.name,
    },
    {
      key: 'price',
      header: '価格',
      className: 'admin-price-cell',
      render: (product) => formatCurrency(product.price),
    },
    {
      key: 'category',
      header: 'カテゴリ',
      render: (product) => categoryNameById.get(product.categoryId),
    },
    {
      key: 'icon',
      header: 'アイコン',
      render: (product) => <span className="admin-icon-badge">{product.icon || '・'}</span>,
    },
    {
      key: 'imagePath',
      header: '画像',
      render: (product) =>
        product.imagePath ? (
          <img className="admin-product-thumb" src={buildAssetUrl(product.imagePath)} alt="" />
        ) : (
          <span className="admin-image-placeholder">なし</span>
        ),
    },
    {
      key: 'status',
      header: '表示状態',
      render: (product) => (
        <StatusChip tone={product.isActive ? 'active' : 'inactive'}>
          {product.isActive ? '表示中' : '非表示'}
        </StatusChip>
      ),
    },
    {
      key: 'sortOrder',
      header: '並び順',
      render: (product) => <StatusChip mono>{product.sortOrder}</StatusChip>,
    },
    {
      key: 'actions',
      header: '操作',
      render: (product) => (
        <div className="admin-row-actions">
          <Button
            variant="secondary"
            className="row-action-button"
            onClick={() =>
              onNavigate({ view: 'products', screen: 'edit', productId: product.id })
            }
          >
            編集
          </Button>
          <Button
            variant="danger"
            className="row-action-button"
            onClick={() => handleDeleteProduct(product.id)}
          >
            削除
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="product-admin-layout">
      <PagePanel className="admin-panel">
        <PageHeader
          kicker="Catalog manager"
          title="商品管理"
          description="レジで使用する商品を管理できます。"
          actions={
            <Button
              variant="primary"
              className="admin-create-button"
              onClick={() => onNavigate({ view: 'products', screen: 'create' })}
            >
              新規登録
            </Button>
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

        {!isLoading ? <div className="admin-filter-panel">
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
                  setSelectedStatus(event.target.value as ProductStatusFilter)
                }
              >
                <option value="all">すべて</option>
                <option value="active">表示中</option>
                <option value="inactive">非表示</option>
              </select>
            </label>
          </div>
        </div> : null}

        {!isLoading && filteredProducts.length === 0 ? (
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
          <div className="admin-table-shell">
            <ResponsiveTable
              data={filteredProducts}
              columns={columns}
              tableClassName="admin-table"
              mobileListClassName="admin-mobile-list"
              renderMobileCard={(product) => (
                <article className="admin-mobile-card">
                  <div className="admin-mobile-head">
                    <div>
                      <span className="admin-mobile-id">ID {product.id}</span>
                      <strong>{product.name}</strong>
                    </div>
                    {product.imagePath ? (
                      <img
                        className="admin-product-thumb"
                        src={buildAssetUrl(product.imagePath)}
                        alt=""
                      />
                    ) : (
                      <span className="admin-icon-badge">{product.icon || '・'}</span>
                    )}
                  </div>

                  <InfoPairList
                    items={[
                      { label: '価格', value: formatCurrency(product.price) },
                      {
                        label: 'カテゴリ',
                        value: categoryNameById.get(product.categoryId) ?? '',
                      },
                      {
                        label: '表示状態',
                        value: (
                          <StatusChip tone={product.isActive ? 'active' : 'inactive'}>
                            {product.isActive ? '表示中' : '非表示'}
                          </StatusChip>
                        ),
                      },
                      { label: '並び順', value: product.sortOrder },
                    ]}
                  />

                  <div className="admin-mobile-actions">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        onNavigate({ view: 'products', screen: 'edit', productId: product.id })
                      }
                    >
                      編集
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteProduct(product.id)}>
                      削除
                    </Button>
                  </div>
                </article>
              )}
            />
          </div>
        ) : null}
      </PagePanel>
    </div>
  )
}
