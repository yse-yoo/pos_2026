import { createContext } from 'react'
import type { OrderDraft } from '../api/orderDraftRepository'

export type OrderDraftContextValue = {
  orderDraft: OrderDraft | null
  syncOrderDraft: (draft: Omit<OrderDraft, 'id' | 'updatedAt'>) => Promise<void>
  clearSyncedOrderDraft: () => Promise<void>
}

export const OrderDraftContext = createContext<OrderDraftContextValue | null>(null)
