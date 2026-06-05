import { apiRequest } from '../../lib/api/client'
import type { CartItem } from '../../types/product'
import type { OrderType } from '../../pos/hooks/useCart'

export type OrderDraft = {
  id: number
  items: CartItem[]
  orderType: OrderType
  taxRatePercent: number
  subtotal: number
  tax: number
  total: number
  updatedAt: string
}

type OrderDraftResource = {
  id: number
  order_type: OrderType
  tax_rate: number
  subtotal: number
  tax_total: number
  total: number
  items: Array<{
    id?: number
    product_id?: number
    name?: string
    price?: number
    quantity: number
  }>
  updated_at: string
}

const mapOrderDraft = (draft: OrderDraftResource): OrderDraft => ({
  id: Number(draft.id),
  orderType: draft.order_type,
  taxRatePercent: Number(draft.tax_rate),
  subtotal: Number(draft.subtotal),
  tax: Number(draft.tax_total),
  total: Number(draft.total),
  updatedAt: draft.updated_at,
  items: draft.items.map((item) => ({
    id: Number(item.id ?? item.product_id),
    name: item.name ?? `商品ID ${item.product_id ?? item.id}`,
    price: Number(item.price ?? 0),
    category: 'フード',
    icon: '・',
    imagePath: '',
    isActive: true,
    quantity: Number(item.quantity),
  })),
})

const toOrderDraftBody = (draft: Omit<OrderDraft, 'id' | 'updatedAt'>) => ({
  order_type: draft.orderType,
  tax_rate: draft.taxRatePercent,
  subtotal: draft.subtotal,
  tax_total: draft.tax,
  total: draft.total,
  items: draft.items.map((item) => ({
    id: item.id,
    product_id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  })),
})

export const getCurrentOrderDraft = async (): Promise<OrderDraft | null> => {
  const draft = await apiRequest<OrderDraftResource | null>('/api/order-draft/current')
  return draft ? mapOrderDraft(draft) : null
}

export const saveOrderDraft = async (
  draft: Omit<OrderDraft, 'id' | 'updatedAt'>,
): Promise<OrderDraft | null> => {
  const savedDraft = await apiRequest<OrderDraftResource | null>('/api/order-draft/current', {
    method: 'PUT',
    body: JSON.stringify(toOrderDraftBody(draft)),
  })
  return savedDraft ? mapOrderDraft(savedDraft) : null
}

export const clearOrderDraft = async (): Promise<void> => {
  await apiRequest<null>('/api/order-draft/current', {
    method: 'DELETE',
  })
}
