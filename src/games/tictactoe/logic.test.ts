import { describe, it, expect } from 'vitest'
import {
  emptyBoard,
  winningLine,
  isFull,
  legalMoves,
  bestMove,
  chooseAiMove,
  optimalProbability,
  type Board,
  type Cell,
} from './logic'

/** 'OX.' 形式の文字列から盤面を作る ('.' = 空き) */
const b = (s: string): Board => s.split('').map((ch): Cell => (ch === '.' ? null : (ch as 'O' | 'X')))

describe('winningLine', () => {
  it('空盤面は null', () => {
    expect(winningLine(emptyBoard())).toBeNull()
  })

  it('横一列で勝者とラインを返す', () => {
    const win = winningLine(b('OOOXX....'))
    expect(win?.mark).toBe('O')
    expect(win?.line).toEqual([0, 1, 2])
  })

  it('縦一列を検出する', () => {
    const win = winningLine(b('X.OX.OX..'))
    expect(win?.mark).toBe('X')
    expect(win?.line).toEqual([0, 3, 6])
  })

  it('斜めを検出する', () => {
    const win = winningLine(b('O.X.OX..O'))
    expect(win?.mark).toBe('O')
    expect(win?.line).toEqual([0, 4, 8])
  })

  it('引き分け盤面は null (isFull は true)', () => {
    const board = b('OXOXXOXOX') // 三目が揃わない満杯盤面
    expect(winningLine(board)).toBeNull()
    expect(isFull(board)).toBe(true)
  })
})

describe('legalMoves', () => {
  it('空きマスのインデックスを返す', () => {
    expect(legalMoves(b('O.X.O....'))).toEqual([1, 3, 5, 6, 7, 8])
    expect(legalMoves(emptyBoard())).toHaveLength(9)
  })
})

describe('bestMove (minimax)', () => {
  it('自分のリーチがあれば勝ちを取る', () => {
    // X が 0,1 でリーチ → 2 を打てば勝ち
    expect(bestMove(b('XX.OO....'), 'X')).toBe(2)
  })

  it('相手のリーチを止める', () => {
    // O が 0,1 でリーチ → X は 2 をブロックするしかない
    expect(bestMove(b('OO..X....'), 'X')).toBe(2)
  })

  it('勝ちとブロックが両方あるなら勝ちを優先する', () => {
    // X は 5 で勝てる (3,4 のリーチ)。O のリーチ (0,1) を止めるより勝ちを取る
    expect(bestMove(b('OO.XX..O.'), 'X')).toBe(5)
  })

  it('合法手がなければ -1', () => {
    expect(bestMove(b('OXOXXOXOX'), 'X')).toBe(-1)
  })
})

describe('chooseAiMove', () => {
  it('p=1 なら常に最適手 (= bestMove と一致)', () => {
    const board = b('OO..X....')
    expect(chooseAiMove(board, 'X', 1, () => 0)).toBe(bestMove(board, 'X'))
  })

  it('p=0 なら rng でランダム合法手を選ぶ', () => {
    const board = b('OO..X....')
    // 1回目: p 判定 (0.9 >= 0 → 外れ)、2回目: 合法手 [2,3,5,6,7,8] から index 0 を選択
    const seq = [0.9, 0]
    let i = 0
    const rng = () => seq[i++]
    expect(chooseAiMove(board, 'X', 0, rng)).toBe(2)
  })

  it('ランダム時も埋まったマスは選ばない', () => {
    const board = b('OXOXO.X..')
    for (const r of [0, 0.3, 0.6, 0.99]) {
      const seq = [0.9, r]
      let i = 0
      const move = chooseAiMove(board, 'X', 0, () => seq[i++])
      expect(board[move]).toBeNull()
    }
  })

  it('盤面が満杯なら -1', () => {
    expect(chooseAiMove(b('OXOXXOXOX'), 'X', 1, () => 0)).toBe(-1)
  })
})

describe('optimalProbability', () => {
  it('ラウンドが進むほど上がる', () => {
    expect(optimalProbability(1)).toBeCloseTo(0.65)
    expect(optimalProbability(3)).toBeCloseTo(0.85)
  })

  it('0.95 で頭打ち', () => {
    expect(optimalProbability(4)).toBeCloseTo(0.95)
    expect(optimalProbability(10)).toBe(0.95)
  })
})
