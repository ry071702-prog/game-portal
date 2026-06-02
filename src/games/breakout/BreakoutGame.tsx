import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameComponentProps } from '../../core/types'
import { useGameLoop } from '../../core/hooks/useGameLoop'
import { sound } from '../../core/lib/sound'
import { WIDTH, HEIGHT, makeBricks, intersects, ballRect, type Brick } from './logic'

const PADDLE_W = 68
const PADDLE_H = 12
const PADDLE_Y = HEIGHT - 26
const BALL_R = 6

interface World {
  bricks: Brick[]
  paddleX: number
  bx: number
  by: number
  vx: number
  vy: number
  speed: number
  score: number
}

function freshBall(speed: number): Pick<World, 'bx' | 'by' | 'vx' | 'vy'> {
  return { bx: WIDTH / 2, by: PADDLE_Y - 20, vx: speed * 0.6, vy: -speed }
}

function initWorld(): World {
  const speed = 0.26
  return { bricks: makeBricks(), paddleX: WIDTH / 2, speed, score: 0, ...freshBall(speed) }
}

export default function BreakoutGame({ paused, onScore, onGameOver }: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const w = useRef<World>(initWorld())
  const reported = useRef(0)
  const overReported = useRef(false)
  const [alive, setAlive] = useState(true)

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const s = w.current
    ctx.fillStyle = '#0f1117'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    for (const b of s.bricks) {
      if (!b.alive) continue
      ctx.fillStyle = b.color
      ctx.fillRect(b.x, b.y, b.w, b.h)
    }
    ctx.fillStyle = '#22d3ee'
    ctx.fillRect(s.paddleX - PADDLE_W / 2, PADDLE_Y, PADDLE_W, PADDLE_H)
    ctx.beginPath()
    ctx.arc(s.bx, s.by, BALL_R, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
  }, [])

  useEffect(() => {
    draw()
  }, [paused, draw])

  const movePaddle = useCallback((x: number) => {
    w.current.paddleX = Math.max(PADDLE_W / 2, Math.min(WIDTH - PADDLE_W / 2, x))
  }, [])

  // ポインタ(マウス/タッチ)で操作
  useEffect(() => {
    const el = surfaceRef.current
    const canvas = canvasRef.current
    if (!el || !canvas) return
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      movePaddle(((e.clientX - rect.left) / rect.width) * WIDTH)
      if (e.cancelable) e.preventDefault()
    }
    el.addEventListener('pointermove', onMove, { passive: false })
    el.addEventListener('pointerdown', onMove, { passive: false })
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerdown', onMove)
    }
  }, [movePaddle])

  // キーボード操作
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') movePaddle(w.current.paddleX - 28)
      else if (e.key === 'ArrowRight' || e.key === 'd') movePaddle(w.current.paddleX + 28)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [movePaddle])

  useGameLoop((dtRaw) => {
    const s = w.current
    const dt = Math.min(dtRaw, 32) // トンネリング防止
    s.bx += s.vx * dt
    s.by += s.vy * dt

    // 壁
    if (s.bx - BALL_R < 0) {
      s.bx = BALL_R
      s.vx = Math.abs(s.vx)
    } else if (s.bx + BALL_R > WIDTH) {
      s.bx = WIDTH - BALL_R
      s.vx = -Math.abs(s.vx)
    }
    if (s.by - BALL_R < 0) {
      s.by = BALL_R
      s.vy = Math.abs(s.vy)
    }

    // パドル
    const paddle = { x: s.paddleX - PADDLE_W / 2, y: PADDLE_Y, w: PADDLE_W, h: PADDLE_H }
    if (s.vy > 0 && intersects(ballRect(s.bx, s.by, BALL_R), paddle)) {
      sound.hit()
      const hit = (s.bx - s.paddleX) / (PADDLE_W / 2) // -1..1
      const speed = s.speed
      s.vx = hit * speed * 1.1
      s.vy = -Math.sqrt(Math.max(speed * speed - s.vx * s.vx, speed * speed * 0.25))
      s.by = PADDLE_Y - BALL_R - 1
    }

    // ブロック (1フレーム1個)。エイリアス変更を避け配列を再代入する
    const br = ballRect(s.bx, s.by, BALL_R)
    const hit = s.bricks.findIndex((b) => b.alive && intersects(br, b))
    if (hit >= 0) {
      const b = s.bricks[hit]
      s.bricks = s.bricks.map((x, i) => (i === hit ? { ...x, alive: false } : x))
      s.score += 10
      sound.brick()
      // 横から当たったら左右反転、それ以外は上下反転 (簡易)
      const fromSide = s.bx < b.x || s.bx > b.x + b.w
      if (fromSide) s.vx = -s.vx
      else s.vy = -s.vy
    }

    // 全消し → 次レベル
    if (s.bricks.every((b) => !b.alive)) {
      s.bricks = makeBricks()
      s.speed += 0.04
      const ball = freshBall(s.speed)
      s.bx = ball.bx
      s.by = ball.by
      s.vx = ball.vx
      s.vy = ball.vy
    }

    // ミス
    if (s.by - BALL_R > HEIGHT) {
      if (!overReported.current) {
        overReported.current = true
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
  }, !paused && alive)

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={surfaceRef} className="game-surface w-full max-w-sm touch-none">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="w-full rounded-xl"
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
        />
      </div>
      <p className="text-xs text-faint">ドラッグ / ←→ でパドルを操作</p>
    </div>
  )
}
