import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { GameManifest } from '../types'
import { GENRES } from '../lib/genres'
import { useScoreStore } from '../store/scoreStore'

export function GameCard({ game }: { game: GameManifest }) {
  const best = useScoreStore((s) => s.best[game.id] ?? 0)
  const genre = GENRES[game.genre]
  // 生成済みアイコン (public/icons/<id>.png) があれば画像、無ければ絵文字にフォールバック
  const [iconFailed, setIconFailed] = useState(false)

  return (
    <Link
      to={`/games/${game.id}`}
      className="glass-card group flex flex-col gap-3 rounded-2xl p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffe000]"
    >
      <div
        className="flex h-24 items-center justify-center overflow-hidden rounded-xl text-5xl transition group-hover:scale-110"
        style={{ background: game.accentColor ?? 'rgba(255,255,255,0.05)' }}
      >
        {iconFailed ? (
          game.thumbnail
        ) : (
          <img
            src={`/icons/${game.id}.png`}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain"
            onError={() => setIconFailed(true)}
          />
        )}
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
