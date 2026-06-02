import { useEffect, useRef, useState } from 'react'
import type { GameComponentProps } from '../../core/types'
import { sound } from '../../core/lib/sound'
import { randomHole, HOLES, DURATION } from './logic'

export default function WhackGame({ paused, onScore, onGameOver }: GameComponentProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [active, setActive] = useState<number | null>(null)
  const overFired = useRef(false)
  const over = timeLeft === 0

  useEffect(() => onScore(score), [score, onScore])

  // 時間切れで一度だけ終了通知
  useEffect(() => {
    if (timeLeft === 0 && !overFired.current) {
      overFired.current = true
      onGameOver()
    }
  }, [timeLeft, onGameOver])

  // モグラ出現 + カウントダウン
  useEffect(() => {
    if (paused || over) return
    const spawn = setInterval(() => {
      setActive((prev) => randomHole(Math.random, prev ?? -1))
    }, 700)
    const clock = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000)
    return () => {
      clearInterval(spawn)
      clearInterval(clock)
    }
  }, [paused, over])

  const whack = (i: number) => {
    if (paused || over || i !== active) return
    sound.brick()
    setScore((s) => s + 1)
    setActive(null)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-xs justify-between text-sm text-muted">
        <span>
          残り <span className="font-pixel text-fg">{timeLeft}</span> 秒
        </span>
        <span>
          叩いた数 <span className="font-pixel text-fg">{score}</span>
        </span>
      </div>
      <div className="grid w-full max-w-xs grid-cols-3 gap-3">
        {Array.from({ length: HOLES }, (_, i) => (
          <button
            key={i}
            onClick={() => whack(i)}
            disabled={paused || over}
            aria-label={`穴 ${i}`}
            className="flex aspect-square items-center justify-center rounded-full bg-surface-2 text-3xl ring-1 ring-line transition active:scale-95"
          >
            {active === i ? '🐹' : ''}
          </button>
        ))}
      </div>
      <p className="text-xs text-faint">出てきたモグラをタップ！制限{DURATION}秒</p>
    </div>
  )
}
