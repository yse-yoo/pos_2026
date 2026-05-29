import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { ErrorBanner } from '../components/feedback/ErrorBanner'
import { LoadingState } from '../components/feedback/LoadingState'
import { EmptyState } from '../components/feedback/EmptyState'
import { PageHeader } from '../components/layout/PageHeader'
import { PagePanel } from '../components/layout/PagePanel'
import { formatCurrency } from '../lib/format/currency'
import type { AnalyticsPeriod } from './api/salesAnalyticsRepository'
import { useSalesAnalytics } from './hooks/useSalesAnalytics'
import './sales-analytics.css'

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: 'daily',   label: '日別' },
  { value: 'weekly',  label: '週別' },
  { value: 'monthly', label: '月別' },
]

const formatXAxis = (period: string, granularity: AnalyticsPeriod): string => {
  if (granularity === 'monthly') return period.replace('-', '/')
  const [, m, d] = period.split('-')
  return `${m}/${d}`
}

export function SalesAnalyticsPage() {
  const {
    period, dateFrom, dateTo,
    data, isLoading, errorMessage,
    changePeriod, setDateFrom, setDateTo,
  } = useSalesAnalytics()

  const totalAmount = data.reduce((s, d) => s + d.totalAmount, 0)
  const totalCount  = data.reduce((s, d) => s + d.saleCount,  0)

  return (
    <PagePanel className="analytics-panel">
      <PageHeader
        kicker="Sales trend"
        title="売上推移"
        description="期間別の売上金額・件数を確認できます。"
      />

      <div className="analytics-controls">
        <div className="analytics-period-tabs">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`analytics-period-tab${period === value ? ' is-active' : ''}`}
              onClick={() => changePeriod(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="analytics-date-range">
          <input
            type="date"
            className="analytics-date-input"
            value={dateFrom}
            max={dateTo}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span className="analytics-date-sep">〜</span>
          <input
            type="date"
            className="analytics-date-input"
            value={dateTo}
            min={dateFrom}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {errorMessage ? (
        <ErrorBanner title="データ取得に失敗しました" message={errorMessage} />
      ) : isLoading ? (
        <LoadingState title="売上データを読み込み中です" description="集計しています。" />
      ) : data.length === 0 ? (
        <EmptyState icon="📊" title="データなし" description="期間内の売上データがありません" />
      ) : (
        <>
          <div className="analytics-summary">
            <div className="analytics-summary-card">
              <span>売上合計</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>
            <div className="analytics-summary-card">
              <span>会計件数</span>
              <strong>{totalCount}件</strong>
            </div>
            <div className="analytics-summary-card">
              <span>平均単価</span>
              <strong>{totalCount > 0 ? formatCurrency(Math.round(totalAmount / totalCount)) : '—'}</strong>
            </div>
          </div>

          <div className="analytics-chart-wrap">
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={data} margin={{ top: 8, right: 24, left: 16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="period"
                  tickFormatter={(v: string) => formatXAxis(v, period)}
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="amount"
                  orientation="left"
                  tickFormatter={(v: number) => `¥${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                  width={56}
                />
                <YAxis
                  yAxisId="count"
                  orientation="right"
                  tickFormatter={(v: number) => `${v}件`}
                  tick={{ fontSize: 11 }}
                  width={48}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === '売上金額' ? formatCurrency(value) : `${value}件`
                  }
                  labelFormatter={(label: string) => formatXAxis(label, period)}
                />
                <Legend />
                <Bar
                  yAxisId="count"
                  dataKey="saleCount"
                  name="件数"
                  fill="#86efac"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={40}
                />
                <Line
                  yAxisId="amount"
                  type="monotone"
                  dataKey="totalAmount"
                  name="売上金額"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </PagePanel>
  )
}
