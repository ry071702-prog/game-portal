import { describe, it, expect } from 'vitest'
import { makeBoard, toScore, COUNT } from './logic'

describe('numtap', () => {
  it('makeBoard は 1..COUNT を過不足なく含む', () => {
    const b = makeBoard(() => 0.5)
    expect([...b].sort((x, y) => x - y)).toEqual(Array.from({ length: COUNT }, (_, i) => i + 1))
  })

  it('toScore は速いほど高い', () => {
    expect(toScore(1000)).toBeGreaterThan(toScore(5000))
    expect(toScore(40000)).toBe(0)
  })
})
