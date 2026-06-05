import { useContext } from 'react'
import { OrderDraftContext } from './OrderDraftContext'

export const useOrderDraft = () => {
  const context = useContext(OrderDraftContext)

  if (!context) {
    throw new Error('useOrderDraft must be used within OrderDraftProvider.')
  }

  return context
}
