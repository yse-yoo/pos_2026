import { salesHistoryFixture } from '../../../mocks/salesHistory'
import type { SalesHistoryItem } from '../../../types/sales'

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })

export const listSalesHistory = async (): Promise<SalesHistoryItem[]> => {
  await wait(450)

  return [...salesHistoryFixture].sort(
    (left, right) => new Date(right.soldAt).getTime() - new Date(left.soldAt).getTime(),
  )
}
