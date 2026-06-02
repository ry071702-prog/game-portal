import { describe, it, expect } from 'vitest'
import { solved, toggle, isCleared, scramble, SIZE } from './logic'

describe('lightsout', () => {
  it('中央の toggle は5マス反転する', () => {
    const on = toggle(solved(), 2, 2).flat().filter(Boolean).length
    expect(on).toBe(5)
  })

  it('角の toggle は3マス反転する', () => {
    const on = toggle(solved(), 0, 0).flat().filter(Boolean).length
    expect(on).toBe(3)
  })

  it('同じマスを2回 toggle すると元に戻る (自己反転)', () => {
    const g = toggle(toggle(solved(), 1, 3), 1, 3)
    expect(isCleared(g)).toBe(true)
  })

  it('scramble は解ける (適用した手を逆順に戻すとクリア)', () => {
    // rng を固定し、scramble と同じ手順を再現して戻せることを確認
    const seq = [0.1, 0.4, 0.7, 0.2, 0.9, 0.5, 0.3, 0.6]
    let i = 0
    const rng = () => seq[i++ % seq.length]
    const g = scramble(rng, 4)
    // 同じ4手をもう一度当てると solved に戻る
    let j = 0
    const rng2 = () => seq[j++ % seq.length]
    let undo = g
    for (let k = 0; k < 4; k++) {
      undo = toggle(undo, Math.floor(rng2() * SIZE), Math.floor(rng2() * SIZE))
    }
    expect(isCleared(undo)).toBe(true)
  })
})
