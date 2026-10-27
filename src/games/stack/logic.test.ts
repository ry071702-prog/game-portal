import { describe, it, expect } from 'vitest'
import {
  createGame,
  step,
  overlap,
  drop,
  floors,
  speedFor,
  W,
  BASE_WIDTH,
  PERFECT_GROW,
  PERFECT_GROW_EVERY,
  type StackState,
} from './logic'

/** current を下の段と同じ位置にした状態 */
function aligned(s: StackState, dx = 0): StackState {
  const top = s.tower[s.tower.length - 1]
  return { ...s, current: { ...s.current, x: top.x + dx } }
}

describe('createGame', () => {
  it('土台だけで 0 段・左端から右向きに動き出す', () => {
    const s = createGame()
    expect(floors(s)).toBe(0)
    expect(s.tower[0]).toEqual({ x: (W - BASE_WIDTH) / 2, width: BASE_WIDTH })
    expect(s.current.x).toBe(0)
    expect(s.dir).toBe(1)
  })
})

describe('step', () => {
  it('dir 方向に speed × dt だけ進む', () => {
    const s = step(createGame(), 100)
    expect(s.current.x).toBeCloseTo(speedFor(0) * 100)
  })

  it('右端で跳ね返って向きが変わる', () => {
    const s0 = createGame()
    const max = W - s0.current.width
    const s = step({ ...s0, current: { ...s0.current, x: max - 1 } }, 1 / speedFor(0) * 3)
    expect(s.dir).toBe(-1)
    expect(s.current.x).toBeCloseTo(max - 2)
  })

  it('長い dt でも盤面の外に出ない', () => {
    const s = step(createGame(), 100000)
    expect(s.current.x).toBeGreaterThanOrEqual(0)
    expect(s.current.x).toBeLessThanOrEqual(W - s.current.width)
  })

  it('ゲームオーバー後は動かない', () => {
    const s0 = { ...createGame(), over: true }
    expect(step(s0, 100)).toBe(s0)
  })
})

describe('overlap', () => {
  const prev = { x: 20, width: 60 }

  it('許容範囲内のズレはパーフェクトで下の段に揃う', () => {
    expect(overlap(prev, { x: 21.5, width: 60 })).toEqual({ block: prev, result: 'perfect' })
  })

  it('はみ出た分が削られる (右ズレ)', () => {
    expect(overlap(prev, { x: 30, width: 60 })).toEqual({
      block: { x: 30, width: 50 },
      result: 'cut',
    })
  })

  it('はみ出た分が削られる (左ズレ)', () => {
    expect(overlap(prev, { x: 5, width: 60 })).toEqual({
      block: { x: 20, width: 45 },
      result: 'cut',
    })
  })

  it('完全に外れたら miss', () => {
    expect(overlap(prev, { x: 80, width: 20 })).toEqual({ block: null, result: 'miss' })
  })
})

describe('drop', () => {
  it('成功すると 1 段増え、次のブロックは逆側から逆向きに出る', () => {
    const { state, result } = drop(aligned(createGame(), 10))
    expect(result).toBe('cut')
    expect(floors(state)).toBe(1)
    expect(state.current.width).toBe(BASE_WIDTH - 10)
    expect(state.current.x).toBe(W - state.current.width)
    expect(state.dir).toBe(-1)
  })

  it('外れるとゲームオーバーで段数は増えない', () => {
    const s0 = createGame()
    const { state, result } = drop({ ...s0, current: { x: 0, width: 10 } })
    expect(result).toBe('miss')
    expect(state.over).toBe(true)
    expect(floors(state)).toBe(0)
  })

  it(`パーフェクト ${PERFECT_GROW_EVERY} 連続で幅が少し戻る (土台幅が上限)`, () => {
    // まず幅を削っておく
    let s = drop(aligned(createGame(), 20)).state
    const narrowed = s.current.width
    for (let i = 0; i < PERFECT_GROW_EVERY; i++) s = drop(aligned(s)).state
    expect(s.combo).toBe(PERFECT_GROW_EVERY)
    expect(s.current.width).toBe(Math.min(narrowed + PERFECT_GROW, BASE_WIDTH))
    const top = s.tower[s.tower.length - 1]
    expect(top.x).toBeGreaterThanOrEqual(0)
    expect(top.x + top.width).toBeLessThanOrEqual(W)
  })

  it('cut でコンボが途切れる', () => {
    let s = drop(aligned(createGame())).state
    expect(s.combo).toBe(1)
    s = drop(aligned(s, 5)).state
    expect(s.combo).toBe(0)
  })
})

describe('speedFor', () => {
  it('段数で速くなり、上限で頭打ち', () => {
    expect(speedFor(10)).toBeGreaterThan(speedFor(0))
    expect(speedFor(1000)).toBe(speedFor(10000))
  })
})
