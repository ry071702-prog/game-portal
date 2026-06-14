export const SIZE = 9
export const MINES = 10
/** 全安全セル開放時のボーナス点 */
export const WIN_BONUS = 30

export type CellState = 'hidden' | 'revealed' | 'flagged'

export interface Cell {
  mine: boolean
  /** 周囲8マスの地雷数 */
  adjacent: number
  state: CellState
}

export type Board = Cell[][]

/** 周囲8方向 */
const NEIGHBORS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
] as const

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE
}

/** 9x9 に地雷を MINES 個配置した盤面を生成 (rng 注入で seed 対応・テスト可)。 */
export function generateBoard(rng: () => number = Math.random): Board {
  // 全マスの index をシャッフルし、先頭 MINES 個を地雷にする
  const indices = Array.from({ length: SIZE * SIZE }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  const mines = new Set(indices.slice(0, MINES))
  const board: Board = Array.from({ length: SIZE }, (_, r) =>
    Array.from({ length: SIZE }, (_, c) => ({
      mine: mines.has(r * SIZE + c),
      adjacent: 0,
      state: 'hidden' as CellState,
    })),
  )
  // 各安全セルの周囲地雷数を数える
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c].mine) continue
      let n = 0
      for (const [dr, dc] of NEIGHBORS) {
        if (inBounds(r + dr, c + dc) && board[r + dr][c + dc].mine) n++
      }
      board[r][c].adjacent = n
    }
  }
  return board
}

/**
 * (r,c) を開いた新しい盤面を返す (純粋関数)。
 * 0 のマスは周囲を連鎖開放 (flood fill)。旗付き・開放済みは何もしない。
 * 地雷を開いた場合は hitMine: true (全地雷表示は呼び出し側で revealAllMines)。
 */
export function reveal(board: Board, r: number, c: number): { board: Board; hitMine: boolean } {
  if (board[r][c].state !== 'hidden') return { board, hitMine: false }
  const next = board.map((row) => row.map((cell) => ({ ...cell })))
  if (next[r][c].mine) {
    next[r][c].state = 'revealed'
    return { board: next, hitMine: true }
  }
  const stack: Array<[number, number]> = [[r, c]]
  while (stack.length > 0) {
    const [rr, cc] = stack.pop()!
    const cur = next[rr][cc]
    if (cur.state === 'revealed') continue
    cur.state = 'revealed'
    if (cur.adjacent !== 0) continue
    // 0 なら周囲の未開放セルへ波及 (旗付きは開けない)
    for (const [dr, dc] of NEIGHBORS) {
      const nr = rr + dr
      const nc = cc + dc
      if (inBounds(nr, nc) && next[nr][nc].state === 'hidden' && !next[nr][nc].mine) {
        stack.push([nr, nc])
      }
    }
  }
  return { board: next, hitMine: false }
}

/** 旗の付け外し。開放済みセルは変更しない (純粋関数)。 */
export function toggleFlag(board: Board, r: number, c: number): Board {
  if (board[r][c].state === 'revealed') return board
  return board.map((row, rr) =>
    row.map((cell, cc) =>
      rr === r && cc === c
        ? { ...cell, state: cell.state === 'flagged' ? ('hidden' as CellState) : ('flagged' as CellState) }
        : cell,
    ),
  )
}

/** 地雷を踏んだとき用: 全地雷を開いた盤面を返す。 */
export function revealAllMines(board: Board): Board {
  return board.map((row) =>
    row.map((cell) => (cell.mine ? { ...cell, state: 'revealed' as CellState } : cell)),
  )
}

/** 開放済みの安全セル数 (スコアの元)。 */
export function countSafeRevealed(board: Board): number {
  let n = 0
  for (const row of board) {
    for (const cell of row) {
      if (!cell.mine && cell.state === 'revealed') n++
    }
  }
  return n
}

/** 立てた旗の数 (残り地雷数表示用)。 */
export function countFlags(board: Board): number {
  let n = 0
  for (const row of board) {
    for (const cell of row) {
      if (cell.state === 'flagged') n++
    }
  }
  return n
}

/** 勝利判定: 地雷以外をすべて開いたら勝ち。 */
export function isWin(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell.mine || cell.state === 'revealed'))
}
