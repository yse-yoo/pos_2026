import { useState } from 'react'
import { Button } from '../components/actions/Button'
import { SummaryCard } from '../components/data-display/SummaryCard'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorBanner } from '../components/feedback/ErrorBanner'
import { LoadingState } from '../components/feedback/LoadingState'
import { StatusChip } from '../components/feedback/StatusChip'
import { PageHeader } from '../components/layout/PageHeader'
import { PagePanel } from '../components/layout/PagePanel'
import { formatCurrency } from '../lib/format/currency'
import { formatSoldAt } from '../lib/format/dateTime'
import type { SaleDetail } from '../types/sale'
import { getSaleDetail } from './api/salesHistoryRepository'
import { useSalesHistory } from './hooks/useSalesHistory'
import { getPaymentMethodTone } from './model/paymentMethod'
import './sales-history.css'

export function SalesHistoryPage() {
  const {
    salesHistory,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    isLoading,
    isRefreshing,
    errorMessage,
    goToPage,
    refresh,
  } = useSalesHistory()
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<SaleDetail | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [detailErrorMessage, setDetailErrorMessage] = useState<string | null>(null)

  const openSaleDetail = async (saleId: number) => {
    setIsLoadingDetail(true)
    setDetailErrorMessage(null)
    setSelectedSaleDetail(null)

    try {
      setSelectedSaleDetail(await getSaleDetail(saleId))
    } catch (error: unknown) {
      setDetailErrorMessage(
        error instanceof Error ? error.message : '売上詳細の取得に失敗しました。',
      )
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const closeSaleDetail = () => {
    if (!isLoadingDetail) {
      setSelectedSaleDetail(null)
      setDetailErrorMessage(null)
    }
  }

  return (
    <div className="history-layout">
      <PagePanel className="history-panel">
        <PageHeader
          kicker="Sales archive"
          title="売上履歴"
          description="過去の会計一覧を確認できます。新しい会計から順に表示しています。"
          actions={
            <div className="history-actions">
              <SummaryCard label="会計件数" value={totalCount} className="history-summary-card" />
              <Button
                variant="secondary"
                className="p-4 history-refresh-button"
                onClick={() => void refresh()}
                disabled={isLoading || isRefreshing}
              >
                {isRefreshing ? '再読み込み中...' : '再読み込み'}
              </Button>
            </div>
          }
        />

        {errorMessage ? (
          <ErrorBanner title="履歴取得に失敗しました" message={errorMessage} />
        ) : null}

        {isLoading ? (
          <LoadingState
            title="売上履歴を読み込み中です"
            description="最新の会計データを取得しています。"
          />
        ) : salesHistory.length === 0 ? (
          <EmptyState icon="🧾" title="会計履歴" description="履歴データはまだありません" />
        ) : (
          <div className="history-table-shell">
            {isRefreshing ? (
              <div className="history-loading-overlay" aria-live="polite">
                <span className="loading-spinner" aria-hidden="true" />
                <span>更新中...</span>
              </div>
            ) : null}

            <div className="history-table-scroll">
              <table className="history-table">
                <thead>
                  <tr>
                    <th scope="col">会計日時</th>
                    <th scope="col">伝票番号</th>
                    <th scope="col">注文点数</th>
                    <th scope="col" className="history-total-cell">合計金額</th>
                    <th scope="col">支払方法</th>
                    <th scope="col">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {salesHistory.map((sale) => (
                    <tr key={sale.id}>
                      <td>{formatSoldAt(sale.soldAt)}</td>
                      <td>
                        <StatusChip mono>{sale.receiptNumber}</StatusChip>
                      </td>
                      <td>{sale.itemCount}点</td>
                      <td className="history-total-cell">{formatCurrency(sale.totalAmount)}</td>
                      <td>
                        <StatusChip tone={getPaymentMethodTone(sale.paymentMethod)}>
                          {sale.paymentMethod}
                        </StatusChip>
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          className="history-detail-button"
                          onClick={() => void openSaleDetail(sale.id)}
                        >
                          詳細を見る
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="history-mobile-list">
              {salesHistory.map((sale) => (
                <article key={sale.id} className="history-mobile-card">
                  <div className="history-mobile-head">
                    <div>
                      <span className="history-mobile-label">会計日時</span>
                      <strong>{formatSoldAt(sale.soldAt)}</strong>
                    </div>
                    <StatusChip mono>{sale.receiptNumber}</StatusChip>
                  </div>

                  <dl className="history-mobile-meta">
                    <div className="history-mobile-meta-row">
                      <dt>注文点数</dt>
                      <dd>{sale.itemCount}点</dd>
                    </div>
                    <div className="history-mobile-meta-row">
                      <dt>合計金額</dt>
                      <dd>
                        <span className="history-mobile-total">
                          {formatCurrency(sale.totalAmount)}
                        </span>
                      </dd>
                    </div>
                    <div className="history-mobile-meta-row">
                      <dt>支払方法</dt>
                      <dd>
                        <StatusChip tone={getPaymentMethodTone(sale.paymentMethod)}>
                          {sale.paymentMethod}
                        </StatusChip>
                      </dd>
                    </div>
                  </dl>

                  <Button variant="primary" className="history-mobile-button" onClick={() => void openSaleDetail(sale.id)}>
                    詳細を見る
                  </Button>
                </article>
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="history-pagination">
                <span className="history-pagination-info">
                  {(currentPage - 1) * pageSize + 1}〜{Math.min(currentPage * pageSize, totalCount)} / {totalCount}件
                </span>
                <div className="history-pagination-controls p-4">
                  <Button
                    variant="secondary"
                    className="history-pagination-button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1 || isRefreshing}
                  >
                    前へ
                  </Button>
                  <span className="history-pagination-pages">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    className="history-pagination-button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages || isRefreshing}
                  >
                    次へ
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </PagePanel>

      {isLoadingDetail || detailErrorMessage || selectedSaleDetail ? (
        <div className="history-detail-backdrop" role="presentation">
          <div
            className="history-detail-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-detail-title"
          >
            <div className="history-detail-header">
              <div>
                <span>売上詳細</span>
                <h3 id="history-detail-title">
                  {selectedSaleDetail?.receiptNumber ?? '読み込み中'}
                </h3>
              </div>
              <Button className="px-4 py-4" variant="ghost" onClick={closeSaleDetail} disabled={isLoadingDetail}>
                閉じる
              </Button>
            </div>

            {isLoadingDetail ? (
              <div className="history-detail-loading" aria-live="polite">
                <span className="loading-spinner" aria-hidden="true" />
                <span>詳細を読み込み中...</span>
              </div>
            ) : null}

            {detailErrorMessage ? (
              <ErrorBanner title="売上詳細取得に失敗しました" message={detailErrorMessage} />
            ) : null}

            {selectedSaleDetail ? (
              <SaleDetailContent sale={selectedSaleDetail} />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

type SaleDetailContentProps = {
  sale: SaleDetail
}

function SaleDetailContent({ sale }: SaleDetailContentProps) {
  return (
    <div className="history-detail-content">
      <dl className="history-detail-meta">
        <div>
          <dt>会計日時</dt>
          <dd>{formatSoldAt(sale.soldAt)}</dd>
        </div>
        <div>
          <dt>支払方法</dt>
          <dd>
            <StatusChip tone={getPaymentMethodTone(sale.paymentMethod)}>
              {sale.paymentMethod}
            </StatusChip>
          </dd>
        </div>
        <div>
          <dt>注文点数</dt>
          <dd>{sale.itemCount}点</dd>
        </div>
        <div>
          <dt>状態</dt>
          <dd>{sale.status || 'completed'}</dd>
        </div>
      </dl>

      <div className="history-detail-items">
        {sale.items.map((item) => (
          <div key={item.id} className="history-detail-item">
            <div>
              <strong>{item.productName}</strong>
              <span>{item.categoryName}</span>
            </div>
            <div className="history-detail-item-numbers">
              <span>{formatCurrency(item.unitPrice)} x {item.quantity}</span>
              <strong>{formatCurrency(item.total)}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="history-detail-summary">
        <div>
          <span>小計</span>
          <strong>{formatCurrency(sale.subtotal)}</strong>
        </div>
        <div>
          <span>消費税</span>
          <strong>{formatCurrency(sale.taxTotal)}</strong>
        </div>
        <div className="history-detail-total">
          <span>合計金額</span>
          <strong>{formatCurrency(sale.totalAmount)}</strong>
        </div>
      </div>
    </div>
  )
}
