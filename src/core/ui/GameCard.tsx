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
      className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25 hover:bg-white/[0.06]"
    >
      <div
        className="flex h-24 items-center justify-center rounded-xl text-5xl"
        style={{ background: game.accentColor ?? 'rgba(255,255,255,0.05)' }}
      >
        {game.thumbnail}
      </div>
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-white">{game.title}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${genre.badgeClass}`}
        >
          {genre.label}
        </span>
      </div>
      <p className="text-sm text-gray-400">{game.description}</p>
      {best > 0 && <p className="text-xs text-gray-500">ベスト: {best}</p>}
    </Link>
  )
}
