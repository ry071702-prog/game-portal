import type { GameManifest } from '../types'
import { GameCard } from './GameCard'

interface FeaturedGamesProps {
  games: GameManifest[]
}

export function FeaturedGames({ games }: FeaturedGamesProps) {
  const featuredGames = games.slice(0, 3)
  if (featuredGames.length === 0) return null

  return (
    <section id="popular" className="scroll-mt-24 py-10">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.2em] text-yellow uppercase">Featured</p>
          <h2 className="font-display mt-2 text-3xl text-fg sm:text-4xl">Featured Games</h2>
        </div>
        <p className="max-w-md text-sm font-bold leading-6 text-muted">
          編集者おすすめのゲーム。まず遊ぶならここから。
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {featuredGames.map((game) => (
          <GameCard key={game.id} game={game} variant="featured" />
        ))}
      </div>
    </section>
  )
}
