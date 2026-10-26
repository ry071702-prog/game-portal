import { describe, it, expect } from 'vitest'
import { solved, toggle, isCleared, scramble, toScore, SIZE } from './logic'

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

describe('lightsout の端ケース', () => {
  it('toggle は元の盤面を変更しない (純粋関数)', () => {
    const g = solved()
    toggle(g, 2, 2)
    expect(isCleared(g)).toBe(true)
  })

  it('scramble が偶然そろっても未クリアの盤面を返す', () => {
    // 同じマスを2回押すと元に戻るので clicks=2 + 固定 rng で必ずそろう
    const g = scramble(() => 0, 2)
    expect(isCleared(g)).toBe(false)
  })

  it('clicks=0 でも未クリアの盤面を返す', () => {
    expect(isCleared(scramble(() => 0, 0))).toBe(false)
  })
})

describe('lightsout toScore', () => {
  it('手数が少ないほど高く、0 未満にはならない', () => {
    expect(toScore(0)).toBe(1000)
    expect(toScore(5)).toBeGreaterThan(toScore(6))
    expect(toScore(1000)).toBe(0)
  })
})
