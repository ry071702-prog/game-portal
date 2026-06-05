import type { GameManifest } from '../types'
import { GameCard } from './GameCard'

interface FeaturedGamesProps {
  games: GameManifest[]
}

export function FeaturedGames({ games }: FeaturedGamesProps) {
  if (games.length === 0) return null

  return (
    <section id="popular" className="scroll-mt-24 py-8">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black tracking-wide text-yellow uppercase">Popular</p>
          <h2 className="font-display mt-1 text-3xl text-fg">人気ゲーム</h2>
        </div>
        <p className="text-sm font-bold text-muted">おすすめに設定されたゲーム</p>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {games.map((game) => (
          <GameCard key={game.id} game={game} variant="featured" />
        ))}
      </div>
    </section>
  )
}
