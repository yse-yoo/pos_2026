export type SalesHistoryItem = {
  id: number
  receiptNumber: string
  soldAt: string
  itemCount: number
  totalAmount: number
  paymentMethod: string
}

export type SalesHistoryDetailItem = {
  id: number
  productName: string
  categoryName: string
  unitPrice: number
  quantity: number
  taxRate: number
  taxAmount: number
  subtotal: number
  total: number
}

export type SalesHistoryDetail = SalesHistoryItem & {
  subtotal: number
  taxTotal: number
  cashReceived: number | null
  changeAmount: number | null
  status: string
  items: SalesHistoryDetailItem[]
}
