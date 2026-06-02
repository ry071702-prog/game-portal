import type { GameGenre } from '../types'

interface GenreInfo {
  label: string
  /** Tailwind クラス: バッジの色 */
  badgeClass: string
}

export const GENRES: Record<GameGenre, GenreInfo> = {
  puzzle: {
    label: 'パズル',
    badgeClass: 'bg-violet-500/15 text-violet-700 ring-violet-500/40 dark:text-violet-300',
  },
  arcade: {
    label: 'アーケード',
    badgeClass: 'bg-[#ffe000]/20 text-amber-700 ring-[#ffe000]/50 dark:text-[#ffe000]',
  },
  board: {
    label: 'ボード',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/40 dark:text-emerald-300',
  },
}

/** 一覧で表示するジャンルの順序 */
export const GENRE_ORDER: GameGenre[] = ['puzzle', 'arcade', 'board']
