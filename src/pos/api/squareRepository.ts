import { apiRequest } from '../../lib/api/client'

type SquareCheckoutResponse = {
  checkout_id: string
  amount: number
  currency: string
  status: string
}

export const createSquareCheckout = async (amount: number): Promise<string> => {
  const data = await apiRequest<SquareCheckoutResponse>('/api/payments/square/checkout', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })
  return data.checkout_id
}
