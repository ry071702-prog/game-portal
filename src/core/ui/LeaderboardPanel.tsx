import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { fetchLeaderboard, type LeaderboardRow, type Period, type Mode } from '../lib/leaderboard'
import { cn } from '../lib/cn'

interface LeaderboardPanelProps {
  gameId: string
  /** 変化するとデータを再取得 (スコア送信後など) */
  refreshKey?: number
  /** 自分の行をハイライトするための名前 */
  selfName?: string
  /** 'daily' はデイリーチャレンジの専用ランキング (期間タブ無し) */
  mode?: Mode
}

const RANK_COLOR = ['text-yellow', 'text-cyan', 'text-muted']

export function LeaderboardPanel({
  gameId,
  refreshKey = 0,
  selfName,
  mode = 'free',
}: LeaderboardPanelProps) {
  const isDaily = mode === 'daily'
  // デイリーは当日の専用ボード固定。フリーは 今日/全期間 を切替
  const [period, setPeriod] = useState<Period>(isDaily ? 'daily' : 'daily')
  // リクエストキーで管理し、effect 内の同期 setState を避ける
  const reqKey = `${gameId}|${period}|${mode}|${refreshKey}`
  const [data, setData] = useState<{ key: string; rows: LeaderboardRow[]; error: boolean }>({
    key: '',
    rows: [],
    error: false,
  })
  const loading = data.key !== reqKey
  const rows = loading ? null : data.rows
  const error = !loading && data.error

  useEffect(() => {
    let alive = true
    fetchLeaderboard(gameId, period, 20, mode)
      .then((r) => alive && setData({ key: reqKey, rows: r, error: false }))
      .catch(() => alive && setData({ key: reqKey, rows: [], error: true }))
    return () => {
      alive = false
    }
  }, [reqKey, gameId, period, mode])

  return (
    <section className="mt-4 rounded-3xl border border-line bg-bg-panel p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display flex items-center gap-2 text-xl text-fg">
          <Trophy size={18} className="text-yellow" />
          {isDaily ? 'デイリーランキング' : 'ランキング'}
        </h2>
        {!isDaily && (
          <div className="segmented text-xs">
            {(['daily', 'alltime'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-3 py-1.5 font-bold text-muted hover:text-fg',
                  period === p && 'is-active',
                )}
              >
                {p === 'daily' ? '今日' : '全期間'}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="py-4 text-center text-sm text-faint">読み込みに失敗しました</p>}
      {!error && rows === null && (
        <div className="space-y-2" aria-busy="true" aria-label="ランキング読み込み中">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-surface p-2.5">
              <span className="shimmer h-8 w-8 rounded-full" />
              <span className="shimmer h-4 flex-1 rounded-full" />
              <span className="shimmer h-4 w-14 rounded-full" />
            </div>
          ))}
        </div>
      )}
      {!error && rows?.length === 0 && (
        <div className="rounded-xl border border-dashed border-line bg-surface px-4 py-7 text-center">
          <Trophy size={24} className="mx-auto mb-2 text-faint" />
          <p className="text-sm font-bold text-muted">まだ記録がありません</p>
          <p className="mt-1 text-xs text-faint">一番乗りを狙おう</p>
        </div>
      )}
      {!error && rows && rows.length > 0 && (
        <ol className="space-y-1.5">
          {rows.map((row, i) => {
            const isSelf = selfName != null && row.name === selfName
            return (
              <li
                key={i}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition',
                  isSelf
                    ? 'bg-yellow/15 ring-1 ring-yellow/40'
                    : 'odd:bg-surface hover:bg-surface-2',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 font-display text-sm tabular-nums',
                    RANK_COLOR[i] ?? 'text-faint',
                  )}
                >
                  {i + 1}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-[var(--control-bg)] text-base">
                  {row.avatar || '🎮'}
                </span>
                <span className="flex-1 truncate text-fg">{row.name}</span>
                <span className="rounded-full bg-surface-2 px-3 py-1 font-display text-sm tabular-nums text-fg">
                  {row.best}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
