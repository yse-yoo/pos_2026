import { useEffect, useRef, useState } from 'react'
import { listSalesHistory, PAGE_SIZE } from '../api/salesHistoryRepository'
import type { Sale } from '../../types/sale'

export const useSalesHistory = () => {
  const [salesHistory, setSalesHistory] = useState<Sale[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const hasLoaded = useRef(false)

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const load = async (page: number, refresh: boolean) => {
    if (refresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setErrorMessage(null)

    try {
      const { sales, total } = await listSalesHistory(page)
      setSalesHistory(sales)
      setTotalCount(total)
      setCurrentPage(page)
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
  }

  useEffect(() => {
    if (hasLoaded.current) return
    hasLoaded.current = true
    void load(1, false)
  }, [])

  return {
    salesHistory,
    currentPage,
    totalPages,
    totalCount,
    pageSize: PAGE_SIZE,
    isLoading,
    isRefreshing,
    errorMessage,
    goToPage: (page: number) => void load(page, false),
    refresh: () => void load(currentPage, true),
  }
}
