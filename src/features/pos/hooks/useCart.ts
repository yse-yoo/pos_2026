import { useMemo, useState } from 'react'
import type { CartItem, PosProduct } from '../../../types/product'
import { createSale } from '../api/saleRepository'

const ORDER_TYPE_TAX_RATES = {
  dineIn: 0.1,
  takeout: 0.08,
}

export type PaymentMethod = 'cash' | 'card' | 'qr' | 'other'
export type OrderType = keyof typeof ORDER_TYPE_TAX_RATES

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [receiptNumber, setReceiptNumber] = useState(1)
  const [orderType, setOrderType] = useState<OrderType>('dineIn')
  const [isCompletingPayment, setIsCompletingPayment] = useState(false)
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null)

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  )
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

  const completePayment = async (method: PaymentMethod) => {
    if (cartItems.length === 0) {
      return
    }

    setIsCompletingPayment(true)
    setPaymentErrorMessage(null)

    try {
      await createSale(cartItems, method, taxRatePercent)
      setCartItems([])
      setReceiptNumber((currentNumber) => currentNumber + 1)
    } catch (error: unknown) {
      setPaymentErrorMessage(
        error instanceof Error ? error.message : '会計登録に失敗しました。',
      )
      throw error
    } finally {
      setIsCompletingPayment(false)
    }
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
    completePayment,
    isCompletingPayment,
    paymentErrorMessage,
  }
}
