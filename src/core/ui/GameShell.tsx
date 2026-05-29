import { useCallback, useState } from 'react'
import { Pause, Play, RotateCcw, HelpCircle, Trophy } from 'lucide-react'
import type { GameComponent, GameManifest } from '../types'
import { useScoreStore } from '../store/scoreStore'
import { cn } from '../lib/cn'

interface GameShellProps {
  game: GameManifest
  Component: GameComponent
}

/**
 * 全ゲーム共通の枠。スコア/ベスト表示・ポーズ・リスタート・ゲームオーバーモーダル・
 * 操作説明を提供し、ゲーム本体には GameComponentProps を渡すだけにする。
 */
export function GameShell({ game, Component }: GameShellProps) {
  const [score, setScore] = useState(0)
  const [paused, setPaused] = useState(false)
  const [ended, setEnded] = useState<null | 'over' | 'win'>(null)
  const [restartSignal, setRestartSignal] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const gameOver = ended !== null

  const best = useScoreStore((s) => s.best[game.id] ?? 0)
  const setBest = useScoreStore((s) => s.setBest)

  const handleScore = useCallback(
    (s: number) => {
      setScore(s)
      setBest(game.id, s)
    },
    [game.id, setBest],
  )

  const handleGameOver = useCallback((result: 'over' | 'win' = 'over') => setEnded(result), [])

  const restart = useCallback(() => {
    setScore(0)
    setEnded(null)
    setPaused(false)
    setRestartSignal((n) => n + 1)
  }, [])

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-white">{game.title}</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-300">
            スコア <span className="font-semibold text-white">{score}</span>
          </span>
          <span className="flex items-center gap-1 text-amber-300">
            <Trophy size={14} />
            {best}
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        {/* ゲーム本体: 共通 props を供給。restartSignal を key にしてリスタート=再マウント */}
        <Component
          key={restartSignal}
          paused={paused || gameOver}
          onScore={handleScore}
          onGameOver={handleGameOver}
          restartSignal={restartSignal}
        />

        {gameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm">
            <p className="text-2xl font-bold text-white">
              {ended === 'win' ? '🎉 クリア！' : 'ゲームオーバー'}
            </p>
            <p className="text-gray-300">
              スコア {score} / ベスト {best}
            </p>
            <button
              onClick={restart}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 font-semibold text-white hover:bg-violet-500"
            >
              <RotateCcw size={18} />
              もう一度
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => setPaused((p) => !p)}
          disabled={gameOver}
          className={cn(
            'flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20',
            gameOver && 'opacity-40',
          )}
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
          {paused ? '再開' : 'ポーズ'}
        </button>
        <button
          onClick={restart}
          className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
        >
          <RotateCcw size={16} />
          リスタート
        </button>
        <button
          onClick={() => setShowHelp((s) => !s)}
          className="ml-auto flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
        >
          <HelpCircle size={16} />
          操作
        </button>
      </div>

      {showHelp && (
        <ul className="mt-3 list-disc space-y-1 rounded-xl border border-white/10 bg-white/[0.03] p-4 pl-8 text-sm text-gray-300">
          {game.instructions.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
