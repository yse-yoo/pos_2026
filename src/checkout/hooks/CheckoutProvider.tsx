import { useCallback, useEffect, useState, type PropsWithChildren } from 'react'
import {
  cancelCheckoutRequest,
  completeCheckoutRequest,
  createCheckoutRequest,
  getCheckoutRequest,
  getCurrentCheckoutRequest,
} from '../api/checkoutRequestRepository'
import { CheckoutContext, type PendingCheckout } from './CheckoutContext'

const POLLING_INTERVAL_MS = 2000

export function CheckoutProvider({ children }: PropsWithChildren) {
  const [pendingCheckout, setPendingCheckout] = useState<PendingCheckout | null>(null)
  const [completedCheckout, setCompletedCheckout] = useState<PendingCheckout | null>(null)
  const [completedCheckoutId, setCompletedCheckoutId] = useState<string | null>(null)
  const [trackedCheckoutId, setTrackedCheckoutId] = useState<string | null>(null)
  const [isCompletingCheckout, setIsCompletingCheckout] = useState(false)
  const [checkoutErrorMessage, setCheckoutErrorMessage] = useState<string | null>(null)

  const refreshCurrentCheckout = useCallback(async () => {
    try {
      const currentCheckout = await getCurrentCheckoutRequest()
      setPendingCheckout(currentCheckout)
    } catch {
      // Polling errors should not hide the menu. User actions surface concrete errors.
    }
  }, [])

  useEffect(() => {
    void refreshCurrentCheckout()

    const intervalId = window.setInterval(() => {
      void refreshCurrentCheckout()
    }, POLLING_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [refreshCurrentCheckout])

  useEffect(() => {
    if (!trackedCheckoutId) {
      return undefined
    }

    const refreshTrackedCheckout = async () => {
      try {
        const checkout = await getCheckoutRequest(trackedCheckoutId)

        if (checkout.status === 'completed') {
          setCompletedCheckout(checkout)
          setCompletedCheckoutId(checkout.id)
          setPendingCheckout(null)
          setTrackedCheckoutId(null)
          return
        }

        if (checkout.status === 'canceled') {
          setPendingCheckout(null)
          setTrackedCheckoutId(null)
        }
      } catch {
        // Keep polling; transient network/backend errors should not drop POS synchronization.
      }
    }

    void refreshTrackedCheckout()

    const intervalId = window.setInterval(() => {
      void refreshTrackedCheckout()
    }, POLLING_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [trackedCheckoutId])

  const requestCheckout = async (
    checkout: Omit<PendingCheckout, 'id' | 'status' | 'saleId' | 'sale' | 'createdAt'>,
  ) => {
    const nextCheckout = await createCheckoutRequest(checkout)
    setPendingCheckout(nextCheckout)
    setCompletedCheckout(null)
    setCompletedCheckoutId(null)
    setTrackedCheckoutId(nextCheckout.id)
    setCheckoutErrorMessage(null)
    return nextCheckout.id
  }

  const completePendingCheckout = async () => {
    if (!pendingCheckout) {
      return
    }

    setIsCompletingCheckout(true)
    setCheckoutErrorMessage(null)

    try {
      await completeCheckoutRequest(pendingCheckout.id)
      setPendingCheckout(null)
    } catch (error: unknown) {
      setCheckoutErrorMessage(
        error instanceof Error ? error.message : '決済登録に失敗しました。',
      )
    } finally {
      setIsCompletingCheckout(false)
    }
  }

  const cancelPendingCheckout = async () => {
    if (!pendingCheckout) {
      return
    }

    try {
      await cancelCheckoutRequest(pendingCheckout.id)
      setPendingCheckout(null)
      setCheckoutErrorMessage(null)
    } catch (error: unknown) {
      setCheckoutErrorMessage(
        error instanceof Error ? error.message : '決済依頼のキャンセルに失敗しました。',
      )
    }
  }

  const clearCompletedCheckout = () => {
    setCompletedCheckout(null)
    setCompletedCheckoutId(null)
  }

  return (
    <CheckoutContext.Provider
      value={{
        pendingCheckout,
        completedCheckout,
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
