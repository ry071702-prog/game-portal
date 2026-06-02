import { describe, it, expect } from 'vitest'
import { makeBricks, intersects, ballRect, COLS, ROWS, WIDTH } from './logic'

describe('breakout logic', () => {
  it('makeBricks は COLS*ROWS 個を全て alive で生成', () => {
    const b = makeBricks()
    expect(b).toHaveLength(COLS * ROWS)
    expect(b.every((x) => x.alive)).toBe(true)
  })

  it('ブロックは画面幅に収まる', () => {
    for (const br of makeBricks()) {
      expect(br.x).toBeGreaterThanOrEqual(0)
      expect(br.x + br.w).toBeLessThanOrEqual(WIDTH)
    }
  })

  it('intersects: 重なり/非重なりを判定', () => {
    const a = { x: 0, y: 0, w: 10, h: 10 }
    expect(intersects(a, { x: 5, y: 5, w: 10, h: 10 })).toBe(true)
    expect(intersects(a, { x: 20, y: 20, w: 5, h: 5 })).toBe(false)
  })

  it('ballRect は中心と半径から境界ボックスを返す', () => {
    expect(ballRect(10, 10, 4)).toEqual({ x: 6, y: 6, w: 8, h: 8 })
  })
})
