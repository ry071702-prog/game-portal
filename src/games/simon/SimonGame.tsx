import { useEffect, useMemo, useRef, useState } from 'react'
import type { GameComponentProps } from '../../core/types'
import { sound } from '../../core/lib/sound'
import { mulberry32 } from '../../core/lib/daily'
import { extend, type Pad } from './logic'

type Phase = 'showing' | 'input' | 'over'

const PADS: { base: string; lit: string }[] = [
  { base: 'bg-green-700', lit: 'bg-green-400' },
  { base: 'bg-red-700', lit: 'bg-red-400' },
  { base: 'bg-yellow-600', lit: 'bg-yellow-300' },
  { base: 'bg-blue-700', lit: 'bg-blue-400' },
]

export default function SimonGame({ paused, onScore, onGameOver, seed }: GameComponentProps) {
  const rng = useMemo(() => (seed != null ? mulberry32(seed) : Math.random), [seed])
  const [seq, setSeq] = useState<Pad[]>(() => [Math.floor(rng() * 4) as Pad])
  const [phase, setPhase] = useState<Phase>('showing')
  const [active, setActive] = useState<Pad | null>(null)
  const [score, setScore] = useState(0)
  const inputIndex = useRef(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  useEffect(() => onScore(score), [score, onScore])

  // シーケンス再生
  useEffect(() => {
    if (phase !== 'showing' || paused) return
    clearTimers()
    const step = 600
    seq.forEach((pad, i) => {
      timers.current.push(
        setTimeout(() => {
          setActive(pad)
          sound.pad(pad)
        }, i * step + 250),
      )
      timers.current.push(setTimeout(() => setActive(null), i * step + 250 + 350))
    })
    timers.current.push(
      setTimeout(() => {
        inputIndex.current = 0
        setPhase('input')
      }, seq.length * step + 250),
    )
    return clearTimers
  }, [phase, seq, paused])

  const press = (pad: Pad) => {
    if (phase !== 'input' || paused) return
    setActive(pad)
    sound.pad(pad)
    timers.current.push(setTimeout(() => setActive(null), 150))

    if (pad !== seq[inputIndex.current]) {
      sound.wrong()
      setPhase('over')
      onGameOver()
      return
    }
    inputIndex.current += 1
    if (inputIndex.current === seq.length) {
      // 1ラウンドクリア → スコア加算して次へ
      setScore(seq.length)
      setPhase('showing')
      timers.current.push(setTimeout(() => setSeq((s) => extend(s, rng)), 900))
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted">
        {phase === 'showing' ? '覚えてね…' : phase === 'input' ? 'あなたの番！' : 'ミス！'} / ラウンド{' '}
        <span className="font-display text-fg">{score}</span>
      </p>
      <div className="grid w-full max-w-xs grid-cols-2 gap-3">
        {PADS.map((p, i) => {
          const pad = i as Pad
          const isLit = active === pad
          return (
            <button
              key={i}
              onClick={() => press(pad)}
              disabled={phase !== 'input' || paused}
              aria-label={`パッド ${i}`}
              className={`aspect-square rounded-2xl transition-all duration-150 ${
                isLit ? `${p.lit} scale-95 shadow-[0_0_24px_-2px_currentColor]` : p.base
              }`}
            />
          )
        })}
      </div>
      <p className="text-xs text-faint">光った順番をタップして再現</p>
    </div>
  )
}
