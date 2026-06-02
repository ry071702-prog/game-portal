import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { fetchLeaderboard, type LeaderboardRow, type Period } from '../lib/leaderboard'
import { cn } from '../lib/cn'

interface LeaderboardPanelProps {
  gameId: string
  /** 変化するとデータを再取得 (スコア送信後など) */
  refreshKey?: number
  /** 自分の行をハイライトするための名前 */
  selfName?: string
}

const RANK_COLOR = ['text-yellow-300', 'text-gray-300', 'text-amber-600']

export function LeaderboardPanel({ gameId, refreshKey = 0, selfName }: LeaderboardPanelProps) {
  const [period, setPeriod] = useState<Period>('daily')
  // リクエストキーで管理し、effect 内の同期 setState を避ける
  const reqKey = `${gameId}|${period}|${refreshKey}`
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
    fetchLeaderboard(gameId, period)
      .then((r) => alive && setData({ key: reqKey, rows: r, error: false }))
      .catch(() => alive && setData({ key: reqKey, rows: [], error: true }))
    return () => {
      alive = false
    }
  }, [reqKey, gameId, period])

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-white">
          <Trophy size={18} className="text-yellow-300" />
          ランキング
        </h2>
        <div className="flex gap-1 rounded-lg bg-black/40 p-1 text-xs">
          {(['daily', 'alltime'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'rounded-md px-3 py-1',
                period === p ? 'bg-cyan-500 font-bold text-black' : 'text-gray-300',
              )}
            >
              {p === 'daily' ? '今日' : '全期間'}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="py-4 text-center text-sm text-gray-500">読み込みに失敗しました</p>}
      {!error && rows === null && (
        <p className="py-4 text-center text-sm text-gray-500">読み込み中…</p>
      )}
      {!error && rows?.length === 0 && (
        <p className="py-4 text-center text-sm text-gray-500">
          まだ記録がありません。一番乗りを狙おう！
        </p>
      )}
      {!error && rows && rows.length > 0 && (
        <ol className="space-y-1">
          {rows.map((row, i) => {
            const isSelf = selfName != null && row.name === selfName
            return (
              <li
                key={i}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm',
                  isSelf ? 'bg-cyan-500/15 ring-1 ring-cyan-400/40' : 'odd:bg-white/[0.02]',
                )}
              >
                <span
                  className={cn(
                    'w-6 text-right font-bold tabular-nums',
                    RANK_COLOR[i] ?? 'text-gray-500',
                  )}
                >
                  {i + 1}
                </span>
                <span className="text-base">{row.avatar || '🎮'}</span>
                <span className="flex-1 truncate text-gray-200">{row.name}</span>
                <span className="font-pixel text-sm tabular-nums text-white">{row.best}</span>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
