import { createContext } from 'react'
import type { CartItem } from '../../types/product'
import type { SaleDetail } from '../../types/sale'
import type { OrderType, PaymentMethod } from '../../pos/hooks/useCart'

export type PendingCheckout = {
  id: string
  status: 'pending' | 'completed' | 'canceled'
  items: CartItem[]
  paymentMethod: PaymentMethod
  orderType: OrderType
  taxRatePercent: number
  subtotal: number
  tax: number
  total: number
  saleId: number | null
  sale: SaleDetail | null
  createdAt: string
}

export type CheckoutContextValue = {
  pendingCheckout: PendingCheckout | null
  completedCheckout: PendingCheckout | null
  completedCheckoutId: string | null
  isCompletingCheckout: boolean
  checkoutErrorMessage: string | null
  requestCheckout: (checkout: Omit<PendingCheckout, 'id' | 'status' | 'saleId' | 'sale' | 'createdAt'>) => Promise<string>
  completePendingCheckout: () => Promise<void>
  cancelPendingCheckout: () => Promise<void>
  clearCompletedCheckout: () => void
  refreshCurrentCheckout: () => Promise<void>
}

export const CheckoutContext = createContext<CheckoutContextValue | null>(null)
