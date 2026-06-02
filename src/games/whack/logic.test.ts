import { describe, it, expect } from 'vitest'
import { randomHole, HOLES } from './logic'

describe('whack', () => {
  it('0..HOLES-1 の範囲を返す', () => {
    for (const r of [0, 0.3, 0.6, 0.99]) {
      const h = randomHole(() => r)
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThan(HOLES)
    }
  })

  it('exclude と同じ穴は避ける', () => {
    // rng=0 なら hole=0。exclude=0 を渡すと 1 になる
    expect(randomHole(() => 0, 0)).toBe(1)
  })
})
