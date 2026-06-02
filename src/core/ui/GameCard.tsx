import { Link } from 'react-router-dom'
import type { GameManifest } from '../types'
import { GENRES } from '../lib/genres'
import { useScoreStore } from '../store/scoreStore'

export function GameCard({ game }: { game: GameManifest }) {
  const best = useScoreStore((s) => s.best[game.id] ?? 0)
  const genre = GENRES[game.genre]

  return (
    <Link
      to={`/games/${game.id}`}
      className="group flex flex-col gap-3 rounded-2xl border-2 border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-[#ffe000] hover:shadow-[4px_4px_0_0_#ffe000]"
    >
      <div
        className="flex h-24 items-center justify-center rounded-xl text-5xl transition group-hover:scale-110"
        style={{ background: game.accentColor ?? 'rgba(255,255,255,0.05)' }}
      >
        {game.thumbnail}
      </div>
      <div className="flex items-center gap-2">
        <h3 className="font-display text-lg text-fg">{game.title}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${genre.badgeClass}`}
        >
          {genre.label}
        </span>
      </div>
      <p className="text-sm text-muted">{game.description}</p>
      {best > 0 && (
        <p className="text-xs text-faint">
          ベスト: <span className="font-display text-gold">{best}</span>
        </p>
      )}
    </Link>
  )
}
