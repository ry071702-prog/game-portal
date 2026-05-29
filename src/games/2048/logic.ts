import type { Direction } from '../../core/lib/direction'

export const SIZE = 4
export type Board = number[][]

export interface MoveResult {
  board: Board
  /** この手で合体して得たスコア */
  gained: number
  /** 盤面が動いたか (動かなければ spawn しない) */
  moved: boolean
}

export function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array<number>(SIZE).fill(0))
}

function clone(board: Board): Board {
  return board.map((row) => [...row])
}

function transpose(board: Board): Board {
  return board[0].map((_, c) => board.map((row) => row[c]))
}

function reverseRows(board: Board): Board {
  return board.map((row) => [...row].reverse())
}

/** 1行を左に寄せて合体する。戻り値は長さ SIZE に揃えた行と得点。 */
function slideRowLeft(row: number[]): { row: number[]; gained: number } {
  const nums = row.filter((n) => n !== 0)
  const out: number[] = []
  let gained = 0
  for (let i = 0; i < nums.length; i++) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      const merged = nums[i] * 2
      out.push(merged)
      gained += merged
      i++ // 合体した分スキップ
    } else {
      out.push(nums[i])
    }
  }
  while (out.length < SIZE) out.push(0)
  return { row: out, gained }
}

function equals(a: Board, b: Board): boolean {
  return a.every((row, r) => row.every((v, c) => v === b[r][c]))
}

/** 方向を「左寄せ」に正規化するための前後変換 */
function toLeft(board: Board, dir: Direction): Board {
  switch (dir) {
    case 'left':
      return clone(board)
    case 'right':
      return reverseRows(board)
    case 'up':
      return transpose(board)
    case 'down':
      return reverseRows(transpose(board))
  }
}

function fromLeft(board: Board, dir: Direction): Board {
  switch (dir) {
    case 'left':
      return board
    case 'right':
      return reverseRows(board)
    case 'up':
      return transpose(board)
    case 'down':
      return transpose(reverseRows(board))
  }
}

/** 指定方向に1手動かす (純粋関数)。 */
export function move(board: Board, dir: Direction): MoveResult {
  const normalized = toLeft(board, dir)
  let gained = 0
  const slid = normalized.map((row) => {
    const r = slideRowLeft(row)
    gained += r.gained
    return r.row
  })
  const result = fromLeft(slid, dir)
  return { board: result, gained, moved: !equals(board, result) }
}

/** 空きマスに新しいタイル (90% で 2, 10% で 4) を1つ置く。rng はテスト用に注入可。 */
export function spawn(board: Board, rng: () => number = Math.random): Board {
  const empties: Array<[number, number]> = []
  board.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v === 0) empties.push([r, c])
    }),
  )
  if (empties.length === 0) return board
  const [r, c] = empties[Math.floor(rng() * empties.length)]
  const next = clone(board)
  next[r][c] = rng() < 0.9 ? 2 : 4
  return next
}

/** 動かせる手が一つも無ければゲームオーバー。 */
export function isGameOver(board: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return false
      if (c + 1 < SIZE && board[r][c] === board[r][c + 1]) return false
      if (r + 1 < SIZE && board[r][c] === board[r + 1][c]) return false
    }
  }
  return true
}

/** 開始盤面: 空盤にタイルを2つ置く。 */
export function initialBoard(rng: () => number = Math.random): Board {
  return spawn(spawn(emptyBoard(), rng), rng)
}
