export const formatSoldAt = (value: string) =>
  new Date(value).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

export const createClockLabel = () =>
  new Date().toLocaleTimeString('ja-JP', {
    hour12: false,
  })
