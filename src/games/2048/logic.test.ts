import { describe, it, expect } from 'vitest'
import { move, spawn, isGameOver, emptyBoard, type Board } from './logic'

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
