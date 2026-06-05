import { apiRequest } from '../../lib/api/client'
import type { CartItem } from '../../types/product'

type PaymentMethod = 'cash' | 'card' | 'qr' | 'emoney' | 'transportation'

export const createSale = async (
  items: CartItem[],
  paymentMethod: PaymentMethod,
  taxRatePercent: number,
): Promise<void> => {
  await apiRequest('/api/payments/square/checkout', {
    method: 'POST',
    body: JSON.stringify({
      payment_method: paymentMethod,
      cash_received: null,
      tax_rate: taxRatePercent,
      items: items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    }),
  })
}
