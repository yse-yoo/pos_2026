import { useMemo, useState } from 'react'
import { formatCurrency } from '../../../lib/format/currency'
import type { CartItem, PosProduct } from '../../../types/product'
import { createSale } from '../api/saleRepository'

const TAX_RATE = 0.1
const paymentMethodLabels = {
  cash: '現金',
  card: 'カード',
  qr: 'QR',
  other: 'その他',
}

export type PaymentMethod = keyof typeof paymentMethodLabels

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [receiptNumber, setReceiptNumber] = useState(1)
  const [isCompletingPayment, setIsCompletingPayment] = useState(false)
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null)

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  )
  const tax = Math.round(subtotal * TAX_RATE)
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
      await createSale(cartItems, method)
      window.alert(`会計完了 (${paymentMethodLabels[method]}): ${formatCurrency(total)}`)
      setCartItems([])
      setReceiptNumber((currentNumber) => currentNumber + 1)
    } catch (error: unknown) {
      setPaymentErrorMessage(
        error instanceof Error ? error.message : '会計登録に失敗しました。',
      )
    } finally {
      setIsCompletingPayment(false)
    }
  }

  return {
    cartItems,
    receiptNumber,
    subtotal,
    tax,
    total,
    addItem,
    changeQuantity,
    clearOrder,
    completePayment,
    isCompletingPayment,
    paymentErrorMessage,
  }
}
