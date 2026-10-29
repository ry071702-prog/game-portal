import { useEffect, useRef, useState } from 'react'
import type { GameComponentProps } from '../../core/types'
import { sound } from '../../core/lib/sound'
import { now } from '../../core/lib/time'
import {
  makeQuestion,
  answer,
  initialState,
  COLORS,
  DURATION,
  WRONG_PENALTY,
  type ColorIndex,
} from './logic'

const RULE_LABEL = { ink: 'もじの「いろ」は？', word: 'かいてある「いみ」は？' } as const

export default function ColorWordGame({ paused, onScore, onGameOver }: GameComponentProps) {
  const [game, setGame] = useState(initialState)
  const [question, setQuestion] = useState(() => makeQuestion())
  // 残り時間は ms で持つ、1秒刻みの setInterval だとポーズ⇔再開を1秒未満で繰り返すと時計が進まない
  const [msLeft, setMsLeft] = useState(DURATION * 1000)
  const [miss, setMiss] = useState(false)
  const overFired = useRef(false)
  const over = msLeft === 0
  const timeLeft = Math.ceil(msLeft / 1000)

  useEffect(() => onScore(game.score), [game.score, onScore])

  // 時間切れで一度だけ終了通知
  useEffect(() => {
    if (over && !overFired.current) {
      overFired.current = true
      onGameOver()
    }
  }, [over, onGameOver])

  // 実経過時間で減らす (再開時は基準時刻を取り直すので、ポーズ中の時間だけが除かれる)
  useEffect(() => {
    if (paused || over) return
    let last = now()
    const clock = setInterval(() => {
      const t = now()
      const dt = t - last
      last = t
      setMsLeft((ms) => Math.max(0, ms - dt))
    }, 100)
    return () => clearInterval(clock)
  }, [paused, over])

  const choose = (choice: ColorIndex) => {
    if (paused || over) return
    const { state, ok } = answer(game, question, choice)
    if (ok) {
      sound.click()
      setMiss(false)
    } else {
      sound.wrong()
      setMiss(true)
      setMsLeft((ms) => Math.max(0, ms - WRONG_PENALTY * 1000))
    }
    setGame(state)
    setQuestion(makeQuestion(Math.random, state.score, question))
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full max-w-xs justify-between text-sm text-muted">
        <span>
          残り <span className="font-display text-fg">{timeLeft}</span> 秒
        </span>
        <span>
          連続 <span className="font-display text-yellow">{game.streak}</span>
        </span>
      </div>
      <div
        className={`flex w-full max-w-xs flex-col items-center gap-2 rounded-2xl bg-surface-2 py-6 ring-1 ${
          miss ? 'ring-red-500' : 'ring-line'
        }`}
      >
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            question.rule === 'ink' ? 'bg-cyan/20 text-cyan' : 'bg-pink-500/20 text-pink-300'
          }`}
        >
          {RULE_LABEL[question.rule]}
        </span>
        <span
          className="font-display text-5xl font-black select-none"
          style={{ color: COLORS[question.ink].css }}
          aria-label={`${COLORS[question.word].label} と書かれた文字`}
        >
          {COLORS[question.word].label}
        </span>
      </div>
      <div className="grid w-full max-w-xs grid-cols-2 gap-3">
        {COLORS.map((c, i) => (
          <button
            key={c.key}
            onClick={() => choose(i as ColorIndex)}
            disabled={paused || over}
            aria-label={c.label}
            className="flex h-16 items-center justify-center gap-2 rounded-xl bg-surface-2 text-base font-bold text-fg ring-1 ring-line transition active:scale-95"
          >
            <span className="h-5 w-5 rounded-full" style={{ background: c.css }} />
            {c.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-faint">
        お題どおりに答えよう。まちがえると残り時間 -{WRONG_PENALTY} 秒
      </p>
    </div>
  )
}
