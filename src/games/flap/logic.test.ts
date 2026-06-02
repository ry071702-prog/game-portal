import { describe, it, expect } from 'vitest'
import { makePipe, hitsPipe, H, GAP, BIRD_X, PIPE_W } from './logic'

describe('flap logic', () => {
  it('makePipe の隙間は画面内に収まる', () => {
    for (const r of [0, 0.5, 1]) {
      const p = makePipe(100, () => r)
      expect(p.gapY).toBeGreaterThanOrEqual(0)
      expect(p.gapY + GAP).toBeLessThanOrEqual(H)
    }
  })

  it('隙間の中なら衝突しない / 外なら衝突する', () => {
    const p = makePipe(BIRD_X, () => 0.5) // 鳥のX上にパイプ
    const center = p.gapY + GAP / 2
    expect(hitsPipe(center, p)).toBe(false)
    expect(hitsPipe(p.gapY - 20, p)).toBe(true)
  })

  it('X が離れていれば衝突しない', () => {
    const p = makePipe(BIRD_X + PIPE_W + 50, () => 0.5)
    expect(hitsPipe(0, p)).toBe(false)
  })
})
