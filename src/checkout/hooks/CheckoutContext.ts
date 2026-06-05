import { createContext } from 'react'
import type { CartItem } from '../../types/product'
import type { OrderType, PaymentMethod } from '../../pos/hooks/useCart'

export type PendingCheckout = {
  id: string
  items: CartItem[]
  paymentMethod: PaymentMethod
  orderType: OrderType
  taxRatePercent: number
  subtotal: number
  tax: number
  total: number
  createdAt: string
}

export type CheckoutContextValue = {
  pendingCheckout: PendingCheckout | null
  completedCheckoutId: string | null
  isCompletingCheckout: boolean
  checkoutErrorMessage: string | null
  requestCheckout: (checkout: Omit<PendingCheckout, 'id' | 'createdAt'>) => string
  completePendingCheckout: () => Promise<void>
  cancelPendingCheckout: () => void
  clearCompletedCheckout: () => void
}

export const CheckoutContext = createContext<CheckoutContextValue | null>(null)
