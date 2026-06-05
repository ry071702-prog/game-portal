import { Search, X } from 'lucide-react'
import type { GameGenre } from '../types'
import { cn } from '../lib/cn'

export type PortalFilter = 'all' | 'featured' | 'new' | 'favorites' | 'short' | `genre:${GameGenre}`

export interface CategoryTabItem {
  key: PortalFilter
  label: string
  count: number
}

interface CategoryTabsProps {
  tabs: CategoryTabItem[]
  activeFilter: PortalFilter
  onFilterChange: (filter: PortalFilter) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  resultCount: number
}

export function CategoryTabs({
  tabs,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  resultCount,
}: CategoryTabsProps) {
  return (
    <section id="genres" className="scroll-mt-24 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black tracking-wide text-cyan uppercase">Library</p>
          <h2 className="font-display mt-1 text-3xl text-fg">ゲームを探す</h2>
        </div>
        <label className="focus-within:focus-ring flex min-h-12 w-full items-center gap-2 rounded-2xl border border-line bg-bg-panel px-4 text-muted lg:max-w-md">
          <Search size={18} />
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-fg outline-none placeholder:text-faint"
            placeholder="ゲーム名・ジャンルで検索"
            aria-label="ゲーム検索"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="focus-ring rounded-full p-1 text-faint hover:bg-surface-2 hover:text-fg"
              aria-label="検索をクリア"
            >
              <X size={16} />
            </button>
          )}
        </label>
      </div>

      <div className="portal-scrollbar mt-5 flex gap-2 overflow-x-auto pb-2" role="tablist">
        {tabs.map((tab) => {
          const active = tab.key === activeFilter
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onFilterChange(tab.key)}
              className={cn(
                'focus-ring flex min-h-11 shrink-0 items-center gap-2 rounded-2xl border px-4 text-sm font-black transition',
                active
                  ? 'border-yellow bg-yellow text-bg-base'
                  : 'border-line bg-bg-panel text-muted hover:border-cyan/50 hover:text-fg',
              )}
              role="tab"
              aria-selected={active}
            >
              {tab.label}
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs',
                  active ? 'bg-bg-base/15 text-bg-base' : 'bg-surface-2 text-faint',
                )}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      <p className="mt-2 text-xs font-bold text-faint">{resultCount}件</p>
    </section>
  )
}
