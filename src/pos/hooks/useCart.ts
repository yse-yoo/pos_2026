import { useEffect, useState } from 'react'
import { useCheckout } from '../../checkout/hooks/useCheckout'
import type { CartItem, PosProduct } from '../../types/product'

const ORDER_TYPE_TAX_RATES = {
  dineIn: 0.1,
  takeout: 0.08,
}

export type PaymentMethod = 'cash' | 'card' | 'qr' | 'other' | 'square'
export type OrderType = keyof typeof ORDER_TYPE_TAX_RATES

export const useCart = () => {
  const { pendingCheckout, completedCheckoutId, requestCheckout, clearCompletedCheckout } = useCheckout()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [receiptNumber, setReceiptNumber] = useState(1)
  const [orderType, setOrderType] = useState<OrderType>('dineIn')
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null)
  const [requestedCheckoutId, setRequestedCheckoutId] = useState<string | null>(null)

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const taxRate = ORDER_TYPE_TAX_RATES[orderType]
  const taxRatePercent = Math.round(taxRate * 100)
  const tax = Math.round(subtotal * taxRate)
  const total = subtotal + tax

  const addItem = (product: PosProduct) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id)

      if (!existingItem) {
        return [...currentItems, { ...product, quantity: 1 }]
      }

      return currentItems.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
      )
    })
  }

  const changeQuantity = (productId: number, delta: number) => {
    setCartItems((currentItems) =>
      currentItems.reduce<CartItem[]>((nextItems, item) => {
        if (item.id !== productId) {
          nextItems.push(item)
          return nextItems
        }

        const nextQuantity = item.quantity + delta
        if (nextQuantity > 0) {
          nextItems.push({ ...item, quantity: nextQuantity })
        }

        return nextItems
      }, []),
    )
  }

  const clearOrder = () => {
    if (cartItems.length === 0) {
      return
    }

    const shouldClear = window.confirm('注文をすべて削除しますか？')
    if (shouldClear) {
      setCartItems([])
    }
  }

  useEffect(() => {
    if (!completedCheckoutId || completedCheckoutId !== requestedCheckoutId) {
      return
    }

    setCartItems([])
    setReceiptNumber((currentNumber) => currentNumber + 1)
    setRequestedCheckoutId(null)
    clearCompletedCheckout()
  }, [clearCompletedCheckout, completedCheckoutId, requestedCheckoutId])

  useEffect(() => {
    if (requestedCheckoutId && !pendingCheckout && !completedCheckoutId) {
      setRequestedCheckoutId(null)
    }
  }, [completedCheckoutId, pendingCheckout, requestedCheckoutId])

  const requestPayment = async (method: PaymentMethod) => {
    if (cartItems.length === 0) {
      return
    }

    setPaymentErrorMessage(null)

    const checkoutId = requestCheckout({
      items: cartItems,
      paymentMethod: method,
      orderType,
      taxRatePercent,
      subtotal,
      tax,
      total,
    })
    setRequestedCheckoutId(checkoutId)
  }

  return {
    cartItems,
    receiptNumber,
    orderType,
    taxRatePercent,
    subtotal,
    tax,
    total,
    addItem,
    changeQuantity,
    setOrderType,
    clearOrder,
    requestPayment,
    isAwaitingPayment: requestedCheckoutId !== null,
    paymentErrorMessage,
  }
}
