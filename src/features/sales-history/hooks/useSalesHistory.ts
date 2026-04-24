import { useCallback, useEffect, useRef, useState } from 'react'
import { listSalesHistory } from '../api/salesHistoryRepository.mock'
import type { SalesHistoryItem } from '../../../types/sales'

export const useSalesHistory = () => {
  const [salesHistory, setSalesHistory] = useState<SalesHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const hasLoaded = useRef(false)

  const load = useCallback(async (refresh: boolean) => {
    if (refresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    setErrorMessage(null)

    try {
      const nextSalesHistory = await listSalesHistory()
      setSalesHistory(nextSalesHistory)
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : '売上履歴の取得に失敗しました。',
      )
    } finally {
      if (refresh) {
        setIsRefreshing(false)
      } else {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (hasLoaded.current) {
      return
    }

    hasLoaded.current = true
    void load(false)
  }, [load])

  return {
    salesHistory,
    isLoading,
    isRefreshing,
    errorMessage,
    refresh: () => load(true),
  }
}
