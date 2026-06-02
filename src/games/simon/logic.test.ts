import { describe, it, expect } from 'vitest'
import { extend, matchesPrefix, isComplete, type Pad } from './logic'

describe('simon', () => {
  it('extend は長さを1増やし、0..3 の値を足す', () => {
    const s = extend([], () => 0.5)
    expect(s).toHaveLength(1)
    expect(s[0]).toBeGreaterThanOrEqual(0)
    expect(s[0]).toBeLessThanOrEqual(3)
  })

  it('matchesPrefix: 途中まで一致は true', () => {
    const seq: Pad[] = [1, 2, 3, 0]
    expect(matchesPrefix(seq, [1, 2])).toBe(true)
    expect(matchesPrefix(seq, [1, 3])).toBe(false)
  })

  it('isComplete: 完全一致のみ true', () => {
    const seq: Pad[] = [1, 2, 3]
    expect(isComplete(seq, [1, 2])).toBe(false)
    expect(isComplete(seq, [1, 2, 3])).toBe(true)
    expect(isComplete(seq, [1, 2, 0])).toBe(false)
  })
})
