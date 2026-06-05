import { useCallback, useEffect, useState, type PropsWithChildren } from 'react'
import {
  clearOrderDraft,
  mapOrderDraft,
  saveOrderDraft,
  type OrderDraft,
} from '../api/orderDraftRepository'
import { OrderDraftContext } from './OrderDraftContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export function OrderDraftProvider({ children }: PropsWithChildren) {
  const [orderDraft, setOrderDraft] = useState<OrderDraft | null>(null)

  useEffect(() => {
    const source = new EventSource(`${API_BASE_URL}/api/order-draft/stream`, {
      withCredentials: true,
    })

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data as string) as {
          success: boolean
          data: Parameters<typeof mapOrderDraft>[0] | null
        }
        if (payload.success) {
          setOrderDraft(payload.data ? mapOrderDraft(payload.data) : null)
        }
      } catch {
        // ignore parse errors
      }
    }

    return () => source.close()
  }, [])

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
