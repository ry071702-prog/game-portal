import { useMemo, useState } from 'react'
import { games } from '../core/registry'
import { GENRES } from '../core/lib/genres'
import {
  GAME_CATEGORY_ORDER,
  GAME_DIFFICULTY_ORDER,
  type GameCategory,
  type GameDifficulty,
  type GameManifest,
} from '../core/types'
import { ComingSoon } from '../core/ui/ComingSoon'
import { FeaturedGames } from '../core/ui/FeaturedGames'
import { GameGrid } from '../core/ui/GameGrid'
import { Hero } from '../core/ui/Hero'
import { Layout } from '../core/ui/Layout'
import { SearchFilters, type FilterOption, type GameSort } from '../core/ui/SearchFilters'
import { Seo } from '../core/ui/Seo'

type FilterValue<T extends string> = T | 'all'

const DIFFICULTY_RANK: Record<GameDifficulty, number> = {
  easy: 0,
  normal: 1,
  hard: 2,
}

const registrationOrder = new Map(games.map((game, index) => [game.id, index]))

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function matchesQuery(game: GameManifest, query: string): boolean {
  if (!query) return true
  const genre = GENRES[game.genre]
  const target = [
    game.title,
    game.description,
    game.category ?? '',
    genre.label,
    game.difficulty ?? '',
    game.minutes != null ? `${game.minutes}分 ${game.minutes} min` : '',
  ]
    .join(' ')
    .toLowerCase()
  return target.includes(query)
}

function compareRegistration(a: GameManifest, b: GameManifest): number {
  return (registrationOrder.get(a.id) ?? 0) - (registrationOrder.get(b.id) ?? 0)
}

function sortGames(list: GameManifest[], sortBy: GameSort): GameManifest[] {
  const sorted = [...list]
  sorted.sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.popularity ?? 0) - (a.popularity ?? 0) || compareRegistration(a, b)
    }
    if (sortBy === 'difficulty') {
      return (
        DIFFICULTY_RANK[a.difficulty ?? 'normal'] -
          DIFFICULTY_RANK[b.difficulty ?? 'normal'] ||
        (a.minutes ?? Infinity) - (b.minutes ?? Infinity) ||
        compareRegistration(a, b)
      )
    }
    if (sortBy === 'minutes') {
      return (a.minutes ?? Infinity) - (b.minutes ?? Infinity) || compareRegistration(a, b)
    }

    return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) || compareRegistration(a, b)
  })
  return sorted
}

function countByValue<T extends string>(
  values: readonly T[],
  resolve: (game: GameManifest) => T | undefined,
): FilterOption<T>[] {
  return values
    .map((value) => ({
      value,
      count: games.filter((game) => resolve(game) === value).length,
    }))
    .filter((option) => option.count > 0)
}

export default function PortalPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<FilterValue<GameCategory>>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<FilterValue<GameDifficulty>>('all')
  const [sortBy, setSortBy] = useState<GameSort>('new')

  const categoryOptions = useMemo(
    () => countByValue(GAME_CATEGORY_ORDER, (game) => game.category),
    [],
  )
  const difficultyOptions = useMemo(
    () => countByValue(GAME_DIFFICULTY_ORDER, (game) => game.difficulty),
    [],
  )
  const featuredGames = useMemo(
    () => sortGames(games.filter((game) => game.featured), 'popular').slice(0, 3),
    [],
  )
  const newGames = useMemo(() => games.filter((game) => game.isNew), [])
  const previewGame = featuredGames[0] ?? games[0]

  const filteredGames = useMemo(() => {
    const query = normalize(searchQuery)
    const filtered = games.filter((game) => {
      if (selectedCategory !== 'all' && game.category !== selectedCategory) return false
      if (selectedDifficulty !== 'all' && game.difficulty !== selectedDifficulty) return false
      return matchesQuery(game, query)
    })
    return sortGames(filtered, sortBy)
  }, [searchQuery, selectedCategory, selectedDifficulty, sortBy])

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedDifficulty('all')
    setSortBy('new')
  }

  return (
    <Layout size="wide">
      <Seo
        title="Game Portal — 無料ミニゲーム集"
        description="短時間で遊べる無料ミニゲーム集。2048・スネーク・神経衰弱など。"
      />

      <Hero
        previewGame={previewGame}
        gameCount={games.length}
        featuredCount={featuredGames.length}
      />

      <SearchFilters
        query={searchQuery}
        onQueryChange={setSearchQuery}
        categories={categoryOptions}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        difficulties={difficultyOptions}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        sortBy={sortBy}
        onSortChange={setSortBy}
        resultCount={filteredGames.length}
        totalCount={games.length}
        onReset={resetFilters}
      />

      <FeaturedGames games={featuredGames} />

      <GameGrid
        id="new"
        eyebrow="New"
        title="新着ゲーム"
        description="最近追加したミニゲーム。短時間で試しやすいタイトルを中心に並べています。"
        games={newGames}
      />

      <GameGrid
        id="library"
        eyebrow="Library"
        title="すべてのゲーム"
        description="検索条件に合わせてリアルタイムで絞り込まれます。"
        games={filteredGames}
        emptyAction={
          <button type="button" onClick={resetFilters} className="btn-primary">
            検索条件をリセット
          </button>
        }
      />

      <ComingSoon />
    </Layout>
  )
}
