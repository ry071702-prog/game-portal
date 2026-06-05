import type { ReactNode } from 'react'
import type { GameManifest } from '../types'
import { GameCard, type GameCardVariant } from './GameCard'

interface GameGridProps {
  id?: string
  title: string
  eyebrow?: string
  description?: string
  games: GameManifest[]
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  action?: ReactNode
  variant?: GameCardVariant
}

export function GameGrid({
  id,
  title,
  eyebrow,
  description,
  games,
  emptyTitle = '条件に合うゲームが見つかりませんでした',
  emptyDescription = '検索条件を変更してみてください。',
  emptyAction,
  action,
  variant = 'default',
}: GameGridProps) {
  return (
    <section id={id} className="scroll-mt-24 py-10">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && (
            <p className="text-xs font-black tracking-[0.2em] text-cyan uppercase">{eyebrow}</p>
          )}
          <h2 className="font-display mt-2 text-3xl text-fg sm:text-4xl">{title}</h2>
          {description && (
            <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-muted">{description}</p>
          )}
        </div>
        {action}
      </div>
      {games.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} variant={variant} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-line bg-white/[0.035] px-5 py-12 text-center">
          <p className="font-display text-2xl text-fg">{emptyTitle}</p>
          <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-6 text-muted">
            {emptyDescription}
          </p>
          {emptyAction && <div className="mt-5 flex justify-center">{emptyAction}</div>}
        </div>
      )}
    </section>
  )
}
