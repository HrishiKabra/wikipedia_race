import { useEffect, useRef, useState } from 'react'

export function useTimer(running: boolean) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - elapsed
      const tick = () => {
        setElapsed(Date.now() - startRef.current!)
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } else {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [running]) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setElapsed(0)
    startRef.current = null
  }

  return { elapsed, reset }
}

export function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const secs = s % 60
  return m > 0 ? `${m}:${secs.toString().padStart(2, '0')}` : `${secs}s`
}
