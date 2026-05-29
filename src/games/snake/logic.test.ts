import { describe, it, expect } from 'vitest'
import { step, initialState, GRID, type SnakeState } from './logic'

const farFood = { x: GRID - 1, y: GRID - 1 } // 邪魔にならない位置

describe('snake step', () => {
  it('前進すると頭が進み長さは保たれる', () => {
    const s = initialState(() => 0)
    const next = step(s, 'right', () => 0)
    expect(next.snake[0]).toEqual({ x: s.snake[0].x + 1, y: s.snake[0].y })
    expect(next.snake.length).toBe(s.snake.length)
  })

  it('逆走は無視される', () => {
    const s = initialState(() => 0) // dir=right
    const next = step(s, 'left', () => 0)
    expect(next.dir).toBe('right')
  })

  it('壁にぶつかると alive=false', () => {
    let s: SnakeState = {
      snake: [{ x: GRID - 1, y: 0 }],
      food: farFood,
      dir: 'right',
      alive: true,
      score: 0,
    }
    s = step(s, 'right', () => 0)
    expect(s.alive).toBe(false)
  })

  it('食べ物を食べると成長しスコアが増える', () => {
    const s: SnakeState = {
      snake: [{ x: 5, y: 5 }],
      food: { x: 6, y: 5 },
      dir: 'right',
      alive: true,
      score: 0,
    }
    const next = step(s, 'right', () => 0)
    expect(next.score).toBe(1)
    expect(next.snake.length).toBe(2)
  })

  it('自分の体 (末尾以外) にぶつかると alive=false', () => {
    const s: SnakeState = {
      snake: [
        { x: 2, y: 2 },
        { x: 2, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 2 }, // ← ここに頭が突っ込む (末尾ではない)
        { x: 1, y: 3 },
      ],
      food: farFood,
      dir: 'down',
      alive: true,
      score: 0,
    }
    // 左に曲がると頭が (1,2) = 体の途中に衝突
    const next = step(s, 'left', () => 0)
    expect(next.alive).toBe(false)
  })

  it('動いて空く末尾マスへは進入できる', () => {
    const s: SnakeState = {
      snake: [
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 1, y: 2 },
        { x: 1, y: 1 }, // 末尾。ここへ頭が動くのは許可
      ],
      food: farFood,
      dir: 'up',
      alive: true,
      score: 0,
    }
    const next = step(s, 'left', () => 0) // 頭 (2,1)→(1,1) = 末尾跡地
    expect(next.alive).toBe(true)
  })
})
