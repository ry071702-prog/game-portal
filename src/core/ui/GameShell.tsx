import { useCallback, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, HelpCircle, Trophy } from 'lucide-react'
import type { GameComponent, GameManifest } from '../types'
import { useScoreStore } from '../store/scoreStore'
import { useIdentityStore } from '../store/identityStore'
import { submitScore, type SubmitResult } from '../lib/leaderboard'
import { toast } from '../store/toastStore'
import { cn } from '../lib/cn'
import { NicknameDialog } from './NicknameDialog'
import { LeaderboardPanel } from './LeaderboardPanel'

interface GameShellProps {
  game: GameManifest
  Component: GameComponent
}

/**
 * 全ゲーム共通の枠。スコア/ベスト・ポーズ・リスタート・終了モーダル・操作説明に加え、
 * 終了時のオンラインスコア送信とランキング表示を担う。
 */
export function GameShell({ game, Component }: GameShellProps) {
  const [score, setScore] = useState(0)
  const [paused, setPaused] = useState(false)
  const [ended, setEnded] = useState<null | 'over' | 'win'>(null)
  const [restartSignal, setRestartSignal] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [ranks, setRanks] = useState<SubmitResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [nickOpen, setNickOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const gameOver = ended !== null

  const scoreRef = useRef(0)
  const pendingScore = useRef(0)

  const best = useScoreStore((s) => s.best[game.id] ?? 0)
  const setBest = useScoreStore((s) => s.setBest)
  const { clientId, name, avatar, setName } = useIdentityStore()

  const doSubmit = useCallback(
    (playerName: string, finalScore: number) => {
      setSubmitting(true)
      submitScore({ gameId: game.id, name: playerName, avatar, score: finalScore, clientId })
        .then((res) => {
          setRanks(res)
          setRefreshKey((k) => k + 1)
          toast.success(`登録完了！全期間 ${res.alltimeRank}位 / 今日 ${res.dailyRank}位`)
        })
        .catch(() => toast.error('スコア送信に失敗しました'))
        .finally(() => setSubmitting(false))
    },
    [game.id, clientId, avatar],
  )

  const handleScore = useCallback(
    (s: number) => {
      setScore(s)
      scoreRef.current = s
      setBest(game.id, s)
    },
    [game.id, setBest],
  )

  const handleGameOver = useCallback(
    (result: 'over' | 'win' = 'over') => {
      setEnded(result)
      const finalScore = scoreRef.current
      if (finalScore <= 0) return
      if (name) {
        doSubmit(name, finalScore)
      } else {
        pendingScore.current = finalScore
        setNickOpen(true)
      }
    },
    [name, doSubmit],
  )

  const restart = useCallback(() => {
    setScore(0)
    scoreRef.current = 0
    setEnded(null)
    setPaused(false)
    setRanks(null)
    setRestartSignal((n) => n + 1)
  }, [])

  const onNickSubmit = (newName: string) => {
    setName(newName)
    setNickOpen(false)
    if (pendingScore.current > 0) {
      doSubmit(newName, pendingScore.current)
      pendingScore.current = 0
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h1 className="neon-text text-xl font-bold text-cyan-300">{game.title}</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">
            SCORE <span className="font-pixel ml-1 text-base text-white">{score}</span>
          </span>
          <span className="flex items-center gap-1 text-yellow-300">
            <Trophy size={14} />
            <span className="font-pixel text-base">{best}</span>
          </span>
        </div>
      </div>

      <div className="neon-box relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-3">
        {/* ゲーム本体: restartSignal を key にしてリスタート=再マウント */}
        <Component
          key={restartSignal}
          paused={paused || gameOver}
          onScore={handleScore}
          onGameOver={handleGameOver}
          restartSignal={restartSignal}
        />

        {gameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/75 px-4 text-center backdrop-blur-sm">
            <p className="font-pixel text-xl text-cyan-300">
              {ended === 'win' ? 'CLEAR!' : 'GAME OVER'}
            </p>
            <p className="text-sm text-gray-300">
              スコア <span className="font-pixel text-white">{score}</span>
            </p>
            {submitting && <p className="text-xs text-gray-400">ランキング送信中…</p>}
            {ranks && (
              <p className="text-sm text-yellow-200">
                全期間 <span className="font-pixel">{ranks.alltimeRank}</span> 位 / 今日{' '}
                <span className="font-pixel">{ranks.dailyRank}</span> 位
              </p>
            )}
            <button
              onClick={restart}
              className="mt-1 flex items-center gap-2 rounded-xl border border-cyan-400/50 bg-cyan-500/20 px-5 py-2.5 font-bold text-cyan-100 hover:bg-cyan-500/30"
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

      <LeaderboardPanel gameId={game.id} refreshKey={refreshKey} selfName={name || undefined} />

      <NicknameDialog
        open={nickOpen}
        initialName={name}
        onSubmit={onNickSubmit}
        onClose={() => setNickOpen(false)}
      />
    </div>
  )
}
