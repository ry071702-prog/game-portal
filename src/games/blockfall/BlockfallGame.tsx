import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameComponentProps } from '../../core/types'
import { useGameLoop } from '../../core/hooks/useGameLoop'
import { sound } from '../../core/lib/sound'
import {
  COLS,
  ROWS,
  PIECE_COLORS,
  dropInterval,
  dropY,
  getCells,
  hardDrop,
  initialState,
  tick,
  tryMove,
  tryRotate,
  type BlockfallState,
  type StepResult,
} from './logic'

const CELL = 24
const W = COLS * CELL
const H = ROWS * CELL
const NEXT_CELL = 14
const NEXT_SIZE = NEXT_CELL * 4

/** 1マス描画 (1px の隙間でタイル感を出す) */
function fillCell(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  ctx.fillStyle = color
  ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2)
}

export default function BlockfallGame({ paused, onScore, onGameOver }: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nextRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<BlockfallState>(initialState())
  const accRef = useRef(0)
  const reportedScore = useRef(0)
  const overReported = useRef(false)
  // 盤面は ref + canvas 駆動。ループ稼働可否とサイドパネル表示分だけ state に持つ
  const [alive, setAlive] = useState(true)
  const [stats, setStats] = useState({ level: 1, lines: 0 })

  const draw = useCallback(() => {
    const s = stateRef.current
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#0f1117'
      ctx.fillRect(0, 0, W, H)
      // 薄いグリッド線
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 1; x < COLS; x++) {
        ctx.moveTo(x * CELL + 0.5, 0)
        ctx.lineTo(x * CELL + 0.5, H)
      }
      for (let y = 1; y < ROWS; y++) {
        ctx.moveTo(0, y * CELL + 0.5)
        ctx.lineTo(W, y * CELL + 0.5)
      }
      ctx.stroke()
      // 固定済みブロック
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const t = s.board[y][x]
          if (t) fillCell(ctx, x, y, PIECE_COLORS[t])
        }
      }
      if (s.alive) {
        // ゴースト (接地位置の薄表示)
        const gy = dropY(s.board, s.current)
        ctx.globalAlpha = 0.22
        for (const c of getCells({ ...s.current, y: gy })) {
          if (c.y >= 0) fillCell(ctx, c.x, c.y, PIECE_COLORS[s.current.type])
        }
        ctx.globalAlpha = 1
        // 操作中ミノ
        for (const c of getCells(s.current)) {
          if (c.y >= 0) fillCell(ctx, c.x, c.y, PIECE_COLORS[s.current.type])
        }
      }
    }
    // NEXT プレビュー (形の実寸で中央寄せ)
    const nctx = nextRef.current?.getContext('2d')
    if (nctx) {
      nctx.fillStyle = '#0f1117'
      nctx.fillRect(0, 0, NEXT_SIZE, NEXT_SIZE)
      const cells = getCells({ type: s.next, rot: 0, x: 0, y: 0 })
      const xs = cells.map((c) => c.x)
      const ys = cells.map((c) => c.y)
      const ox =
        (NEXT_SIZE - (Math.max(...xs) - Math.min(...xs) + 1) * NEXT_CELL) / 2 -
        Math.min(...xs) * NEXT_CELL
      const oy =
        (NEXT_SIZE - (Math.max(...ys) - Math.min(...ys) + 1) * NEXT_CELL) / 2 -
        Math.min(...ys) * NEXT_CELL
      nctx.fillStyle = PIECE_COLORS[s.next]
      for (const c of cells) {
        nctx.fillRect(ox + c.x * NEXT_CELL + 1, oy + c.y * NEXT_CELL + 1, NEXT_CELL - 2, NEXT_CELL - 2)
      }
    }
  }, [])

  // 初回 + ポーズ切替時に現在状態を描画 (リスタートは key による再マウントで処理)
  useEffect(() => {
    draw()
  }, [paused, draw])

  /** tick/hardDrop の結果を反映し、効果音・スコア通知・ゲームオーバー処理を行う */
  const applyStep = useCallback(
    (result: StepResult) => {
      stateRef.current = result.state
      if (result.cleared > 0) sound.merge()
      if (result.locked) setStats({ level: result.state.level, lines: result.state.lines })
      if (result.state.score !== reportedScore.current) {
        reportedScore.current = result.state.score
        onScore(result.state.score)
      }
      if (!result.state.alive && !overReported.current) {
        overReported.current = true
        setAlive(false)
        onGameOver() // 終了音は GameShell に委譲 (二重再生回避)
      }
      draw()
    },
    [draw, onScore, onGameOver],
  )

  const moveBy = useCallback(
    (dx: number) => {
      const s = stateRef.current
      if (!s.alive) return
      const moved = tryMove(s.board, s.current, dx, 0)
      if (moved) {
        stateRef.current = { ...s, current: moved }
        draw()
      }
    },
    [draw],
  )

  const rotate = useCallback(() => {
    const s = stateRef.current
    if (!s.alive) return
    const rotated = tryRotate(s.board, s.current)
    if (rotated) {
      stateRef.current = { ...s, current: rotated }
      sound.move()
      draw()
    }
  }, [draw])

  const softDrop = useCallback(() => {
    if (!stateRef.current.alive) return
    accRef.current = 0 // 自然落下のタイマーをリセット
    applyStep(tick(stateRef.current))
  }, [applyStep])

  const doHardDrop = useCallback(() => {
    if (!stateRef.current.alive) return
    accRef.current = 0
    const result = hardDrop(stateRef.current)
    if (result.cleared === 0) sound.brick() // 消去時は merge 音に任せる
    applyStep(result)
  }, [applyStep])

  // キーボード操作: ←→ 移動 / ↑ X 回転 / ↓ ソフトドロップ / Space ハードドロップ
  useEffect(() => {
    if (paused || !alive) return
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          moveBy(-1)
          break
        case 'ArrowRight':
          moveBy(1)
          break
        case 'ArrowUp':
        case 'x':
        case 'X':
          rotate()
          break
        case 'ArrowDown':
          softDrop()
          break
        case ' ':
          if (!e.repeat) doHardDrop()
          break
        default:
          return
      }
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paused, alive, moveBy, rotate, softDrop, doHardDrop])

  // 自然落下。レベルに応じて間隔短縮
  useGameLoop((dt) => {
    accRef.current += dt
    const interval = dropInterval(stateRef.current.level)
    while (accRef.current >= interval) {
      accRef.current -= interval
      applyStep(tick(stateRef.current))
      if (!stateRef.current.alive) break
    }
  }, !paused && alive)

  const btn =
    'focus-ring flex h-14 w-14 items-center justify-center rounded-xl border border-line bg-surface-2 text-fg transition hover:border-cyan/50 active:bg-cyan/15'
  // レンダー中の ref アクセス警告を避けるため、ファクトリではなくイベント内で paused を判定する
  const press = (e: React.PointerEvent, fn: () => void) => {
    e.preventDefault()
    if (!paused) fn()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-start justify-center gap-4">
        <div className="game-surface w-full max-w-60">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full rounded-xl"
            style={{ aspectRatio: `${W} / ${H}` }}
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-muted">つぎ</span>
          <canvas
            ref={nextRef}
            width={NEXT_SIZE}
            height={NEXT_SIZE}
            className="rounded-lg border border-line"
          />
          <dl className="mt-1 text-center text-xs text-muted">
            <dt>レベル</dt>
            <dd className="font-bold text-fg">{stats.level}</dd>
            <dt className="mt-1">ライン</dt>
            <dd className="font-bold text-fg">{stats.lines}</dd>
          </dl>
        </div>
      </div>
      {/* スマホ向け操作ボタン */}
      <div className="flex gap-2 select-none sm:hidden">
        <button className={btn} onPointerDown={(e) => press(e, () => moveBy(-1))} aria-label="左へ移動">
          ◀
        </button>
        <button className={btn} onPointerDown={(e) => press(e, () => moveBy(1))} aria-label="右へ移動">
          ▶
        </button>
        <button className={`${btn} text-xs font-bold`} onPointerDown={(e) => press(e, rotate)} aria-label="回転">
          回転
        </button>
        <button className={btn} onPointerDown={(e) => press(e, softDrop)} aria-label="ソフトドロップ">
          ▼
        </button>
        <button className={btn} onPointerDown={(e) => press(e, doHardDrop)} aria-label="ハードドロップ">
          ⤓
        </button>
      </div>
    </div>
  )
}
