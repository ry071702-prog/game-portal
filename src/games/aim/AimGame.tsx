import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import type { GameComponentProps } from '../../core/types'
import { useGameLoop } from '../../core/hooks/useGameLoop'
import { sound } from '../../core/lib/sound'
import { mulberry32 } from '../../core/lib/daily'
import { DURATION, spawnTarget, shrinkRatio, hitScore, applyMiss, type Target } from './logic'

export default function AimGame({ paused, onScore, onGameOver, seed }: GameComponentProps) {
  const rng = useMemo(() => (seed != null ? mulberry32(seed) : Math.random), [seed])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION) // 表示用 (秒)
  const [target, setTarget] = useState<Target>(() => spawnTarget(0, rng))
  const [ratio, setRatio] = useState(1) // 的の残り半径比 (描画用)
  const [over, setOver] = useState(false)
  // 残り時間と的の経過は ms 単位で ref 管理 (paused 中はループ停止で自然に凍結)
  const world = useRef({ timeLeftMs: DURATION * 1000, ageMs: 0 })
  const indexRef = useRef(0) // 出した的の通し番号 (難易度カーブ用)
  const overFired = useRef(false)

  useEffect(() => onScore(score), [score, onScore])

  const nextTarget = () => {
    indexRef.current += 1
    world.current.ageMs = 0
    setTarget(spawnTarget(indexRef.current, rng))
  }

  useGameLoop(
    (dtRaw) => {
      const dt = Math.min(dtRaw, 100)
      const w = world.current
      w.timeLeftMs = Math.max(0, w.timeLeftMs - dt)
      w.ageMs += dt
      // 寿命切れの的はノーペナルティで次へ
      if (w.ageMs >= target.lifetimeMs) nextTarget()
      setTimeLeft(Math.ceil(w.timeLeftMs / 1000))
      setRatio(shrinkRatio(w.ageMs, target.lifetimeMs))
      if (w.timeLeftMs <= 0 && !overFired.current) {
        overFired.current = true
        setOver(true)
        onGameOver() // 終了音は GameShell に委譲 (二重再生回避)
      }
    },
    !paused && !over,
  )

  // 的に命中: 残り半径比に応じて加点して即次の的
  const hit = (e: PointerEvent) => {
    e.stopPropagation()
    if (paused || over) return
    sound.hit()
    setScore((s) => s + hitScore(shrinkRatio(world.current.ageMs, target.lifetimeMs)))
    nextTarget()
  }

  // 的以外をクリック: -20 (0未満にはしない)
  const miss = () => {
    if (paused || over) return
    sound.wrong()
    setScore((s) => applyMiss(s))
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-sm justify-between text-sm text-muted">
        <span>
          残り <span className="font-display text-fg">{timeLeft}</span> 秒
        </span>
        <span>
          スコア <span className="font-display text-fg">{score}</span>
        </span>
      </div>
      <div
        onPointerDown={miss}
        className="game-surface relative aspect-square w-full max-w-sm rounded-xl bg-surface ring-1 ring-line"
      >
        {!over && (
          <button
            onPointerDown={hit}
            disabled={paused}
            aria-label="的"
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-none"
            style={{
              left: `${target.x * 100}%`,
              top: `${target.y * 100}%`,
              width: `${target.radius * 2 * ratio * 100}%`,
              height: `${target.radius * 2 * ratio * 100}%`,
              background:
                'radial-gradient(circle, var(--yellow) 0 30%, var(--pink) 30% 65%, var(--cyan) 65% 100%)',
            }}
          />
        )}
      </div>
      <p className="text-xs text-faint">
        縮む的を消える前にタップ！大きいうちに当てるほど高得点 (ミスは -20)
      </p>
    </div>
  )
}
