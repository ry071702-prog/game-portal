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
      className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-400/50 hover:bg-white/[0.06] hover:shadow-[0_0_24px_-6px_rgba(34,211,238,0.5)]"
    >
      <div
        className="flex h-24 items-center justify-center rounded-xl text-5xl transition group-hover:scale-105"
        style={{ background: game.accentColor ?? 'rgba(255,255,255,0.05)' }}
      >
        {game.thumbnail}
      </div>
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-white group-hover:text-cyan-300">{game.title}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${genre.badgeClass}`}
        >
          {genre.label}
        </span>
      </div>
      <p className="text-sm text-gray-400">{game.description}</p>
      {best > 0 && (
        <p className="text-xs text-gray-500">
          ベスト: <span className="font-pixel text-yellow-300">{best}</span>
        </p>
      )}
    </Link>
  )
}
