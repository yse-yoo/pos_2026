import type { SalesHistoryItem } from '../types/sales'

export const salesHistoryFixture: SalesHistoryItem[] = [
  {
    id: 106,
    receiptNumber: 'NO.0106',
    soldAt: '2026-04-24T17:42:00+09:00',
    itemCount: 4,
    totalAmount: 2440,
    paymentMethod: 'カード',
  },
  {
    id: 105,
    receiptNumber: 'NO.0105',
    soldAt: '2026-04-24T17:18:00+09:00',
    itemCount: 2,
    totalAmount: 1180,
    paymentMethod: '現金',
  },
  {
    id: 104,
    receiptNumber: 'NO.0104',
    soldAt: '2026-04-24T16:55:00+09:00',
    itemCount: 5,
    totalAmount: 3110,
    paymentMethod: 'カード',
  },
  {
    id: 103,
    receiptNumber: 'NO.0103',
    soldAt: '2026-04-24T16:21:00+09:00',
    itemCount: 3,
    totalAmount: 1760,
    paymentMethod: '現金',
  },
  {
    id: 102,
    receiptNumber: 'NO.0102',
    soldAt: '2026-04-24T15:37:00+09:00',
    itemCount: 6,
    totalAmount: 3620,
    paymentMethod: 'カード',
  },
  {
    id: 101,
    receiptNumber: 'NO.0101',
    soldAt: '2026-04-24T14:32:00+09:00',
    itemCount: 3,
    totalAmount: 1850,
    paymentMethod: '現金',
  },
]

export const emptySalesHistoryFixture: SalesHistoryItem[] = []
