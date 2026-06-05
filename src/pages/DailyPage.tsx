import { lazy, Suspense, useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import { gameById } from '../core/registry'
import { GameShell } from '../core/ui/GameShell'
import { Layout } from '../core/ui/Layout'
import { Seo } from '../core/ui/Seo'
import NotFoundPage from './NotFoundPage'
import { dailyGameId, dailySeed, todayJST } from '../core/lib/daily'

export default function DailyPage() {
  const today = todayJST()
  const id = dailyGameId(today)
  const game = gameById.get(id)
  const seed = useMemo(() => dailySeed(today, id), [today, id])
  const Component = useMemo(() => (game ? lazy(game.component) : null), [game])

  if (!game || !Component) return <NotFoundPage />

  return (
    <Layout showBack>
      <Seo
        title="今日のチャレンジ — Game Portal"
        description="全員が同じお題に挑戦するデイリーチャレンジ。専用ランキングで競おう。"
      />
      <div className="rise-in mb-5 rounded-3xl border border-line bg-bg-panel p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-black tracking-wide text-cyan uppercase">
              <CalendarDays size={14} />
              Daily Challenge
            </p>
            <p className="font-display text-3xl text-fg">{game.title}</p>
            <p className="mt-2 text-sm font-bold text-muted">
              全員同じお題・専用ランキングで競おう
            </p>
          </div>
          <div className="rounded-2xl border border-yellow/30 bg-yellow/15 px-4 py-3 text-right">
            <p className="text-xs font-bold text-faint">Today</p>
            <p className="font-display text-xl text-yellow">{today}</p>
          </div>
        </div>
      </div>
      <Suspense fallback={<p className="py-20 text-center text-muted">読み込み中…</p>}>
        <GameShell key={`daily-${id}`} game={game} Component={Component} mode="daily" seed={seed} />
      </Suspense>
    </Layout>
  )
}
