import { describe, it, expect } from 'vitest'
import { mulberry32 } from '../../core/lib/daily'
import { spawnTarget, difficultyAt, shrinkRatio, hitScore, applyMiss } from './logic'

describe('aim', () => {
  it('spawnTarget は初期半径ごと領域内に収まる', () => {
    for (const r of [0, 0.5, 0.999]) {
      const t = spawnTarget(0, () => r)
      expect(t.x).toBeGreaterThanOrEqual(t.radius)
      expect(t.x).toBeLessThanOrEqual(1 - t.radius)
      expect(t.y).toBeGreaterThanOrEqual(t.radius)
      expect(t.y).toBeLessThanOrEqual(1 - t.radius)
    }
  })

  it('同じ seed なら同じ出現列', () => {
    const gen = (seed: number) => {
      const rng = mulberry32(seed)
      return Array.from({ length: 5 }, (_, i) => spawnTarget(i, rng))
    }
    expect(gen(42)).toEqual(gen(42))
    expect(gen(42)).not.toEqual(gen(43))
  })

  it('難易度は進むほど小さく・速く消え、下限で一定', () => {
    const a = difficultyAt(0)
    const b = difficultyAt(10)
    expect(b.radius).toBeLessThan(a.radius)
    expect(b.lifetimeMs).toBeLessThan(a.lifetimeMs)
    expect(difficultyAt(20)).toEqual(difficultyAt(100))
  })

  it('shrinkRatio は線形に縮み寿命で 0 (負にならない)', () => {
    expect(shrinkRatio(0, 2000)).toBe(1)
    expect(shrinkRatio(1000, 2000)).toBe(0.5)
    expect(shrinkRatio(2500, 2000)).toBe(0)
  })

  it('hitScore は大きいうちほど高く 0..100', () => {
    expect(hitScore(1)).toBe(100)
    expect(hitScore(0.5)).toBe(50)
    expect(hitScore(0)).toBe(0)
    expect(hitScore(1.5)).toBe(100) // 範囲外はクランプ
  })

  it('applyMiss は -20 だが 0 未満にしない', () => {
    expect(applyMiss(50)).toBe(30)
    expect(applyMiss(10)).toBe(0)
  })
})
