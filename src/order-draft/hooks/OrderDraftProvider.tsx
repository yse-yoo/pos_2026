import { useCallback, useEffect, useState, type PropsWithChildren } from 'react'
import {
  clearOrderDraft,
  getCurrentOrderDraft,
  saveOrderDraft,
  type OrderDraft,
} from '../api/orderDraftRepository'
import { OrderDraftContext } from './OrderDraftContext'

const POLLING_INTERVAL_MS = 2000

export function OrderDraftProvider({ children }: PropsWithChildren) {
  const [orderDraft, setOrderDraft] = useState<OrderDraft | null>(null)

  const refreshOrderDraft = useCallback(async () => {
    try {
      setOrderDraft(await getCurrentOrderDraft())
    } catch {
      // Order preview polling should not block the menu UI.
    }
  }, [])

  useEffect(() => {
    void refreshOrderDraft()

    const intervalId = window.setInterval(() => {
      void refreshOrderDraft()
    }, POLLING_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [refreshOrderDraft])

  const syncOrderDraft = useCallback(async (draft: Omit<OrderDraft, 'id' | 'updatedAt'>) => {
    setOrderDraft(await saveOrderDraft(draft))
  }, [])

  const clearSyncedOrderDraft = useCallback(async () => {
    await clearOrderDraft()
    setOrderDraft(null)
  }, [])

  return (
    <OrderDraftContext.Provider value={{ orderDraft, syncOrderDraft, clearSyncedOrderDraft }}>
      {children}
    </OrderDraftContext.Provider>
  )
}
