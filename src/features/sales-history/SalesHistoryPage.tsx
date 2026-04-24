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
import { formatCurrency } from '../../lib/format/currency'
import { formatSoldAt } from '../../lib/format/dateTime'
import type { SalesHistoryItem } from '../../types/sales'
import { useSalesHistory } from './hooks/useSalesHistory'
import { getPaymentMethodTone } from './model/paymentMethod'
import './sales-history.css'

const columns: ResponsiveTableColumn<SalesHistoryItem>[] = [
  {
    key: 'soldAt',
    header: '会計日時',
    render: (sale) => formatSoldAt(sale.soldAt),
  },
  {
    key: 'receiptNumber',
    header: '伝票番号',
    render: (sale) => <StatusChip mono>{sale.receiptNumber}</StatusChip>,
  },
  {
    key: 'itemCount',
    header: '注文点数',
    render: (sale) => `${sale.itemCount}点`,
  },
  {
    key: 'totalAmount',
    header: '合計金額',
    className: 'history-total-cell',
    render: (sale) => formatCurrency(sale.totalAmount),
  },
  {
    key: 'paymentMethod',
    header: '支払方法',
    render: (sale) => (
      <StatusChip tone={getPaymentMethodTone(sale.paymentMethod)}>{sale.paymentMethod}</StatusChip>
    ),
  },
  {
    key: 'actions',
    header: '操作',
    render: (sale) => (
      <Button variant="primary" className="history-detail-button" onClick={() => openSaleDetail(sale.id)}>
        詳細を見る
      </Button>
    ),
  },
]

const openSaleDetail = (saleId: number) => {
  window.alert(`売上詳細画面 (/sales/${saleId}) はモック未実装です。`)
}

export function SalesHistoryPage() {
  const { salesHistory, isLoading, isRefreshing, errorMessage, refresh } = useSalesHistory()

  return (
    <div className="history-layout">
      <PagePanel className="history-panel">
        <PageHeader
          kicker="Sales archive"
          title="売上履歴"
          description="過去の会計一覧を確認できます。新しい会計から順に表示しています。"
          actions={
            <div className="history-actions">
              <SummaryCard label="会計件数" value={salesHistory.length} className="history-summary-card" />
              <Button
                variant="secondary"
                className="history-refresh-button"
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

            <ResponsiveTable
              data={salesHistory}
              columns={columns}
              tableClassName="history-table"
              mobileListClassName="history-mobile-list"
              renderMobileCard={(sale) => (
                <article className="history-mobile-card">
                  <div className="history-mobile-head">
                    <div>
                      <span className="history-mobile-label">会計日時</span>
                      <strong>{formatSoldAt(sale.soldAt)}</strong>
                    </div>
                    <StatusChip mono>{sale.receiptNumber}</StatusChip>
                  </div>

                  <InfoPairList
                    items={[
                      { label: '注文点数', value: `${sale.itemCount}点` },
                      {
                        label: '合計金額',
                        value: <span className="history-mobile-total">{formatCurrency(sale.totalAmount)}</span>,
                      },
                      {
                        label: '支払方法',
                        value: (
                          <StatusChip tone={getPaymentMethodTone(sale.paymentMethod)}>
                            {sale.paymentMethod}
                          </StatusChip>
                        ),
                      },
                    ]}
                    className="history-mobile-meta"
                  />

                  <Button variant="primary" className="history-mobile-button" onClick={() => openSaleDetail(sale.id)}>
                    詳細を見る
                  </Button>
                </article>
              )}
            />
          </div>
        )}
      </PagePanel>
    </div>
  )
}
