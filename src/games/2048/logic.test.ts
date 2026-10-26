import { describe, it, expect } from 'vitest'
import { move, spawn, isGameOver, emptyBoard, initialBoard, type Board } from './logic'

describe('2048 move', () => {
  it('左に寄せて同値を合体する', () => {
    const board: Board = [
      [2, 2, 0, 0],
      [4, 0, 4, 0],
      [0, 0, 0, 0],
      [8, 8, 8, 8],
    ]
    const { board: out, gained, moved } = move(board, 'left')
    expect(out[0]).toEqual([4, 0, 0, 0])
    expect(out[1]).toEqual([8, 0, 0, 0])
    expect(out[3]).toEqual([16, 16, 0, 0])
    expect(gained).toBe(4 + 8 + 16 + 16)
    expect(moved).toBe(true)
  })

  it('3連続は1回だけ合体する (2,2,2 -> 4,2)', () => {
    const board: Board = [
      [2, 2, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(move(board, 'left').board[0]).toEqual([4, 2, 0, 0])
  })

  it('右移動', () => {
    const board: Board = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(move(board, 'right').board[0]).toEqual([0, 0, 0, 4])
  })

  it('上移動', () => {
    const board: Board = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(move(board, 'up').board.map((r) => r[0])).toEqual([4, 0, 0, 0])
  })

  it('下移動は下側から合体する (2,2,2 -> _,_,2,4)', () => {
    const board: Board = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const { board: out, gained } = move(board, 'down')
    expect(out.map((r) => r[0])).toEqual([0, 0, 2, 4])
    expect(gained).toBe(4)
  })

  it('右移動も右側から合体する (2,2,2 -> _,_,2,4)', () => {
    const board: Board = [
      [2, 2, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(move(board, 'right').board[0]).toEqual([0, 0, 2, 4])
  })

  it('move は元の盤面を変更しない (純粋関数)', () => {
    const board: Board = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const snapshot = board.map((r) => [...r])
    for (const dir of ['left', 'right', 'up', 'down'] as const) move(board, dir)
    expect(board).toEqual(snapshot)
  })

  it('動かないときは moved=false', () => {
    const board: Board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]
    expect(move(board, 'left').moved).toBe(false)
  })
})

describe('spawn', () => {
  it('空きマスに値を1つ置く (rng 注入で決定論的)', () => {
    const board = emptyBoard()
    const out = spawn(board, () => 0) // 最初の空きマス, 値=2
    expect(out[0][0]).toBe(2)
    const filled = out.flat().filter((v) => v !== 0)
    expect(filled).toHaveLength(1)
  })

  it('rng >= 0.9 なら 4 を置く', () => {
    const values = [0, 0.95]
    const out = spawn(emptyBoard(), () => values.shift()!)
    expect(out[0][0]).toBe(4)
  })

  it('空きが無ければ同じ盤面を返す', () => {
    const full: Board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]
    expect(spawn(full, () => 0)).toBe(full)
  })

  it('元の盤面を変更しない', () => {
    const board = emptyBoard()
    spawn(board, () => 0)
    expect(board.flat().every((v) => v === 0)).toBe(true)
  })
})

describe('initialBoard', () => {
  it('タイルがちょうど2枚置かれる', () => {
    const board = initialBoard(() => 0.5)
    expect(board.flat().filter((v) => v !== 0)).toHaveLength(2)
  })
})

describe('isGameOver', () => {
  it('合体可能な手があれば false', () => {
    const board: Board = [
      [2, 2, 4, 8],
      [4, 8, 16, 32],
      [2, 4, 8, 16],
      [4, 8, 16, 32],
    ]
    expect(isGameOver(board)).toBe(false)
  })

  it('縦に合体できるだけでも false', () => {
    const board: Board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [2, 8, 16, 32],
    ]
    expect(isGameOver(board)).toBe(false)
  })

  it('空きマスがあれば false', () => {
    const board: Board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 0, 4],
      [4, 2, 4, 2],
    ]
    expect(isGameOver(board)).toBe(false)
  })

  it('埋まっていて合体不可なら true', () => {
    const board: Board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]
    expect(isGameOver(board)).toBe(true)
  })
})
