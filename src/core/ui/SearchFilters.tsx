import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  GAME_DIFFICULTY_ORDER,
  type GameCategory,
  type GameDifficulty,
} from '../types'
import { cn } from '../lib/cn'

export type GameSort = 'new' | 'popular' | 'difficulty' | 'minutes'

type FilterValue<T extends string> = T | 'all'

export interface FilterOption<T extends string> {
  value: T
  count: number
}

interface SearchFiltersProps {
  query: string
  onQueryChange: (query: string) => void
  categories: FilterOption<GameCategory>[]
  selectedCategory: FilterValue<GameCategory>
  onCategoryChange: (category: FilterValue<GameCategory>) => void
  difficulties: FilterOption<GameDifficulty>[]
  selectedDifficulty: FilterValue<GameDifficulty>
  onDifficultyChange: (difficulty: FilterValue<GameDifficulty>) => void
  sortBy: GameSort
  onSortChange: (sort: GameSort) => void
  resultCount: number
  totalCount: number
  onReset: () => void
}

const DIFFICULTY_LABELS: Record<GameDifficulty, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
}

const SORT_OPTIONS: { value: GameSort; label: string }[] = [
  { value: 'new', label: '新着順' },
  { value: 'popular', label: '人気順' },
  { value: 'difficulty', label: '難易度順' },
  { value: 'minutes', label: 'プレイ時間順' },
]

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'focus-ring inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-extrabold transition duration-200',
        active
          ? 'border-cyan/55 bg-cyan/15 text-fg shadow-[0_0_26px_-16px_rgba(34,211,238,0.85)]'
          : 'border-line bg-white/[0.035] text-muted hover:border-cyan/35 hover:bg-white/[0.06] hover:text-fg',
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}

export function SearchFilters({
  query,
  onQueryChange,
  categories,
  selectedCategory,
  onCategoryChange,
  difficulties,
  selectedDifficulty,
  onDifficultyChange,
  sortBy,
  onSortChange,
  resultCount,
  totalCount,
  onReset,
}: SearchFiltersProps) {
  const hasActiveFilters =
    query.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedDifficulty !== 'all' ||
    sortBy !== 'new'

  return (
    <section id="games" className="scroll-mt-24 py-8">
      <div className="rounded-[1.5rem] border border-line bg-white/[0.035] p-4 shadow-[var(--soft-shadow)] backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <label className="focus-within:focus-ring flex min-h-14 flex-1 items-center gap-3 rounded-2xl border border-line bg-[#0b1020]/80 px-4 text-muted transition focus-within:border-cyan/45">
            <Search size={20} className="shrink-0 text-cyan" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-base font-bold text-fg outline-none placeholder:text-faint"
              placeholder="ゲーム名・カテゴリで検索"
              aria-label="ゲーム名・カテゴリで検索"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-full text-faint transition hover:bg-white/10 hover:text-fg"
                aria-label="検索をクリア"
              >
                <X size={17} />
              </button>
            )}
          </label>

          <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-[#0b1020]/80 px-4 text-sm font-extrabold text-muted xl:w-72">
            <SlidersHorizontal size={18} className="text-yellow" />
            <span className="shrink-0">Sort</span>
            <select
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value as GameSort)}
              className="focus-ring min-h-10 flex-1 rounded-xl border border-transparent bg-transparent px-2 text-sm font-extrabold text-fg outline-none"
              aria-label="並び替え"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-surface text-fg">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="mb-2 text-xs font-black tracking-[0.18em] text-faint uppercase">
              Category
            </p>
            <div className="portal-scrollbar flex gap-2 overflow-x-auto pb-1">
              <Chip active={selectedCategory === 'all'} onClick={() => onCategoryChange('all')}>
                All
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-muted">
                  {totalCount}
                </span>
              </Chip>
              {categories.map((category) => (
                <Chip
                  key={category.value}
                  active={selectedCategory === category.value}
                  onClick={() => onCategoryChange(category.value)}
                >
                  {category.value}
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-muted">
                    {category.count}
                  </span>
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-black tracking-[0.18em] text-faint uppercase">
              Difficulty
            </p>
            <div className="portal-scrollbar flex gap-2 overflow-x-auto pb-1">
              <Chip
                active={selectedDifficulty === 'all'}
                onClick={() => onDifficultyChange('all')}
              >
                All
              </Chip>
              {GAME_DIFFICULTY_ORDER.map((difficulty) => {
                const option = difficulties.find((item) => item.value === difficulty)
                if (!option) return null
                return (
                  <Chip
                    key={difficulty}
                    active={selectedDifficulty === difficulty}
                    onClick={() => onDifficultyChange(difficulty)}
                  >
                    {DIFFICULTY_LABELS[difficulty]}
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-muted">
                      {option.count}
                    </span>
                  </Chip>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 text-sm font-bold text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            {resultCount} / {totalCount} games
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-line px-4 font-extrabold text-fg transition hover:border-cyan/45 hover:bg-white/[0.06]"
            >
              リセット
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
