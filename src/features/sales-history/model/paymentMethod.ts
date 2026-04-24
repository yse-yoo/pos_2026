export const getPaymentMethodTone = (paymentMethod: string) => {
  if (paymentMethod.includes('現金')) {
    return 'cash' as const
  }

  if (paymentMethod.includes('カード')) {
    return 'card' as const
  }

  return 'neutral' as const
}
