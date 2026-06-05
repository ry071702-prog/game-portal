import type { ReactNode } from 'react'
import type { GameManifest } from '../types'
import { GameCard, type GameCardVariant } from './GameCard'

interface GameGridProps {
  id?: string
  title: string
  eyebrow?: string
  games: GameManifest[]
  emptyMessage?: string
  action?: ReactNode
  variant?: GameCardVariant
}

export function GameGrid({
  id,
  title,
  eyebrow,
  games,
  emptyMessage = '条件に合うゲームがありません。',
  action,
  variant = 'default',
}: GameGridProps) {
  return (
    <section id={id} className="scroll-mt-24 py-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && <p className="text-xs font-black tracking-wide text-cyan uppercase">{eyebrow}</p>}
          <h2 className="font-display mt-1 text-3xl text-fg">{title}</h2>
        </div>
        {action}
      </div>
      {games.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} variant={variant} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-bg-panel px-5 py-10 text-center text-sm font-bold text-muted">
          {emptyMessage}
        </div>
      )}
    </section>
  )
}
