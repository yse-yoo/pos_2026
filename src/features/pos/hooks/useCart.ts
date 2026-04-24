import { useMemo, useState } from 'react'
import { formatCurrency } from '../../../lib/format/currency'
import type { CartItem, PosProduct } from '../../../types/product'

const TAX_RATE = 0.1

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [receiptNumber, setReceiptNumber] = useState(1)

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

  const completePayment = (method: string) => {
    if (cartItems.length === 0) {
      return
    }

    window.alert(`会計完了 (${method}): ${formatCurrency(total)}`)
    setCartItems([])
    setReceiptNumber((currentNumber) => currentNumber + 1)
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
  }
}
