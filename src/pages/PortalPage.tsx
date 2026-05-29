import { games } from '../core/registry'
import { GENRES, GENRE_ORDER } from '../core/lib/genres'
import { GameCard } from '../core/ui/GameCard'
import { Layout } from '../core/ui/Layout'
import { Seo } from '../core/ui/Seo'

export default function PortalPage() {
  return (
    <Layout>
      <Seo
        title="Game Portal — 無料ミニゲーム集"
        description="登録不要・無料で遊べるミニゲーム集。2048・スネーク・神経衰弱など。"
      />
      <h1 className="mb-1 text-2xl font-bold text-white">ミニゲーム集</h1>
      <p className="mb-6 text-sm text-gray-400">
        登録不要・無料。スマホでもPCでも遊べます。
      </p>

      {GENRE_ORDER.map((genre) => {
        const list = games.filter((g) => g.genre === genre)
        if (list.length === 0) return null
        return (
          <section key={genre} className="mb-8">
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-400 uppercase">
              {GENRES[genre].label}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {list.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        )
      })}
    </Layout>
  )
}
