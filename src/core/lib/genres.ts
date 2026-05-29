import type { GameGenre } from '../types'

interface GenreInfo {
  label: string
  /** Tailwind クラス: バッジの色 */
  badgeClass: string
}

export const GENRES: Record<GameGenre, GenreInfo> = {
  puzzle: { label: 'パズル', badgeClass: 'bg-violet-500/15 text-violet-300 ring-violet-500/30' },
  arcade: { label: 'アーケード', badgeClass: 'bg-cyan-500/15 text-cyan-300 ring-cyan-500/30' },
  board: { label: 'ボード', badgeClass: 'bg-amber-500/15 text-amber-300 ring-amber-500/30' },
}

/** 一覧で表示するジャンルの順序 */
export const GENRE_ORDER: GameGenre[] = ['puzzle', 'arcade', 'board']
