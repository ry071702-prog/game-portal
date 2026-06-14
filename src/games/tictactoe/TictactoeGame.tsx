import { useEffect, useState } from 'react'
import type { GameComponentProps } from '../../core/types'
import { sound } from '../../core/lib/sound'
import {
  emptyBoard,
  winningLine,
  isFull,
  chooseAiMove,
  optimalProbability,
  PLAYER,
  AI,
  WIN_POINTS,
  DRAW_POINTS,
  type Board,
} from './logic'

type Phase = 'player' | 'ai' | 'won' | 'draw' | 'lost'

const STATUS: Record<Phase, string> = {
  player: 'あなたの番 (○)',
  ai: 'AI 思考中…',
  won: `勝ち！ +${WIN_POINTS}`,
  draw: `引き分け +${DRAW_POINTS}`,
  lost: '負け…',
}

export default function TictactoeGame({ paused, onScore, onGameOver }: GameComponentProps) {
  const [board, setBoard] = useState<Board>(emptyBoard)
  const [round, setRound] = useState(1)
  const [wins, setWins] = useState(0)
  const [score, setScore] = useState(0)
  const [phase, setPhase] = useState<Phase>('player')
  const [winLine, setWinLine] = useState<readonly number[] | null>(null)

  useEffect(() => onScore(score), [score, onScore])

  // AI の手番: 400ms の思考遅延後に着手。paused 中はタイマーを張らず、再開時に改めて打つ
  useEffect(() => {
    if (phase !== 'ai' || paused) return
    const t = setTimeout(() => {
      const move = chooseAiMove(board, AI, optimalProbability(round))
      if (move < 0) return
      const next = [...board]
      next[move] = AI
      sound.click()
      setBoard(next)
      const win = winningLine(next)
      if (win) {
        // 負け → 連勝チャレンジ終了
        setWinLine(win.line)
        setPhase('lost')
        onGameOver() // 終了音は GameShell に委譲 (二重再生回避)
      } else if (isFull(next)) {
        setScore((s) => s + DRAW_POINTS)
        setPhase('draw')
        sound.match()
      } else {
        setPhase('player')
      }
    }, 400)
    return () => clearTimeout(t)
  }, [phase, paused, board, round, onGameOver])

  // ラウンド決着 (勝ち/引き分け) の1秒後に自動で次ラウンドへ
  useEffect(() => {
    if ((phase !== 'won' && phase !== 'draw') || paused) return
    const t = setTimeout(() => {
      setBoard(emptyBoard())
      setWinLine(null)
      setRound((r) => r + 1)
      setPhase('player')
    }, 1000)
    return () => clearTimeout(t)
  }, [phase, paused])

  const place = (i: number) => {
    if (paused || phase !== 'player' || board[i] !== null) return
    const next = [...board]
    next[i] = PLAYER
    sound.move()
    setBoard(next)
    const win = winningLine(next)
    if (win) {
      setWinLine(win.line)
      setScore((s) => s + WIN_POINTS)
      setWins((w) => w + 1)
      setPhase('won')
      sound.win()
    } else if (isFull(next)) {
      setScore((s) => s + DRAW_POINTS)
      setPhase('draw')
      sound.match()
    } else {
      setPhase('ai')
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-muted">
        ラウンド <span className="font-display text-fg">{round}</span> / 連勝{' '}
        <span className="font-display text-fg">{wins}</span> — {STATUS[phase]}
      </p>
      <div className="grid w-full max-w-xs grid-cols-3 gap-2">
        {board.map((cell, i) => {
          const inLine = winLine?.includes(i) ?? false
          return (
            <button
              key={i}
              onClick={() => place(i)}
              disabled={paused || phase !== 'player' || cell !== null}
              aria-label={`マス ${i}${cell ? ` (${cell === PLAYER ? '○' : '×'})` : ''}`}
              className={`aspect-square rounded-lg text-4xl font-display transition-colors ${
                inLine
                  ? phase === 'lost'
                    ? 'bg-rose-500/25 ring-1 ring-rose-500/40'
                    : 'bg-emerald-500/25 ring-1 ring-emerald-500/40'
                  : 'bg-surface-2 hover:bg-surface'
              }`}
            >
              {cell === PLAYER ? (
                <span className="text-cyan">○</span>
              ) : cell === AI ? (
                <span className="text-pink">×</span>
              ) : null}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-faint">3つ並べて勝ち。ラウンドが進むほど AI が強くなる</p>
    </div>
  )
}
