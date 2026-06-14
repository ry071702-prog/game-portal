import { describe, it, expect } from 'vitest'
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
  type Board,
} from './logic'

/** 周囲8マスの地雷数をテスト側で数え直す */
function recount(board: Board, r: number, c: number): number {
  let n = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const rr = r + dr
      const cc = c + dc
      if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE && board[rr][cc].mine) n++
    }
  }
  return n
}

function flatten(board: Board) {
  return board.flat()
}

describe('mines generateBoard', () => {
  it('地雷はちょうど MINES 個、全セル hidden で始まる', () => {
    const b = generateBoard(mulberry32(1))
    expect(flatten(b).filter((c) => c.mine).length).toBe(MINES)
    expect(flatten(b).every((c) => c.state === 'hidden')).toBe(true)
  })

  it('adjacent は周囲8マスの地雷数と一致する', () => {
    const b = generateBoard(mulberry32(42))
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!b[r][c].mine) expect(b[r][c].adjacent).toBe(recount(b, r, c))
      }
    }
  })

  it('同じ seed なら同じ盤面 (デイリーチャレンジ用)', () => {
    const a = generateBoard(mulberry32(123))
    const b = generateBoard(mulberry32(123))
    expect(a).toEqual(b)
  })
})

describe('mines reveal', () => {
  it('数字セルを開くとそのセルだけ開く', () => {
    const b = generateBoard(mulberry32(1))
    // adjacent > 0 の安全セルを探す
    let target: [number, number] | null = null
    outer: for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!b[r][c].mine && b[r][c].adjacent > 0) {
          target = [r, c]
          break outer
        }
      }
    }
    const { board: next, hitMine } = reveal(b, target![0], target![1])
    expect(hitMine).toBe(false)
    expect(countSafeRevealed(next)).toBe(1)
  })

  it('0 のセルを開くと周囲が連鎖開放される', () => {
    const b = generateBoard(mulberry32(1))
    let zero: [number, number] | null = null
    outer: for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!b[r][c].mine && b[r][c].adjacent === 0) {
          zero = [r, c]
          break outer
        }
      }
    }
    expect(zero).not.toBeNull()
    const { board: next } = reveal(b, zero![0], zero![1])
    expect(countSafeRevealed(next)).toBeGreaterThan(1)
    // 開いたのは安全セルのみ
    expect(flatten(next).some((c) => c.mine && c.state === 'revealed')).toBe(false)
  })

  it('地雷を開くと hitMine: true', () => {
    const b = generateBoard(mulberry32(1))
    let mine: [number, number] | null = null
    outer: for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (b[r][c].mine) {
          mine = [r, c]
          break outer
        }
      }
    }
    const { hitMine } = reveal(b, mine![0], mine![1])
    expect(hitMine).toBe(true)
  })

  it('旗付きセルは開かない', () => {
    const b = toggleFlag(generateBoard(mulberry32(1)), 0, 0)
    const { board: next, hitMine } = reveal(b, 0, 0)
    expect(hitMine).toBe(false)
    expect(next[0][0].state).toBe('flagged')
  })
})

describe('mines flag / win', () => {
  it('toggleFlag は旗を付け外しでき、countFlags に反映される', () => {
    let b = generateBoard(mulberry32(1))
    b = toggleFlag(b, 3, 4)
    expect(b[3][4].state).toBe('flagged')
    expect(countFlags(b)).toBe(1)
    b = toggleFlag(b, 3, 4)
    expect(b[3][4].state).toBe('hidden')
    expect(countFlags(b)).toBe(0)
  })

  it('revealAllMines で全地雷が開く', () => {
    const b = revealAllMines(generateBoard(mulberry32(1)))
    expect(flatten(b).filter((c) => c.mine && c.state === 'revealed').length).toBe(MINES)
  })

  it('全安全セルを開くと isWin が true になる', () => {
    let b = generateBoard(mulberry32(1))
    expect(isWin(b)).toBe(false)
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!b[r][c].mine) b = reveal(b, r, c).board
      }
    }
    expect(isWin(b)).toBe(true)
    expect(countSafeRevealed(b)).toBe(SIZE * SIZE - MINES)
  })
})
