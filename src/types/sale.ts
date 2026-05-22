import type { SaleItem } from './saleItem'

export type Sale = {
  id: number
  receiptNumber: string
  soldAt: string
  itemCount: number
  totalAmount: number
  paymentMethod: string
}

export type SaleDetail = Sale & {
  subtotal: number
  taxTotal: number
  cashReceived: number | null
  changeAmount: number | null
  status: string
  items: SaleItem[]
}
