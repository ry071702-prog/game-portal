import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, screen, act } from '@testing-library/react'
import { COLS } from './logic'
import Connect4Game from './Connect4Game'

/** 各列のボタンは全段にあるので、最上段 (row 0) を代表として使う */
const column = (c: number) => screen.getAllByRole('button', { name: `${c + 1}列目に落とす` })[0]
/** 最上段が空いている = まだ落とせる列 */
const isOpen = (c: number) => column(c).childElementCount === 0
const status = () => screen.getByText(/手数:/).textContent!
const movesText = () => Number(status().match(/手数: (\d+)/)![1])
const finished = () => /の勝ち|引き分け/.test(status())

describe('Connect4Game (place)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(0) // AI のタイブレークを固定
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('テストでは通信しない'))))
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('AI の手番中のクリックは無視され、500ms 後に AI が打つ', () => {
    render(<Connect4Game restartSignal={0} paused={false} onScore={vi.fn()} onGameOver={vi.fn()} />)
    fireEvent.click(column(0))
    expect(movesText()).toBe(1)
    fireEvent.click(column(1)) // AI の手番なので無視
    expect(movesText()).toBe(1)
    act(() => void vi.advanceTimersByTime(500))
    expect(movesText()).toBe(2)
  })

  it('paused 中は AI も打たない', () => {
    const { rerender } = render(<Connect4Game restartSignal={0} paused={false} onScore={vi.fn()} onGameOver={vi.fn()} />)
    fireEvent.click(column(0))
    rerender(<Connect4Game restartSignal={0} paused onScore={vi.fn()} onGameOver={vi.fn()} />)
    act(() => void vi.advanceTimersByTime(2000))
    expect(movesText()).toBe(1)
  })

  it('決着すると onGameOver は1回だけ呼ばれる (コールバックが変わっても再発火しない)', () => {
    const onGameOver = vi.fn()
    const onScore = vi.fn()
    const { rerender } = render(
      <Connect4Game restartSignal={0} paused={false} onScore={onScore} onGameOver={onGameOver} />,
    )
    // プレイヤーは常に左から空いている列に打つ (AI がいずれ勝つか引き分け)
    for (let turn = 0; turn < 50 && !finished(); turn++) {
      const c = [...Array(COLS).keys()].find(isOpen)
      if (c === undefined) break
      fireEvent.click(column(c))
      act(() => void vi.advanceTimersByTime(500))
    }
    expect(finished()).toBe(true)
    act(() => void vi.advanceTimersByTime(900))
    expect(onGameOver).toHaveBeenCalledTimes(1)

    const again = vi.fn()
    rerender(<Connect4Game restartSignal={0} paused={false} onScore={vi.fn()} onGameOver={again} />)
    act(() => void vi.advanceTimersByTime(2000))
    expect(again).not.toHaveBeenCalled()

    // 負け/引き分けではスコアを通知しない。勝ちなら手数ベースのスコア
    const result = onGameOver.mock.calls[0][0]
    if (result === 'win') expect(onScore).toHaveBeenCalledTimes(1)
    else expect(onScore).not.toHaveBeenCalled()
  })
})
