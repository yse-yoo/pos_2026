export const formatReceiptNumber = (value: number) => `NO.${String(value).padStart(4, '0')}`
