import { useCallback, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, HelpCircle, Trophy, Share2 } from 'lucide-react'
import type { GameComponent, GameManifest } from '../types'
import { useScoreStore } from '../store/scoreStore'
import { useIdentityStore } from '../store/identityStore'
import { submitScore, type SubmitResult, type Mode } from '../lib/leaderboard'
import { toast } from '../store/toastStore'
import { sound } from '../lib/sound'
import { cn } from '../lib/cn'
import { NicknameDialog } from './NicknameDialog'
import { LeaderboardPanel } from './LeaderboardPanel'

async function celebrate() {
  try {
    const confetti = (await import('canvas-confetti')).default
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } })
  } catch {
    /* confetti は演出のみ。失敗しても無視 */
  }
}

interface GameShellProps {
  game: GameManifest
  Component: GameComponent
  /** 'daily' はデイリーチャレンジ (seed 固定・専用ランキング) */
  mode?: Mode
  /** デイリー時の seed */
  seed?: number
}

/**
 * 全ゲーム共通の枠。スコア/ベスト・ポーズ・リスタート・終了モーダル・操作説明に加え、
 * 終了時のオンラインスコア送信とランキング表示を担う。
 */
export function GameShell({ game, Component, mode = 'free', seed }: GameShellProps) {
  const [score, setScore] = useState(0)
  const [paused, setPaused] = useState(false)
  const [ended, setEnded] = useState<null | 'over' | 'win'>(null)
  const [restartSignal, setRestartSignal] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [ranks, setRanks] = useState<SubmitResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [nickOpen, setNickOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [newRecord, setNewRecord] = useState(false)
  const [started, setStarted] = useState(false)
  const gameOver = ended !== null

  const scoreRef = useRef(0)
  const pendingScore = useRef(0)

  const best = useScoreStore((s) => s.best[game.id] ?? 0)
  const setBest = useScoreStore((s) => s.setBest)
  // この回が始まる前のベスト (記録更新判定用)
  const bestAtStart = useRef(useScoreStore.getState().best[game.id] ?? 0)
  const { clientId, name, avatar, setName } = useIdentityStore()

  const doSubmit = useCallback(
    (playerName: string, finalScore: number) => {
      setSubmitting(true)
      submitScore({ gameId: game.id, name: playerName, avatar, score: finalScore, clientId, mode })
        .then((res) => {
          setRanks(res)
          setRefreshKey((k) => k + 1)
          toast.success(`登録完了！全期間 ${res.alltimeRank}位 / 今日 ${res.dailyRank}位`)
        })
        .catch(() => toast.error('スコア送信に失敗しました'))
        .finally(() => setSubmitting(false))
    },
    [game.id, clientId, avatar, mode],
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
      const isRecord = finalScore > 0 && finalScore > bestAtStart.current
      setNewRecord(isRecord)
      if (result === 'win' || isRecord) {
        sound.win()
        void celebrate()
      } else {
        sound.gameover()
      }
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
    bestAtStart.current = useScoreStore.getState().best[game.id] ?? 0
    setScore(0)
    scoreRef.current = 0
    setEnded(null)
    setPaused(false)
    setRanks(null)
    setNewRecord(false)
    setStarted(true)
    sound.click()
    setRestartSignal((n) => n + 1)
  }, [game.id])

  const start = () => {
    sound.click()
    setStarted(true)
  }

  const onNickSubmit = (newName: string) => {
    setName(newName)
    setNickOpen(false)
    if (pendingScore.current > 0) {
      doSubmit(newName, pendingScore.current)
      pendingScore.current = 0
    }
  }

  const share = async () => {
    const url = window.location.origin
    const rankText = ranks ? ` 全期間${ranks.alltimeRank}位！` : '！'
    const text = `Game Portal「${game.title}」で ${score}点${rankText} #GamePortal`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Game Portal', text, url })
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`)
        toast.success('共有テキストをコピーしました')
      }
    } catch {
      /* キャンセル時など。無視 */
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h1 className="font-display text-2xl text-fg">{game.title}</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted">
            SCORE <span className="font-display ml-1 text-base text-fg">{score}</span>
          </span>
          <span className="flex items-center gap-1 text-gold">
            <Trophy size={14} />
            <span className="font-display text-base">{best}</span>
          </span>
        </div>
      </div>

      <div className="glass relative overflow-hidden rounded-2xl border-[#ffe000]/20 p-3">
        {/* ゲーム本体: restartSignal を key にしてリスタート=再マウント */}
        <Component
          key={restartSignal}
          paused={paused || gameOver || !started}
          onScore={handleScore}
          onGameOver={handleGameOver}
          restartSignal={restartSignal}
          seed={seed}
        />

        {!started && !gameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/90 px-5 text-center backdrop-blur-sm dark:bg-black/85">
            <div className="text-6xl">{game.thumbnail}</div>
            <p className="font-display text-2xl text-fg">{game.title}</p>
            <ul className="max-w-xs space-y-2 text-left text-sm font-medium text-fg">
              {game.instructions.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="font-bold text-accent">▸</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={start}
              className="mt-1 flex items-center gap-2 rounded-xl bg-[#ffe000] px-10 py-3 text-lg font-extrabold text-black transition hover:brightness-110"
            >
              <Play size={20} />
              スタート
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/85 px-4 text-center backdrop-blur-sm dark:bg-black/80">
            {newRecord && (
              <p className="font-display animate-pulse text-sm text-gold">★ NEW RECORD ★</p>
            )}
            <p className="font-display text-3xl text-fg">
              {ended === 'win' ? 'CLEAR!' : 'GAME OVER'}
            </p>
            <p className="text-sm text-muted">
              スコア <span className="font-display text-fg">{score}</span>
            </p>
            {submitting && <p className="text-xs text-muted">ランキング送信中…</p>}
            {ranks && (
              <p className="text-sm text-amber-700 dark:text-yellow-200">
                全期間 <span className="font-display">{ranks.alltimeRank}</span> 位 / 今日{' '}
                <span className="font-display">{ranks.dailyRank}</span> 位
              </p>
            )}
            <div className="mt-1 flex items-center gap-2">
              <button
                onClick={restart}
                className="flex items-center gap-2 rounded-xl bg-[#ffe000] px-6 py-2.5 font-extrabold text-black transition hover:brightness-110"
              >
                <RotateCcw size={18} />
                もう一度
              </button>
              {score > 0 && (
                <button
                  onClick={share}
                  className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-4 py-2.5 font-bold text-fg hover:opacity-80"
                >
                  <Share2 size={18} />
                  共有
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => setPaused((p) => !p)}
          disabled={gameOver}
          className={cn(
            'flex items-center gap-1.5 rounded-xl bg-surface-2 px-4 py-2 text-sm text-fg hover:bg-surface-2',
            gameOver && 'opacity-40',
          )}
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
          {paused ? '再開' : 'ポーズ'}
        </button>
        <button
          onClick={restart}
          className="flex items-center gap-1.5 rounded-xl bg-surface-2 px-4 py-2 text-sm text-fg hover:bg-surface-2"
        >
          <RotateCcw size={16} />
          リスタート
        </button>
        <button
          onClick={() => setShowHelp((s) => !s)}
          className="ml-auto flex items-center gap-1.5 rounded-xl bg-surface-2 px-4 py-2 text-sm text-fg hover:bg-surface-2"
        >
          <HelpCircle size={16} />
          操作
        </button>
      </div>

      {showHelp && (
        <ul className="glass mt-3 list-disc space-y-1 rounded-xl p-4 pl-8 text-sm text-muted">
          {game.instructions.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}

      <LeaderboardPanel
        gameId={game.id}
        refreshKey={refreshKey}
        selfName={name || undefined}
        mode={mode}
      />

      <NicknameDialog
        open={nickOpen}
        initialName={name}
        onSubmit={onNickSubmit}
        onClose={() => setNickOpen(false)}
      />
    </div>
  )
}
