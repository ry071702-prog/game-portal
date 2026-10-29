import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, act } from '@testing-library/react'
import Game2048 from './Game2048'

// render() の戻り値の要素名 (c-o-n-t-a-i-n-e-r) はテスト内で書かない
// Tailwind がテストファイルも走査して、本番 CSS に未使用のユーティリティを足してしまうため
const tiles = () => [...document.querySelectorAll('.game-surface > div')].map((d) => d.textContent)
const press = (key: string) => act(() => void fireEvent.keyDown(window, { key }))

function setup() {
  const onScore = vi.fn()
  const onGameOver = vi.fn()
  render(<Game2048 restartSignal={0} paused={false} onScore={onScore} onGameOver={onGameOver} />)
  return { onScore, onGameOver }
}

describe('Game2048 (reducer)', () => {
  beforeEach(() => {
    // rng=0 → spawn は常に先頭の空きマスに 2 を置く
    vi.spyOn(Math, 'random').mockReturnValue(0)
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('テストでは通信しない'))))
  })
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('合体した点数がスコアに積算され、動いたら1枚 spawn する', () => {
    const { onScore } = setup()
    expect(tiles().slice(0, 4)).toEqual(['2', '2', '', ''])
    press('ArrowLeft')
    expect(tiles().slice(0, 4)).toEqual(['4', '2', '', ''])
    expect(onScore).toHaveBeenLastCalledWith(4)
    press('ArrowRight') // [4,2,0,0] → [0,0,4,2] + spawn
    expect(tiles().slice(0, 4)).toEqual(['2', '', '4', '2'])
    expect(onScore).toHaveBeenLastCalledWith(4)
  })

  it('動かない方向の入力ではタイルが増えない', () => {
    setup()
    press('ArrowLeft')
    const before = tiles()
    press('ArrowUp') // 1行目だけにタイルがあるので上には動かない
    expect(tiles()).toEqual(before)
  })

  it('paused 中はキー入力を無視する', () => {
    const onScore = vi.fn()
    render(<Game2048 restartSignal={0} paused onScore={onScore} onGameOver={vi.fn()} />)
    press('ArrowLeft')
    expect(tiles().slice(0, 4)).toEqual(['2', '2', '', ''])
    expect(onScore).not.toHaveBeenCalledWith(4)
  })
})
