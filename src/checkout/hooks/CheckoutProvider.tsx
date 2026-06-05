import { useEffect, useState, type PropsWithChildren } from 'react'
import { createSale } from '../../pos/api/saleRepository'
import { CheckoutContext, type PendingCheckout } from './CheckoutContext'

const PENDING_CHECKOUT_KEY = 'pos_2026_pending_checkout'
const COMPLETED_CHECKOUT_KEY = 'pos_2026_completed_checkout_id'

const createCheckoutId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`

const readPendingCheckout = () => {
  const value = window.localStorage.getItem(PENDING_CHECKOUT_KEY)
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as PendingCheckout
  } catch {
    window.localStorage.removeItem(PENDING_CHECKOUT_KEY)
    return null
  }
}

export function CheckoutProvider({ children }: PropsWithChildren) {
  const [pendingCheckout, setPendingCheckout] = useState<PendingCheckout | null>(() =>
    readPendingCheckout(),
  )
  const [completedCheckoutId, setCompletedCheckoutId] = useState<string | null>(() =>
    window.localStorage.getItem(COMPLETED_CHECKOUT_KEY),
  )
  const [isCompletingCheckout, setIsCompletingCheckout] = useState(false)
  const [checkoutErrorMessage, setCheckoutErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === PENDING_CHECKOUT_KEY) {
        setPendingCheckout(event.newValue ? (JSON.parse(event.newValue) as PendingCheckout) : null)
      }

      if (event.key === COMPLETED_CHECKOUT_KEY) {
        setCompletedCheckoutId(event.newValue)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const requestCheckout = (checkout: Omit<PendingCheckout, 'id' | 'createdAt'>) => {
    const nextCheckout: PendingCheckout = {
      ...checkout,
      id: createCheckoutId(),
      createdAt: new Date().toISOString(),
    }

    setPendingCheckout(nextCheckout)
    setCompletedCheckoutId(null)
    setCheckoutErrorMessage(null)
    window.localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(nextCheckout))
    window.localStorage.removeItem(COMPLETED_CHECKOUT_KEY)
    return nextCheckout.id
  }

  const completePendingCheckout = async () => {
    if (!pendingCheckout) {
      return
    }

    setIsCompletingCheckout(true)
    setCheckoutErrorMessage(null)

    try {
      await createSale(
        pendingCheckout.items,
        pendingCheckout.paymentMethod,
        pendingCheckout.taxRatePercent,
      )
      setCompletedCheckoutId(pendingCheckout.id)
      setPendingCheckout(null)
      window.localStorage.setItem(COMPLETED_CHECKOUT_KEY, pendingCheckout.id)
      window.localStorage.removeItem(PENDING_CHECKOUT_KEY)
    } catch (error: unknown) {
      setCheckoutErrorMessage(
        error instanceof Error ? error.message : '決済登録に失敗しました。',
      )
    } finally {
      setIsCompletingCheckout(false)
    }
  }

  const cancelPendingCheckout = () => {
    setPendingCheckout(null)
    setCheckoutErrorMessage(null)
    window.localStorage.removeItem(PENDING_CHECKOUT_KEY)
  }

  const clearCompletedCheckout = () => {
    setCompletedCheckoutId(null)
    window.localStorage.removeItem(COMPLETED_CHECKOUT_KEY)
  }

  return (
    <CheckoutContext.Provider
      value={{
        pendingCheckout,
        completedCheckoutId,
        isCompletingCheckout,
        checkoutErrorMessage,
        requestCheckout,
        completePendingCheckout,
        cancelPendingCheckout,
        clearCompletedCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
}
