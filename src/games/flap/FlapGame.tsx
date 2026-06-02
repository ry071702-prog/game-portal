import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameComponentProps } from '../../core/types'
import { useGameLoop } from '../../core/hooks/useGameLoop'
import { sound } from '../../core/lib/sound'
import { W, H, BIRD_X, BIRD_R, GAP, PIPE_W, makePipe, hitsPipe, type Pipe } from './logic'

const GRAVITY = 0.0011 // px/ms^2
const FLAP_V = -0.42 // px/ms
const SPEED = 0.13 // px/ms (パイプ横移動)
const SPACING = 200 // パイプ間隔(px)

interface World {
  y: number
  vy: number
  pipes: Pipe[]
  score: number
  dist: number // 次パイプ生成までの距離管理
}

function initWorld(): World {
  return { y: H / 2, vy: 0, pipes: [makePipe(W + 40)], score: 0, dist: 0 }
}

export default function FlapGame({ paused, onScore, onGameOver }: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const w = useRef<World>(initWorld())
  const reported = useRef(0)
  const overFired = useRef(false)
  const [alive, setAlive] = useState(true)
  const [started, setStarted] = useState(false)

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const s = w.current
    ctx.fillStyle = '#0f1117'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#22c55e'
    for (const p of s.pipes) {
      ctx.fillRect(p.x, 0, PIPE_W, p.gapY)
      ctx.fillRect(p.x, p.gapY + GAP, PIPE_W, H - p.gapY - GAP)
    }
    ctx.beginPath()
    ctx.arc(BIRD_X, s.y, BIRD_R, 0, Math.PI * 2)
    ctx.fillStyle = '#fde047'
    ctx.fill()
  }, [])

  useEffect(() => {
    draw()
  }, [paused, draw])

  const flap = useCallback(() => {
    if (paused) return
    if (!alive) return
    setStarted(true)
    w.current.vy = FLAP_V
    sound.hit()
  }, [paused, alive])

  // 入力 (タップ/クリック/スペース)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault()
        flap()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flap])

  useGameLoop(
    (dtRaw) => {
      const dt = Math.min(dtRaw, 32)
      const s = w.current
      s.vy += GRAVITY * dt
      s.y += s.vy * dt

      // パイプ移動 + 生成 + 通過判定 (エイリアス変更を避け再構築)
      s.dist += SPEED * dt
      let spawn: Pipe[] = []
      if (s.dist >= SPACING) {
        s.dist -= SPACING
        spawn = [makePipe(W + PIPE_W)]
      }
      let scored = false
      s.pipes = [...s.pipes, ...spawn]
        .map((p) => {
          const nx = p.x - SPEED * dt
          const passed = p.passed || nx + PIPE_W < BIRD_X
          if (passed && !p.passed) scored = true
          return { ...p, x: nx, passed }
        })
        .filter((p) => p.x + PIPE_W > -10)
      if (scored) {
        s.score += 1
        sound.eat()
      }

      // 衝突 / 場外
      const dead = s.y + BIRD_R > H || s.y - BIRD_R < 0 || s.pipes.some((p) => hitsPipe(s.y, p))
      if (dead) {
        if (!overFired.current) {
          overFired.current = true
          setAlive(false)
          onGameOver()
        }
        return
      }

      draw()
      if (s.score !== reported.current) {
        reported.current = s.score
        onScore(s.score)
      }
    },
    !paused && alive && started,
  )

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="game-surface w-full max-w-xs touch-none"
        onPointerDown={(e) => {
          e.preventDefault()
          flap()
        }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full rounded-xl"
          style={{ aspectRatio: `${W} / ${H}` }}
        />
      </div>
      <p className="text-xs text-faint">
        {started ? 'タップ/スペースで上昇' : 'タップ/スペースでスタート'}
      </p>
    </div>
  )
}
