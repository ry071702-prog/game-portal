import { useCallback, useEffect, useMemo, useState } from 'react'
import type { GameComponentProps } from '../../core/types'
import { sound } from '../../core/lib/sound'
import { mulberry32 } from '../../core/lib/daily'
import { makeAnswer, judge, toScore, CODE_LENGTH, MAX_TURNS } from './logic'

interface HistoryEntry {
  guess: number[]
  hit: number
  blow: number
}

const DIGITS = Array.from({ length: 10 }, (_, i) => i)

export default function HitblowGame({ paused, onScore, onGameOver, seed }: GameComponentProps) {
  const rng = useMemo(() => (seed != null ? mulberry32(seed) : Math.random), [seed])
  const answer = useMemo(() => makeAnswer(rng), [rng])
  const [input, setInput] = useState<number[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const done = result != null

  const pushDigit = useCallback(
    (d: number) => {
      if (paused || done || input.length >= CODE_LENGTH || input.includes(d)) return
      sound.toggle()
      setInput([...input, d])
    },
    [paused, done, input],
  )

  const erase = useCallback(() => {
    if (paused || done || input.length === 0) return
    sound.toggle()
    setInput(input.slice(0, -1))
  }, [paused, done, input])

  const confirm = useCallback(() => {
    if (paused || done || input.length !== CODE_LENGTH) return
    const { hit, blow } = judge(answer, input)
    const turns = history.length + 1
    setHistory([{ guess: input, hit, blow }, ...history])
    setInput([])
    if (hit === CODE_LENGTH) {
      // 当たり: 早いほど高スコア。終了音は GameShell に委譲 (二重再生回避)
      setResult('win')
      onScore(toScore(turns))
      onGameOver('win')
    } else if (turns >= MAX_TURNS) {
      // 回数切れ: 答えを見せて終了
      setResult('lose')
      onGameOver()
    } else if (hit === 0 && blow === 0) {
      sound.wrong()
    } else {
      sound.click()
    }
  }, [paused, done, input, history, answer, onScore, onGameOver])

  // 物理キーボード対応 (数字/Backspace/Enter)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        pushDigit(Number(e.key))
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        erase()
      } else if (e.key === 'Enter') {
        e.preventDefault() // フォーカス中ボタンの二重発火を防ぐ
        confirm()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pushDigit, erase, confirm])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-xs justify-between text-sm text-muted">
        <span>
          残り <span className="font-display text-yellow">{MAX_TURNS - history.length}</span> 回
        </span>
        <span>{result === 'win' ? 'クリア！' : result === 'lose' ? 'ゲームオーバー' : '4桁の数字を推理'}</span>
      </div>

      {/* 入力中の4桁 */}
      <div className="flex gap-2">
        {Array.from({ length: CODE_LENGTH }, (_, i) => (
          <div
            key={i}
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-line bg-surface-2 text-xl font-bold text-fg"
          >
            {input[i] ?? ''}
          </div>
        ))}
      </div>

      {result === 'lose' && (
        <p className="text-sm text-muted">
          答えは <span className="font-display tracking-widest text-pink">{answer.join('')}</span> でした
        </p>
      )}

      {/* テンキー (選択済みはグレーアウト) */}
      <div className="grid w-full max-w-xs grid-cols-5 gap-2">
        {DIGITS.map((d) => {
          const used = input.includes(d)
          return (
            <button
              key={d}
              onClick={() => pushDigit(d)}
              disabled={paused || done || used || input.length >= CODE_LENGTH}
              className={`flex aspect-square items-center justify-center rounded-lg text-lg font-bold transition ${
                used ? 'bg-surface text-faint' : 'bg-yellow text-bg-base hover:brightness-105'
              }`}
            >
              {d}
            </button>
          )
        })}
      </div>
      <div className="flex w-full max-w-xs gap-2">
        <button onClick={erase} disabled={paused || done || input.length === 0} className="btn-soft flex-1 text-sm">
          1字消す
        </button>
        <button
          onClick={confirm}
          disabled={paused || done || input.length !== CODE_LENGTH}
          className="btn-primary flex-1 text-sm"
        >
          確定
        </button>
      </div>

      {/* 推理履歴 (新しいものが上) */}
      {history.length > 0 && (
        <div className="flex w-full max-w-xs flex-col gap-1.5">
          {history.map((h, i) => (
            <div
              key={history.length - i}
              className="flex items-center justify-between rounded-lg bg-surface px-3 py-1.5 text-sm"
            >
              <span className="font-display tracking-widest text-fg">{h.guess.join(' ')}</span>
              <span className="text-muted">
                <span className="font-bold text-yellow">{h.hit}</span> Hit /{' '}
                <span className="font-bold text-cyan">{h.blow}</span> Blow
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-faint">Hit=位置も数字も一致 / Blow=数字のみ一致。10回以内に当てよう</p>
    </div>
  )
}
