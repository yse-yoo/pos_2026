import { useEffect, useState } from 'react'
import { fetchAnalytics } from '../api/salesAnalyticsRepository'
import type { AnalyticsPeriod, AnalyticsDataPoint } from '../api/salesAnalyticsRepository'

const defaultDateRange = (period: AnalyticsPeriod): { dateFrom: string; dateTo: string } => {
  const today = new Date()
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const daysAgo = (n: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() - n)
    return fmt(d)
  }
  const monthsAgo = (n: number) => {
    const d = new Date(today)
    d.setMonth(d.getMonth() - n)
    return fmt(d)
  }
  if (period === 'monthly') return { dateFrom: monthsAgo(11), dateTo: fmt(today) }
  if (period === 'weekly')  return { dateFrom: daysAgo(83),   dateTo: fmt(today) }
  return                           { dateFrom: daysAgo(29),   dateTo: fmt(today) }
}

export const useSalesAnalytics = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>('daily')
  const [dateFrom, setDateFrom] = useState(() => defaultDateRange('daily').dateFrom)
  const [dateTo, setDateTo] = useState(() => defaultDateRange('daily').dateTo)
  const [data, setData] = useState<AnalyticsDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const load = async (p: AnalyticsPeriod, from: string, to: string) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      setData(await fetchAnalytics(p, from, to))
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : '取得に失敗しました。')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load(period, dateFrom, dateTo)
  }, [period, dateFrom, dateTo])

  const changePeriod = (next: AnalyticsPeriod) => {
    const range = defaultDateRange(next)
    setPeriod(next)
    setDateFrom(range.dateFrom)
    setDateTo(range.dateTo)
  }

  return {
    period, dateFrom, dateTo,
    data, isLoading, errorMessage,
    changePeriod,
    setDateFrom, setDateTo,
  }
}
