import { lazy, Suspense, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { gameById } from '../core/registry'
import { useRecentStore } from '../core/store/recentStore'
import { GameShell } from '../core/ui/GameShell'
import { Layout } from '../core/ui/Layout'
import { Seo } from '../core/ui/Seo'
import NotFoundPage from './NotFoundPage'

export default function GamePage() {
  const { id } = useParams<{ id: string }>()
  const game = id ? gameById.get(id) : undefined
  const pushRecent = useRecentStore((s) => s.push)

  // manifest が変わったときだけ lazy コンポーネントを作り直す
  const Component = useMemo(
    () => (game ? lazy(game.component) : null),
    [game],
  )

  useEffect(() => {
    if (game) pushRecent(game.id)
  }, [game, pushRecent])

  if (!game || !Component) return <NotFoundPage />

  return (
    <Layout showBack>
      <Seo title={`${game.title} — Game Portal`} description={game.description} />
      <Suspense
        fallback={<p className="py-20 text-center text-muted">読み込み中…</p>}
      >
        <GameShell key={game.id} game={game} Component={Component} />
      </Suspense>
    </Layout>
  )
}
