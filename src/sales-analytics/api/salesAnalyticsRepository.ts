import { apiRequest } from '../../lib/api/client'

export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly'

export type AnalyticsDataPoint = {
  period: string
  totalAmount: number
  saleCount: number
}

type AnalyticsResource = {
  period: string
  total_amount: string | number
  sale_count: string | number
}

export const fetchAnalytics = async (
  period: AnalyticsPeriod,
  dateFrom: string,
  dateTo: string,
): Promise<AnalyticsDataPoint[]> => {
  const params = new URLSearchParams({ period, date_from: dateFrom, date_to: dateTo })
  const items = await apiRequest<AnalyticsResource[]>(`/api/sales/analytics?${params}`)
  return items.map((item) => ({
    period: item.period,
    totalAmount: Number(item.total_amount),
    saleCount: Number(item.sale_count),
  }))
}
