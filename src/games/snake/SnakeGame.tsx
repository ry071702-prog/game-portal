import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameComponentProps } from '../../core/types'
import type { Direction } from '../../core/lib/direction'
import { useGameLoop } from '../../core/hooks/useGameLoop'
import { useKeyDirection } from '../../core/hooks/useKeyDirection'
import { useSwipe } from '../../core/hooks/useSwipe'
import { DPad } from '../../core/ui/DPad'
import { sound } from '../../core/lib/sound'
import { GRID, initialState, step, type SnakeState } from './logic'

const CELL = 20
const CANVAS = GRID * CELL

/** スコアに応じてステップ間隔 (ms) を短縮 = 加速 */
function intervalFor(score: number): number {
  return Math.max(70, 160 - score * 4)
}

export default function SnakeGame({ paused, onScore, onGameOver }: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<SnakeState>(initialState())
  const accRef = useRef(0)
  const pendingDir = useRef<Direction>('right')
  const reportedScore = useRef(0)
  const gameOverReported = useRef(false)
  // 描画は ref 駆動。alive だけはループの稼働可否に使うため state で持つ
  const [alive, setAlive] = useState(true)

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { snake, food } = stateRef.current
    ctx.fillStyle = '#0f1117'
    ctx.fillRect(0, 0, CANVAS, CANVAS)
    // 食べ物
    ctx.fillStyle = '#f43f5e'
    ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4)
    // 蛇
    snake.forEach((c, i) => {
      ctx.fillStyle = i === 0 ? '#22d3ee' : '#06b6d4'
      ctx.fillRect(c.x * CELL + 1, c.y * CELL + 1, CELL - 2, CELL - 2)
    })
  }, [])

  // 初回 + ポーズ切替時に現在状態を描画 (リスタートは key による再マウントで処理)
  useEffect(() => {
    draw()
  }, [paused, draw])

  const setDir = (dir: Direction) => {
    pendingDir.current = dir
  }
  useKeyDirection(setDir, !paused)
  useSwipe(surfaceRef, setDir, !paused)

  const running = !paused && alive
  useGameLoop((dt) => {
    accRef.current += dt
    const interval = intervalFor(stateRef.current.score)
    let changed = false
    while (accRef.current >= interval) {
      accRef.current -= interval
      stateRef.current = step(stateRef.current, pendingDir.current)
      changed = true
      if (!stateRef.current.alive) break
    }
    if (changed) {
      draw()
      if (stateRef.current.score !== reportedScore.current) {
        reportedScore.current = stateRef.current.score
        sound.eat()
        onScore(stateRef.current.score)
      }
      if (!stateRef.current.alive && !gameOverReported.current) {
        gameOverReported.current = true
        setAlive(false)
        onGameOver()
      }
    }
  }, running)

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={surfaceRef} className="game-surface w-full max-w-sm">
        <canvas
          ref={canvasRef}
          width={CANVAS}
          height={CANVAS}
          className="aspect-square w-full rounded-xl"
        />
      </div>
      <div className="sm:hidden">
        <DPad onDirection={setDir} />
      </div>
    </div>
  )
}
