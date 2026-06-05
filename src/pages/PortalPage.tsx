import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Trophy } from 'lucide-react'
import { gameById, games } from '../core/registry'
import { GENRES, GENRE_ORDER } from '../core/lib/genres'
import { dailyGameId, todayJST } from '../core/lib/daily'
import { useFavoritesStore } from '../core/store/favoritesStore'
import { useRecentStore } from '../core/store/recentStore'
import type { GameGenre, GameManifest } from '../core/types'
import { CategoryTabs, type CategoryTabItem, type PortalFilter } from '../core/ui/CategoryTabs'
import { FeaturedGames } from '../core/ui/FeaturedGames'
import { GameGrid } from '../core/ui/GameGrid'
import { Hero } from '../core/ui/Hero'
import { Layout } from '../core/ui/Layout'
import { Seo } from '../core/ui/Seo'

function resolveGames(ids: string[]): GameManifest[] {
  return ids
    .map((id) => gameById.get(id))
    .filter((game): game is GameManifest => game != null)
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function matchesQuery(game: GameManifest, query: string): boolean {
  if (!query) return true
  const target = [
    game.title,
    game.description,
    GENRES[game.genre].label,
    game.difficulty ?? '',
    game.minutes != null ? `${game.minutes}分` : '',
  ]
    .join(' ')
    .toLowerCase()
  return target.includes(query)
}

function filterByTab(
  list: GameManifest[],
  filter: PortalFilter,
  favoriteIds: string[],
): GameManifest[] {
  if (filter === 'all') return list
  if (filter === 'featured') return list.filter((game) => game.featured)
  if (filter === 'new') return list.filter((game) => game.isNew)
  if (filter === 'favorites') return list.filter((game) => favoriteIds.includes(game.id))
  if (filter === 'short') return list.filter((game) => (game.minutes ?? Infinity) <= 3)

  const genre = filter.replace('genre:', '') as GameGenre
  return list.filter((game) => game.genre === genre)
}

export default function PortalPage() {
  const [activeFilter, setActiveFilter] = useState<PortalFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const favoriteIds = useFavoritesStore((s) => s.ids)
  const recentIds = useRecentStore((s) => s.ids)

  const today = todayJST()
  const dailyGame = gameById.get(dailyGameId(today)) ?? games[0]
  const featuredGames = games.filter((game) => game.featured)
  const newGames = games.filter((game) => game.isNew)
  const shortGames = games.filter((game) => (game.minutes ?? Infinity) <= 3)
  const favoriteGames = resolveGames(favoriteIds)
  const recentGames = resolveGames(recentIds)
  const previewGame = featuredGames[0] ?? dailyGame

  const tabs = useMemo<CategoryTabItem[]>(() => {
    const items: CategoryTabItem[] = [
      { key: 'all', label: 'すべて', count: games.length },
    ]

    if (featuredGames.length > 0) {
      items.push({ key: 'featured', label: '人気', count: featuredGames.length })
    }
    if (newGames.length > 0) {
      items.push({ key: 'new', label: '新着', count: newGames.length })
    }

    items.push({ key: 'favorites', label: 'お気に入り', count: favoriteGames.length })

    for (const genre of GENRE_ORDER) {
      const count = games.filter((game) => game.genre === genre).length
      if (count > 0) {
        items.push({ key: `genre:${genre}`, label: GENRES[genre].label, count })
      }
    }

    if (shortGames.length > 0) {
      items.push({ key: 'short', label: '3分で遊べる', count: shortGames.length })
    }

    return items
  }, [favoriteGames.length, featuredGames.length, newGames.length, shortGames.length])

  const filteredGames = useMemo(() => {
    const byTab = filterByTab(games, activeFilter, favoriteIds)
    const query = normalize(searchQuery)
    return byTab.filter((game) => matchesQuery(game, query))
  }, [activeFilter, favoriteIds, searchQuery])

  return (
    <Layout size="wide">
      <Seo
        title="Game Portal — 無料ミニゲーム集"
        description="登録不要・無料で遊べるミニゲーム集。2048・スネーク・神経衰弱など。"
      />

      <Hero
        previewGame={previewGame}
        gameCount={games.length}
        featuredCount={featuredGames.length}
      />

      <CategoryTabs
        tabs={tabs}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        resultCount={filteredGames.length}
      />

      <FeaturedGames games={featuredGames} />

      <GameGrid
        id="new"
        eyebrow="New"
        title="新着ゲーム"
        games={newGames}
      />

      <GameGrid
        id="daily"
        eyebrow={today}
        title="今日のおすすめ"
        games={[dailyGame]}
        variant="featured"
        action={
          <Link to="/daily" className="btn-soft">
            今日のチャレンジ
            <ArrowRight size={17} />
          </Link>
        }
      />

      <GameGrid
        id="quick"
        eyebrow="Quick Play"
        title="3分で遊べる"
        games={shortGames}
      />

      {recentGames.length > 0 && (
        <GameGrid
          id="recent"
          eyebrow="Recent"
          title="最近遊んだ"
          games={recentGames}
          variant="compact"
        />
      )}

      {favoriteGames.length > 0 && (
        <GameGrid
          id="favorites"
          eyebrow="Favorites"
          title="お気に入り"
          games={favoriteGames}
          variant="compact"
        />
      )}

      <section className="py-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-line bg-bg-panel p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black tracking-wide text-yellow uppercase">Leaderboard</p>
            <h2 className="font-display mt-1 text-3xl text-fg">ランキング</h2>
            <p className="mt-2 text-sm font-bold text-muted">
              今日 / 全期間のスコアボードへ移動します。
            </p>
          </div>
          <Link to="/leaderboard" className="btn-primary shrink-0">
            <Trophy size={18} />
            ランキングを見る
          </Link>
        </div>
      </section>

      <GameGrid
        id="library"
        eyebrow="All Games"
        title="ゲーム一覧"
        games={filteredGames}
        emptyMessage={
          activeFilter === 'favorites'
            ? 'お気に入りに追加したゲームはまだありません。'
            : '条件に合うゲームがありません。'
        }
      />
    </Layout>
  )
}
