import { lazy, Suspense, useMemo } from 'react'
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
      <div className="mb-5 rounded-2xl border border-[#ffe000]/30 bg-gradient-to-b from-[#ffe000]/10 to-transparent p-5 text-center">
        <p className="font-display neon-text mb-1 text-sm text-accent">DAILY CHALLENGE</p>
        <p className="text-sm text-muted">{today}</p>
        <p className="mt-2 text-fg">
          今日はみんなで <span className="font-bold text-accent">{game.title}</span>{' '}
          に挑戦！全員同じお題・専用ランキングで競おう
        </p>
      </div>
      <Suspense fallback={<p className="py-20 text-center text-muted">読み込み中…</p>}>
        <GameShell key={`daily-${id}`} game={game} Component={Component} mode="daily" seed={seed} />
      </Suspense>
    </Layout>
  )
}
