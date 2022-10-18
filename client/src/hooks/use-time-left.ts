import {useEffect, useState} from 'react'
import {useGame} from '../contexts/GameContext'

export const useTimeLeft = () => {
  const {timeLeft} = useGame()
  const [countdown, setCountdown] = useState<number | undefined>()

  useEffect(() => {
    if (!timeLeft) {
      return
    }

    setCountdown(timeLeft)
    const id = setInterval(() => {
      setCountdown(c => (c ?? timeLeft) - 1)
    }, 1000)

    return () => {
      clearInterval(id)
    }
  }, [timeLeft, setCountdown])

  const hoursLeft = countdown == null
    ? undefined
    : Math.floor(countdown / 3600)

  const minutesLeft = countdown != null && hoursLeft != null
    ? Math.floor((countdown - (hoursLeft * 3600)) / 60)
    : undefined

  const secondsLeft = countdown != null && hoursLeft != null && minutesLeft != null
    ? countdown - ((hoursLeft * 3600) + (minutesLeft * 60))
    : undefined

  const fmtTime = (n: number | undefined) =>
    n == null
      ? '--'
      : n.toLocaleString().length === 1
        ? `0${n.toLocaleString()}`
        : n.toLocaleString()

  const countdownStr = [hoursLeft, minutesLeft, secondsLeft]
    .map(fmtTime)
    .join(':')

  return countdownStr
}
