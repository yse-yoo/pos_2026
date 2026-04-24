import { useEffect, useState } from 'react'
import { createClockLabel } from '../lib/format/dateTime'

export const useClock = () => {
  const [clockLabel, setClockLabel] = useState(createClockLabel)

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setClockLabel(createClockLabel())
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [])

  return clockLabel
}
