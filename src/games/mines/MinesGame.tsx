import { useMemo, useState } from 'react'
import type { GameComponentProps } from '../../core/types'
import { sound } from '../../core/lib/sound'
import { mulberry32 } from '../../core/lib/daily'
import {
  generateBoard,
  reveal,
  toggleFlag,
  revealAllMines,
  countSafeRevealed,
  countFlags,
  isWin,
  SIZE,
  MINES,
  WIN_BONUS,
  type Board,
} from './logic'
import { EmojiArt } from '../../core/ui/EmojiArt'

/** 周囲地雷数 (1〜8) ごとの文字色 */
const NUMBER_COLORS = [
  '',
  'text-cyan',
  'text-emerald-400',
  'text-rose-400',
  'text-violet-400',
  'text-amber-400',
  'text-pink',
  'text-yellow',
  'text-fg',
]

export default function MinesGame({ paused, onScore, onGameOver, seed }: GameComponentProps) {
  const rng = useMemo(() => (seed != null ? mulberry32(seed) : Math.random), [seed])
  const [board, setBoard] = useState<Board>(() => generateBoard(rng))
  const [flagMode, setFlagMode] = useState(false)
  // 踏んだ地雷の位置 (爆発マスの強調表示用)。null 以外なら終了
  const [exploded, setExploded] = useState<[number, number] | null>(null)
  const [done, setDone] = useState(false)

  const opened = countSafeRevealed(board)
  const flags = countFlags(board)

  const flag = (r: number, c: number) => {
    if (paused || done) return
    if (board[r][c].state === 'revealed') return
    sound.toggle()
    setBoard(toggleFlag(board, r, c))
  }

  const open = (r: number, c: number) => {
    if (paused || done) return
    if (board[r][c].state !== 'hidden') return
    const { board: next, hitMine } = reveal(board, r, c)
    if (hitMine) {
      // 全地雷を表示してゲームオーバー (効果音は Shell 側)
      setBoard(revealAllMines(next))
      setExploded([r, c])
      setDone(true)
      onGameOver()
      return
    }
    sound.click()
    setBoard(next)
    const count = countSafeRevealed(next)
    if (isWin(next)) {
      setDone(true)
      onScore(count + WIN_BONUS)
      onGameOver('win')
    } else {
      onScore(count)
    }
  }

  // 旗モード中はタップ=旗の切替 (長押し不要のモバイル対応)
  const tap = (r: number, c: number) => (flagMode ? flag(r, c) : open(r, c))

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-sm items-center justify-between text-sm text-muted">
        <span className="flex items-center gap-1">
          <EmojiArt emoji="💣" className="h-4 w-4 object-contain" fallbackClassName="" /> 残り{' '}
          <span className="font-display text-fg">{MINES - flags}</span>
        </span>
        <button
          onClick={() => setFlagMode((f) => !f)}
          disabled={paused || done}
          aria-pressed={flagMode}
          className={`rounded-lg px-3 py-1 text-sm font-bold transition ${
            flagMode ? 'bg-yellow text-bg-base' : 'bg-surface-2 text-muted hover:bg-surface'
          }`}
        >
          <span className="inline-flex items-center gap-1">
            <EmojiArt emoji="🚩" className="h-4 w-4 object-contain" fallbackClassName="" /> 旗モード
            {flagMode ? ' ON' : ''}
          </span>
        </button>
        <span>
          開放 <span className="font-display text-fg">{opened}</span>/{SIZE * SIZE - MINES}
        </span>
      </div>
      <div className="game-surface grid w-full max-w-sm grid-cols-9 gap-1">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const shown = cell.state === 'revealed'
            const isExploded = exploded != null && exploded[0] === r && exploded[1] === c
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => tap(r, c)}
                onContextMenu={(e) => {
                  e.preventDefault() // PC: 右クリックで旗
                  flag(r, c)
                }}
                disabled={paused || done || shown}
                aria-label={`マス ${r}-${c}`}
                className={`flex aspect-square items-center justify-center rounded text-xs font-bold sm:text-sm ${
                  shown
                    ? cell.mine
                      ? isExploded
                        ? 'bg-rose-500/50'
                        : 'bg-rose-500/20'
                      : `bg-surface ${NUMBER_COLORS[cell.adjacent]}`
                    : 'bg-surface-2 transition-colors hover:bg-surface'
                }`}
              >
                {shown
                  ? cell.mine
                    ? <EmojiArt emoji="💣" className="h-full w-full object-contain p-px" fallbackClassName="" />

                    : cell.adjacent > 0
                      ? cell.adjacent
                      : ''
                  : cell.state === 'flagged'
                    ? <EmojiArt emoji="🚩" className="h-full w-full object-contain p-px" fallbackClassName="" />

                    : ''}
              </button>
            )
          }),
        )}
      </div>
      <p className="text-xs text-faint">数字は周囲8マスの地雷数。地雷以外を全部開けばクリア</p>
    </div>
  )
}
